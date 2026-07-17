"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { VirtualShoppingRequest } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-virtual-shopping"

interface VirtualShoppingContextType {
  requests: VirtualShoppingRequest[]
  hydrated: boolean
  addRequest: (request: Omit<VirtualShoppingRequest, "id" | "status" | "createdAt">) => void
  updateStatus: (id: string, status: VirtualShoppingRequest["status"]) => void
}

const VirtualShoppingContext = createContext<VirtualShoppingContextType | undefined>(undefined)

export function VirtualShoppingProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<VirtualShoppingRequest[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setRequests(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: VirtualShoppingRequest[]) => {
    setRequests(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addRequest = (request: Omit<VirtualShoppingRequest, "id" | "status" | "createdAt">) => {
    const newRequest: VirtualShoppingRequest = {
      ...request,
      id: `vs_${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    persist([newRequest, ...requests])
  }

  const updateStatus = (id: string, status: VirtualShoppingRequest["status"]) => {
    persist(requests.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  return (
    <VirtualShoppingContext.Provider value={{ requests, hydrated, addRequest, updateStatus }}>
      {children}
    </VirtualShoppingContext.Provider>
  )
}

export function useVirtualShopping() {
  const context = useContext(VirtualShoppingContext)
  if (context === undefined) {
    throw new Error("useVirtualShopping must be used within a VirtualShoppingProvider")
  }
  return context
}
