"use client"

import { useState } from "react"
import { Search, ShoppingBag } from "lucide-react"
import { useOrders } from "@/components/boty/orders-store"
import type { OrderStatus } from "@/lib/types"

const STATUS_OPTIONS: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Packed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
]

export default function AdminOrdersPage() {
  const { orders, hydrated, updateOrderStatus } = useOrders()
  const [search, setSearch] = useState("")

  if (!hydrated) return null

  const filtered = orders.filter(
    (o) => o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerPhone.includes(search) || o.id.includes(search)
  )

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Orders</h1>
      <p className="text-muted-foreground mb-6">{orders.length} orders placed on this device (Cash on Delivery only, for now).</p>

      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, phone, order ID..."
          className="w-full bg-card border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 boty-transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <ShoppingBag className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <div key={order.id} className="bg-card rounded-2xl boty-shadow p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-medium text-foreground">Order #{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">₹{order.total.toLocaleString("en-IN")}</p>
                  <p className="text-xs text-muted-foreground">COD • {order.paymentStatus}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3">
                {order.items.map((item) => `${item.name} × ${item.quantity}`).join(", ")}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-muted-foreground max-w-sm">
                  Ship to: {order.customerAddress}, {order.customerPincode}
                </p>
                <select
                  value={order.orderStatus}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                  className="bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
