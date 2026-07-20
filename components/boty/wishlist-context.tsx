"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

const STORAGE_KEY = "bindu-vastram-wishlist"

interface WishlistContextType {
  ids: string[]
  isWishlisted: (id: string) => boolean
  toggleWishlist: (id: string) => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [ids, setIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const readLocal = (): string[] => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  const writeLocal = (next: string[]) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  // Guests: localStorage only. Logged in: merge whatever's local into the
  // account's real wishlist (so a device-only wishlist isn't lost the
  // moment someone signs in), then treat Supabase as the source of truth.
  const loadForUser = async (uid: string) => {
    const local = readLocal()
    const { data } = await supabase.from("wishlists").select("product_id").eq("profile_id", uid)
    const remote = (data ?? []).map((r) => r.product_id)
    const merged = Array.from(new Set([...remote, ...local]))

    const missing = merged.filter((id) => !remote.includes(id))
    if (missing.length > 0) {
      await supabase.from("wishlists").upsert(
        missing.map((product_id) => ({ profile_id: uid, product_id })),
        { onConflict: "profile_id,product_id" }
      )
    }

    setIds(merged)
    writeLocal(merged)
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      if (session?.user) {
        setUserId(session.user.id)
        await loadForUser(session.user.id)
      } else {
        setIds(readLocal())
      }
      setHydrated(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        await loadForUser(session.user.id)
      } else {
        setUserId(null)
        setIds(readLocal())
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isWishlisted = (id: string) => ids.includes(id)

  const toggleWishlist = (id: string) => {
    const next = ids.includes(id) ? ids.filter((existing) => existing !== id) : [...ids, id]
    setIds(next)
    writeLocal(next)

    if (userId) {
      if (next.includes(id)) {
        supabase.from("wishlists").upsert({ profile_id: userId, product_id: id }, { onConflict: "profile_id,product_id" })
      } else {
        supabase.from("wishlists").delete().eq("profile_id", userId).eq("product_id", id)
      }
    }
  }

  if (!hydrated) {
    return (
      <WishlistContext.Provider value={{ ids: [], isWishlisted: () => false, toggleWishlist: () => {} }}>
        {children}
      </WishlistContext.Provider>
    )
  }

  return (
    <WishlistContext.Provider value={{ ids, isWishlisted, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
