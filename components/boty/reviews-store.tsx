"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Review } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-reviews"

interface ReviewsContextType {
  reviews: Review[]
  hydrated: boolean
  addReview: (review: Omit<Review, "id" | "status" | "createdAt">) => void
  moderateReview: (id: string, status: Review["status"]) => void
  deleteReview: (id: string) => void
  replyToReview: (id: string, reply: string) => void
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined)

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setReviews(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Review[]) => {
    setReviews(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  // New reviews start "pending" — an admin must approve before they're shown
  // publicly (open-to-all-logged-in-users submission, moderation as the
  // spam/quality safety net — see the answered open question in the spec).
  const addReview = (review: Omit<Review, "id" | "status" | "createdAt">) => {
    const newReview: Review = {
      ...review,
      id: `review_${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
    }
    persist([newReview, ...reviews])
  }

  const moderateReview = (id: string, status: Review["status"]) => {
    persist(reviews.map((r) => (r.id === id ? { ...r, status } : r)))
  }

  const deleteReview = (id: string) => {
    persist(reviews.filter((r) => r.id !== id))
  }

  const replyToReview = (id: string, reply: string) => {
    persist(reviews.map((r) => (r.id === id ? { ...r, reply } : r)))
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
