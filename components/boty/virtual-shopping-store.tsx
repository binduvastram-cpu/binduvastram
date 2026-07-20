"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { VirtualShoppingRequest } from "@/lib/types"

interface VirtualShoppingContextType {
  requests: VirtualShoppingRequest[]
  hydrated: boolean
  addRequest: (request: Omit<VirtualShoppingRequest, "id" | "status" | "createdAt">) => Promise<void>
  updateStatus: (id: string, status: VirtualShoppingRequest["status"]) => Promise<void>
}

const VirtualShoppingContext = createContext<VirtualShoppingContextType | undefined>(undefined)

export function VirtualShoppingProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [requests, setRequests] = useState<VirtualShoppingRequest[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase
      .from("virtual_shopping_requests")
      .select("id, name, phone, product_id, product_name, preferred_date, preferred_time, topic, status, created_at")
      .order("created_at", { ascending: false })
    setRequests(
      (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        phone: row.phone,
        productId: row.product_id ?? undefined,
        productName: row.product_name ?? undefined,
        preferredDate: row.preferred_date,
        preferredTime: row.preferred_time,
        topic: row.topic ?? "",
        status: row.status as VirtualShoppingRequest["status"],
        createdAt: row.created_at,
      }))
    )
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addRequest = async (request: Omit<VirtualShoppingRequest, "id" | "status" | "createdAt">) => {
    await supabase.from("virtual_shopping_requests").insert({
      name: request.name,
      phone: request.phone,
      product_id: request.productId ?? null,
      product_name: request.productName ?? null,
      preferred_date: request.preferredDate,
      preferred_time: request.preferredTime,
      topic: request.topic || null,
    })
    await fetchAll()
  }

  const updateStatus = async (id: string, status: VirtualShoppingRequest["status"]) => {
    await supabase.from("virtual_shopping_requests").update({ status }).eq("id", id)
    await fetchAll()
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
