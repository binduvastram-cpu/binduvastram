"use client"

import Link from "next/link"
import { Tag } from "lucide-react"
import { useOffers } from "./offers-store"
import { useCategories } from "./categories-store"
import { useProducts } from "./products-store"
import { discountLabel } from "@/lib/offers"

function isActiveNow(offer: { isActive: boolean; startDate?: string; endDate?: string }): boolean {
  if (!offer.isActive) return false
  const now = new Date()
  if (offer.startDate && new Date(offer.startDate) > now) return false
  if (offer.endDate && new Date(offer.endDate) < now) return false
  return true
}

export function OffersTicker() {
  const { offers, hydrated } = useOffers()
  const { products } = useProducts()
  const { categories } = useCategories()

  if (!hydrated) return null
  const activeOffers = offers.filter(isActiveNow)
  if (activeOffers.length === 0) return null

  const segments = activeOffers.map((offer) => {
    const href = offer.scope === "product" ? `/product/${offer.targetId}` : `/shop?category=${offer.targetId}`
    const targetLabel =
      offer.scope === "product"
        ? products.find((p) => p.id === offer.targetId)?.name ?? "this product"
        : categories.find((c) => c.value === offer.targetId)?.label ?? offer.targetId
    return { id: offer.id, href, label: `${offer.title} — ${discountLabel(offer)} on ${targetLabel}` }
  })

  return (
    <div className="bg-primary overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center shrink-0" aria-hidden={copy === 1}>
            {segments.map((segment) => (
              <Link
                key={`${copy}-${segment.id}`}
                href={segment.href}
                className="inline-flex items-center gap-2 px-6 text-sm font-medium text-primary-foreground hover:underline"
              >
                <Tag className="w-3.5 h-3.5 shrink-0" />
                {segment.label}
              </Link>
            ))}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </div>
  )
}
