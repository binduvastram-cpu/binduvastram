"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export type CancellationStatus = "Pending" | "Approved" | "Rejected"

export interface CancellationRequest {
  id: string
  orderId: string
  orderCode: string
  profileId: string
  customerName: string
  customerPhone: string
  reason: string | null
  status: CancellationStatus
  createdAt: string
}

type Row = {
  id: string
  order_id: string
  profile_id: string
  reason: string | null
  status: CancellationStatus
  created_at: string
  orders: { order_code: string; customer_name: string; customer_phone: string } | null
}

function rowToRequest(row: Row): CancellationRequest {
  return {
    id: row.id,
    orderId: row.order_id,
    orderCode: row.orders?.order_code ?? "",
    profileId: row.profile_id,
    customerName: row.orders?.customer_name ?? "",
    customerPhone: row.orders?.customer_phone ?? "",
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
  }
}

interface CancellationRequestsContextType {
  requests: CancellationRequest[]
  hydrated: boolean
  requestCancellation: (orderId: string, reason: string) => Promise<void>
  approve: (id: string, orderId: string) => Promise<void>
  reject: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
}

const CancellationRequestsContext = createContext<CancellationRequestsContextType | undefined>(undefined)

export function CancellationRequestsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [requests, setRequests] = useState<CancellationRequest[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase
      .from("cancellation_requests")
      .select("id, order_id, profile_id, reason, status, created_at, orders ( order_code, customer_name, customer_phone )")
      .order("created_at", { ascending: false })
    setRequests(((data as unknown as Row[]) ?? []).map(rowToRequest))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))

    const channel = supabase
      .channel("cancellation-requests-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "cancellation_requests" }, () => fetchAll())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestCancellation = async (orderId: string, reason: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from("cancellation_requests").insert({ order_id: orderId, profile_id: user.id, reason: reason || null })
    await fetchAll()
  }

  const approve = async (id: string, orderId: string) => {
    await supabase.from("orders").update({ order_status: "Cancelled" }).eq("id", orderId)
    await supabase.from("cancellation_requests").update({ status: "Approved", resolved_at: new Date().toISOString() }).eq("id", id)
    await fetchAll()
  }

  const reject = async (id: string) => {
    await supabase.from("cancellation_requests").update({ status: "Rejected", resolved_at: new Date().toISOString() }).eq("id", id)
    await fetchAll()
  }

  const remove = async (id: string) => {
    await supabase.from("cancellation_requests").delete().eq("id", id)
    setRequests((current) => current.filter((r) => r.id !== id))
  }

  return (
    <CancellationRequestsContext.Provider value={{ requests, hydrated, requestCancellation, approve, reject, remove }}>
      {children}
    </CancellationRequestsContext.Provider>
  )
}

export function useCancellationRequests() {
  const context = useContext(CancellationRequestsContext)
  if (context === undefined) {
    throw new Error("useCancellationRequests must be used within a CancellationRequestsProvider")
  }
  return context
}
