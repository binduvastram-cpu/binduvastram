"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Order, OrderItem, OrderStatus } from "@/lib/types"

const SELECT = `
  id, order_code, customer_name, customer_phone, customer_address, customer_pincode,
  total, payment_method, payment_status, order_status, created_at,
  order_items ( product_id, product_name, size, price_at_purchase, quantity, image_url )
`

type OrderRow = {
  id: string
  order_code: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_pincode: string
  total: number
  payment_method: "COD"
  payment_status: Order["paymentStatus"]
  order_status: OrderStatus
  created_at: string
  order_items: {
    product_id: string | null
    product_name: string
    size: string | null
    price_at_purchase: number
    quantity: number
    image_url: string | null
  }[]
}

function rowToOrder(row: OrderRow): Order {
  return {
    id: row.id,
    orderCode: row.order_code,
    items: (row.order_items ?? []).map((i) => ({
      productId: i.product_id ?? "",
      name: i.product_name,
      size: i.size ?? undefined,
      price: Number(i.price_at_purchase),
      quantity: i.quantity,
      image: i.image_url ?? "",
    })),
    total: Number(row.total),
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerAddress: row.customer_address,
    customerPincode: row.customer_pincode,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    createdAt: row.created_at,
  }
}

export interface PlaceOrderInput {
  items: OrderItem[]
  subtotal: number
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  customerPincode: string
}

interface OrdersContextType {
  orders: Order[]
  hydrated: boolean
  placeOrder: (input: PlaceOrderInput) => Promise<Order>
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [orders, setOrders] = useState<Order[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("orders").select(SELECT).order("created_at", { ascending: false })
    setOrders(((data as unknown as OrderRow[]) ?? []).map(rowToOrder))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))

    const channel = supabase
      .channel("orders-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => fetchAll())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const placeOrder = async (input: PlaceOrderInput): Promise<Order> => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: orderRow, error } = await supabase
      .from("orders")
      .insert({
        profile_id: user?.id ?? null,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        customer_address: input.customerAddress,
        customer_pincode: input.customerPincode,
        subtotal: input.subtotal,
        total: input.total,
      })
      .select("id, order_code, created_at")
      .single()

    if (error || !orderRow) throw new Error(error?.message ?? "Failed to place order")

    await supabase.from("order_items").insert(
      input.items.map((item) => ({
        order_id: orderRow.id,
        product_id: item.productId || null,
        product_name: item.name,
        size: item.size ?? null,
        price_at_purchase: item.price,
        quantity: item.quantity,
        image_url: item.image,
      }))
    )

    const newOrder: Order = {
      id: orderRow.id,
      orderCode: orderRow.order_code,
      items: input.items,
      total: input.total,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      customerAddress: input.customerAddress,
      customerPincode: input.customerPincode,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      createdAt: orderRow.created_at,
    }
    setOrders((current) => [newOrder, ...current])
    return newOrder
  }

  const updateOrderStatus = async (id: string, status: OrderStatus) => {
    await supabase.from("orders").update({ order_status: status }).eq("id", id)
    setOrders((current) => current.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)))
  }

  return (
    <OrdersContext.Provider value={{ orders, hydrated, placeOrder, updateOrderStatus }}>
      {children}
    </OrdersContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrdersContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrdersProvider")
  }
  return context
}
