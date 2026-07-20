"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Review } from "@/lib/types"

interface ReviewsContextType {
  reviews: Review[]
  hydrated: boolean
  addReview: (review: Omit<Review, "id" | "status" | "createdAt">) => Promise<void>
  moderateReview: (id: string, status: Review["status"]) => Promise<void>
  deleteReview: (id: string) => Promise<void>
  replyToReview: (id: string, reply: string) => Promise<void>
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [reviews, setReviews] = useState<Review[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase
      .from("reviews")
      .select("id, product_id, customer_name, rating, text, status, reply, created_at")
      .order("created_at", { ascending: false })
    setReviews(
      (data ?? []).map((row) => ({
        id: row.id,
        productId: row.product_id,
        customerName: row.customer_name,
        rating: row.rating,
        text: row.text,
        status: row.status as Review["status"],
        reply: row.reply ?? undefined,
        createdAt: row.created_at,
      }))
    )
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // New reviews start "pending" — an admin must approve before they're shown
  // publicly (open-to-all-logged-in-users submission, moderation as the
  // spam/quality safety net — see the answered open question in the spec).
  const addReview = async (review: Omit<Review, "id" | "status" | "createdAt">) => {
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from("reviews").insert({
      product_id: review.productId,
      profile_id: user?.id ?? null,
      customer_name: review.customerName,
      rating: review.rating,
      text: review.text,
    })
    await fetchAll()
  }

  const moderateReview = async (id: string, status: Review["status"]) => {
    await supabase.from("reviews").update({ status }).eq("id", id)
    await fetchAll()
  }

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id)
    await fetchAll()
  }

  const replyToReview = async (id: string, reply: string) => {
    await supabase.from("reviews").update({ reply }).eq("id", id)
    await fetchAll()
  }

  return (
    <ReviewsContext.Provider value={{ reviews, hydrated, addReview, moderateReview, deleteReview, replyToReview }}>
      {children}
    </ReviewsContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewsContext)
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewsProvider")
  }
  return context
}
