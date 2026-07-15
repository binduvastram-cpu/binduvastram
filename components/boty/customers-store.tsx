"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { CustomerProfile } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-customers"

interface CustomersContextType {
  customers: CustomerProfile[]
  hydrated: boolean
  upsertCustomer: (profile: Omit<CustomerProfile, "id" | "createdAt">) => void
}

const CustomersContext = createContext<CustomersContextType | undefined>(undefined)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<CustomerProfile[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setCustomers(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  // Matched by phone number — creating an account again with the same phone
  // updates the existing entry rather than duplicating it.
  const upsertCustomer = (profile: Omit<CustomerProfile, "id" | "createdAt">) => {
    setCustomers((current) => {
      const existing = current.find((c) => c.phone === profile.phone)
      const next = existing
        ? current.map((c) => (c.phone === profile.phone ? { ...c, ...profile } : c))
        : [{ ...profile, id: `cust_${Date.now()}`, createdAt: new Date().toISOString() }, ...current]
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <CustomersContext.Provider value={{ customers, hydrated, upsertCustomer }}>
      {children}
    </CustomersContext.Provider>
  )
}

export function useCustomers() {
  const context = useContext(CustomersContext)
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomersProvider")
  }
  return context
}
