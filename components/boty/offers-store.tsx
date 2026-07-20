"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Offer } from "@/lib/types"

const SELECT = `
  id, title, description, scope, discount_type, discount_value, start_date, end_date, is_active, created_at,
  product_id,
  categories ( value )
`

type OfferRow = {
  id: string
  title: string
  description: string | null
  scope: "product" | "category"
  discount_type: "percent" | "flat"
  discount_value: number
  start_date: string | null
  end_date: string | null
  is_active: boolean
  created_at: string
  product_id: string | null
  categories: { value: string } | null
}

function rowToOffer(row: OfferRow): Offer {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    scope: row.scope,
    targetId: row.scope === "product" ? (row.product_id ?? "") : row.categories?.value ?? "",
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

interface OffersContextType {
  offers: Offer[]
  hydrated: boolean
  addOffer: (offer: Omit<Offer, "id" | "createdAt">) => Promise<void>
  updateOffer: (offer: Offer) => Promise<void>
  deleteOffer: (id: string) => Promise<void>
}

const OffersContext = createContext<OffersContextType | undefined>(undefined)

export function OffersProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [offers, setOffers] = useState<Offer[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("offers").select(SELECT).order("created_at", { ascending: false })
    setOffers(((data as unknown as OfferRow[]) ?? []).map(rowToOffer))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))

    const channel = supabase
      .channel("offers-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, () => fetchAll())
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categoryIdFor = async (value: string) => {
    const { data } = await supabase.from("categories").select("id").eq("value", value).single()
    return data?.id as string | undefined
  }

  const addOffer = async (offer: Omit<Offer, "id" | "createdAt">) => {
    const categoryId = offer.scope === "category" ? await categoryIdFor(offer.targetId) : null
    await supabase.from("offers").insert({
      title: offer.title,
      description: offer.description ?? null,
      scope: offer.scope,
      product_id: offer.scope === "product" ? offer.targetId : null,
      category_id: offer.scope === "category" ? categoryId : null,
      discount_type: offer.discountType,
      discount_value: offer.discountValue,
      start_date: offer.startDate ?? null,
      end_date: offer.endDate ?? null,
      is_active: offer.isActive,
    })
    await fetchAll()
  }

  const updateOffer = async (updated: Offer) => {
    const categoryId = updated.scope === "category" ? await categoryIdFor(updated.targetId) : null
    await supabase
      .from("offers")
      .update({
        title: updated.title,
        description: updated.description ?? null,
        scope: updated.scope,
        product_id: updated.scope === "product" ? updated.targetId : null,
        category_id: updated.scope === "category" ? categoryId : null,
        discount_type: updated.discountType,
        discount_value: updated.discountValue,
        start_date: updated.startDate ?? null,
        end_date: updated.endDate ?? null,
        is_active: updated.isActive,
      })
      .eq("id", updated.id)
    await fetchAll()
  }

  const deleteOffer = async (id: string) => {
    await supabase.from("offers").delete().eq("id", id)
    await fetchAll()
  }

  return (
    <OffersContext.Provider value={{ offers, hydrated, addOffer, updateOffer, deleteOffer }}>
      {children}
    </OffersContext.Provider>
  )
}

export function useOffers() {
  const context = useContext(OffersContext)
  if (context === undefined) {
    throw new Error("useOffers must be used within an OffersProvider")
  }
  return context
}
