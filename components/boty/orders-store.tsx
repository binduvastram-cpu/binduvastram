"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Order, OrderStatus } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-orders"

interface OrdersContextType {
  orders: Order[]
  hydrated: boolean
  placeOrder: (order: Order) => void
  updateOrderStatus: (id: string, status: OrderStatus) => void
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined)

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setOrders(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Order[]) => {
    setOrders(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const placeOrder = (order: Order) => {
    persist([order, ...orders])
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    persist(orders.map((o) => (o.id === id ? { ...o, orderStatus: status } : o)))
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
