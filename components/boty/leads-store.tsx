"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Lead } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-leads"

interface LeadsContextType {
  leads: Lead[]
  hydrated: boolean
  addLead: (lead: Omit<Lead, "id" | "couponCode" | "redeemed" | "createdAt">) => string
  markRedeemed: (id: string) => void
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined)

function generateCouponCode() {
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `WELCOME-${suffix}`
}

export function LeadsProvider({ children }: { children: ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setLeads(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Lead[]) => {
    setLeads(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addLead = (lead: Omit<Lead, "id" | "couponCode" | "redeemed" | "createdAt">) => {
    const couponCode = generateCouponCode()
    const newLead: Lead = {
      ...lead,
      id: `lead_${Date.now()}`,
      couponCode,
      redeemed: false,
      createdAt: new Date().toISOString(),
    }
    persist([newLead, ...leads])
    return couponCode
  }

  const markRedeemed = (id: string) => {
    persist(leads.map((l) => (l.id === id ? { ...l, redeemed: true } : l)))
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
