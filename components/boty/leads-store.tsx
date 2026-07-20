"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Lead } from "@/lib/types"

interface LeadsContextType {
  leads: Lead[]
  hydrated: boolean
  addLead: (lead: Omit<Lead, "id" | "couponCode" | "redeemed" | "createdAt">) => Promise<string>
  markRedeemed: (id: string) => Promise<void>
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

function generateCouponCode() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `WELCOME-${suffix}`
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [leads, setLeads] = useState<Lead[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase
      .from("leads")
      .select("id, first_name, last_name, email, phone, coupon_code, redeemed, created_at")
      .order("created_at", { ascending: false })
    setLeads(
      (data ?? []).map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phone: row.phone,
        couponCode: row.coupon_code,
        redeemed: row.redeemed,
        createdAt: row.created_at,
      }))
    )
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addLead = async (lead: Omit<Lead, "id" | "couponCode" | "redeemed" | "createdAt">): Promise<string> => {
    const couponCode = generateCouponCode()
    await supabase.from("leads").insert({
      first_name: lead.firstName,
      last_name: lead.lastName,
      email: lead.email,
      phone: lead.phone,
      coupon_code: couponCode,
    })
    await fetchAll()
    return couponCode
  }

  const markRedeemed = async (id: string) => {
    await supabase.from("leads").update({ redeemed: true }).eq("id", id)
    await fetchAll()
  }

  return (
    <LeadsContext.Provider value={{ leads, hydrated, addLead, markRedeemed }}>
      {children}
    </LeadsContext.Provider>
  )
}

export function useLeads() {
  const context = useContext(LeadsContext)
  if (context === undefined) {
    throw new Error("useLeads must be used within a LeadsProvider")
  }
  return context
}
