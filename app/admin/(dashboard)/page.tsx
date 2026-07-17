"use client"

import { useMemo } from "react"
import Link from "next/link"
import { IndianRupee, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useOrders } from "@/components/boty/orders-store"
import { useProducts } from "@/components/boty/products-store"
import { categories } from "@/lib/products"
import { formatPrice } from "@/lib/format"

function StatTile({ icon: Icon, label, value }: { icon: typeof IndianRupee; label: string; value: string }) {
  return (
    <div className="bg-card rounded-2xl boty-shadow p-5">
      <div className="w-9 h-9 rounded-full bg-background flex items-center justify-center mb-3">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <p className="text-2xl font-medium text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}

export default function AdminOverviewPage() {
  const { orders, hydrated: ordersHydrated } = useOrders()
  const { products, hydrated: productsHydrated } = useProducts()

  const revenue = useMemo(
    () => orders.filter((o) => o.orderStatus !== "Cancelled").reduce((sum, o) => sum + o.total, 0),
    [orders]
  )

  const lowStockProducts = useMemo(
    () => products.filter((p) => p.isActive !== false && p.stock < 5),
    [products]
  )

  const bestSellers = useMemo(() => {
    const qtyById = new Map<string, number>()
    orders.forEach((o) => o.items.forEach((item) => {
      qtyById.set(item.productId, (qtyById.get(item.productId) ?? 0) + item.quantity)
    }))
    return Array.from(qtyById.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([productId, qty]) => ({ product: products.find((p) => p.id === productId), qty }))
      .filter((entry) => entry.product)
  }, [orders, products])

  const revenueByDay = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (13 - i))
      return d.toISOString().slice(0, 10)
    })
    const totalsByDay = new Map<string, number>()
    orders.forEach((o) => {
      if (o.orderStatus === "Cancelled") return
      const day = o.createdAt.slice(0, 10)
      totalsByDay.set(day, (totalsByDay.get(day) ?? 0) + o.total)
    })
    return days.map((day) => ({
      day: day.slice(5),
      revenue: totalsByDay.get(day) ?? 0,
    }))
  }, [orders])

  const revenueByCategory = useMemo(() => {
    const totals = new Map<string, number>()
    orders.forEach((o) => {
      if (o.orderStatus === "Cancelled") return
      o.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId)
        const category = product?.category ?? "sarees"
        totals.set(category, (totals.get(category) ?? 0) + item.price * item.quantity)
      })
    })
    return categories.map((c) => ({ category: c.label, revenue: totals.get(c.value) ?? 0 }))
  }, [orders, products])

  if (!ordersHydrated || !productsHydrated) return null

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Overview</h1>
      <p className="text-muted-foreground mb-8">Revenue and activity from real local orders on this device.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatTile icon={IndianRupee} label="Total Revenue" value={formatPrice(revenue)} />
        <StatTile icon={ShoppingBag} label="Orders" value={String(orders.length)} />
        <StatTile icon={AlertTriangle} label="Low Stock Items" value={String(lowStockProducts.length)} />
        <StatTile icon={TrendingUp} label="Active Products" value={String(products.filter((p) => p.isActive !== false).length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card rounded-2xl boty-shadow p-5">
          <h2 className="font-medium text-foreground mb-4">Revenue — last 14 days</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl boty-shadow p-5">
          <h2 className="font-medium text-foreground mb-4">Revenue by Category</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="category" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Bar dataKey="revenue" fill="var(--secondary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-2xl boty-shadow p-5">
          <h2 className="font-medium text-foreground mb-4">Best Sellers</h2>
          {bestSellers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet — best sellers appear once orders come in.</p>
          ) : (
            <ul className="space-y-3">
              {bestSellers.map((entry) => (
                <li key={entry.product!.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{entry.product!.name}</span>
                  <span className="text-muted-foreground">{entry.qty} sold</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-card rounded-2xl boty-shadow p-5">
          <h2 className="font-medium text-foreground mb-4">Low Stock Alerts</h2>
          {lowStockProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing low on stock right now.</p>
          ) : (
            <ul className="space-y-3">
              {lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between text-sm">
                  <Link href="/admin/products" className="text-foreground hover:underline">
                    {product.name}
                  </Link>
                  <span className="text-destructive">{product.stock} left</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
