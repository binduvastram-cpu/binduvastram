"use client"

import { useState } from "react"
import { Search, ShoppingBag, MessageCircle } from "lucide-react"
import { useOrders } from "@/components/boty/orders-store"
import type { OrderStatus } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { buildWhatsAppLink } from "@/lib/whatsapp"
import { STATUS_MESSAGES } from "@/lib/order-status-messages"

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
    (o) =>
      o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone.includes(search) ||
      o.orderCode.toLowerCase().includes(search.toLowerCase())
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
                  <p className="font-medium text-foreground">Order #{order.orderCode}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.customerName} • {order.customerPhone}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                  <p className="text-xs text-muted-foreground">COD • {order.paymentStatus}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground mb-3 space-y-1">
                {order.items.map((item, index) => (
                  <p key={`${item.productId}-${index}`}>
                    <span className="text-foreground/60">#{item.productId.slice(-6).toUpperCase() || "—"}</span>
                    {" • "}
                    {item.name}
                    {item.size ? ` (${item.size})` : ""} × {item.quantity} — {formatPrice(item.price * item.quantity)}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <p className="text-xs text-muted-foreground max-w-sm">
                  Ship to: {order.customerAddress}, {order.customerPincode}
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={buildWhatsAppLink(order.customerPhone, STATUS_MESSAGES[order.orderStatus](order))}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Message customer on WhatsApp about this status"
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-[#25D366] text-white boty-transition hover:opacity-90"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
