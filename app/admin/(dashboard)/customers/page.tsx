"use client"

import { useEffect, useState } from "react"
import { Search, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface CustomerRow {
  id: string
  name: string
  phone: string
  email: string
  createdAt: string
  address?: { line1: string; city: string | null; pincode: string; state: string | null }
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.from("profiles").select("id, name, phone, email, created_at").eq("is_admin", false).order("created_at", { ascending: false }),
      supabase.from("addresses").select("profile_id, line1, city, pincode, state"),
    ]).then(([{ data: profiles }, { data: addresses }]) => {
      const addressByProfile = new Map((addresses ?? []).map((a) => [a.profile_id, a]))
      setCustomers(
        (profiles ?? []).map((p) => ({
          id: p.id,
          name: p.name || "—",
          phone: p.phone || "—",
          email: p.email ?? "",
          createdAt: p.created_at,
          address: addressByProfile.get(p.id),
        }))
      )
      setHydrated(true)
    })
  }, [])

  if (!hydrated) return null

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Customers</h1>
      <p className="text-muted-foreground mb-6">{customers.length} registered accounts.</p>

      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, phone, or email..."
          className="w-full bg-card border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 boty-transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <Users className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No registered accounts yet.</p>
        </div>
      ) : (
        <>
          <div className="hidden md:block bg-card rounded-2xl boty-shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-background text-muted-foreground text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3">Name</th>
                  <th className="text-left px-5 py-3">Email</th>
                  <th className="text-left px-5 py-3">Phone</th>
                  <th className="text-left px-5 py-3">Address</th>
                  <th className="text-left px-5 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id} className="border-t border-border/50">
                    <td className="px-5 py-3 text-foreground font-medium">{customer.name}</td>
                    <td className="px-5 py-3 text-muted-foreground">{customer.email}</td>
                    <td className="px-5 py-3 text-muted-foreground">{customer.phone}</td>
                    <td className="px-5 py-3 text-muted-foreground max-w-xs truncate">
                      {customer.address ? `${customer.address.line1}, ${customer.address.city} - ${customer.address.pincode}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {filtered.map((customer) => (
              <div key={customer.id} className="bg-card rounded-2xl boty-shadow p-4">
                <p className="font-medium text-foreground">{customer.name}</p>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                {customer.address && (
                  <p className="text-sm text-muted-foreground">{customer.address.line1}, {customer.address.city} - {customer.address.pincode}</p>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(customer.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
