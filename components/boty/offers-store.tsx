"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Offer } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-offers"

interface OffersContextType {
  offers: Offer[]
  hydrated: boolean
  addOffer: (offer: Omit<Offer, "id" | "createdAt">) => void
  updateOffer: (offer: Offer) => void
  deleteOffer: (id: string) => void
}

const OffersContext = createContext<OffersContextType | undefined>(undefined)

export function OffersProvider({ children }: { children: ReactNode }) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setOffers(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Offer[]) => {
    setOffers(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addOffer = (offer: Omit<Offer, "id" | "createdAt">) => {
    const newOffer: Offer = {
      ...offer,
      id: `offer_${Date.now()}`,
      createdAt: new Date().toISOString(),
    }
    persist([newOffer, ...offers])
  }

  const updateOffer = (updated: Offer) => {
    persist(offers.map((o) => (o.id === updated.id ? updated : o)))
  }

  const deleteOffer = (id: string) => {
    persist(offers.filter((o) => o.id !== id))
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
