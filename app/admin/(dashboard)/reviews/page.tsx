"use client"

import { useState } from "react"
import { Star, Check, X, Trash2, MessageSquare } from "lucide-react"
import { useReviews } from "@/components/boty/reviews-store"
import { useProducts } from "@/components/boty/products-store"

const STATUS_TABS = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
] as const

export default function AdminReviewsPage() {
  const { reviews, hydrated, moderateReview, deleteReview, replyToReview } = useReviews()
  const { products } = useProducts()
  const [tab, setTab] = useState<(typeof STATUS_TABS)[number]["value"]>("pending")
  const [replyDraftId, setReplyDraftId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState("")

  if (!hydrated) return null

  const filtered = reviews.filter((r) => r.status === tab)
  const productName = (productId: string) => products.find((p) => p.id === productId)?.name ?? productId

  return (
    <div>
      <h1 className="font-serif text-3xl text-foreground mb-1">Reviews</h1>
      <p className="text-muted-foreground mb-6">Moderate submitted reviews before they appear on product pages.</p>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-full text-sm boty-transition ${
              tab === t.value ? "bg-primary text-primary-foreground" : "bg-card text-foreground boty-shadow"
            }`}
          >
            {t.label} ({reviews.filter((r) => r.status === t.value).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <Star className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No {tab} reviews.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="bg-card rounded-2xl boty-shadow p-5">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <p className="font-medium text-foreground">{review.customerName}</p>
                  <p className="text-xs text-muted-foreground">{productName(review.productId)}</p>
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground/80 mb-3">{review.text}</p>
              {review.reply && (
                <div className="mb-3 pl-3 border-l-2 border-primary/30">
                  <p className="text-xs text-muted-foreground">Reply: {review.reply}</p>
                </div>
              )}

              {replyDraftId === review.id && (
                <div className="flex gap-2 mb-3">
                  <input
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      replyToReview(review.id, replyText)
                      setReplyDraftId(null)
                      setReplyText("")
                    }}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm"
                  >
                    Send
                  </button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {tab !== "approved" && (
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, "approved")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-primary/10 text-primary boty-transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Approve
                  </button>
                )}
                {tab !== "rejected" && (
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, "rejected")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-muted text-muted-foreground boty-transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    Reject
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setReplyDraftId(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-card border border-border/50 text-foreground boty-transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Reply
                </button>
                <button
                  type="button"
                  onClick={() => deleteReview(review.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs text-destructive hover:bg-destructive/10 boty-transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
