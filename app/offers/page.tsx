"use client"

import Link from "next/link"
import { Tag, ArrowRight } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useOffers } from "@/components/boty/offers-store"
import { useProducts } from "@/components/boty/products-store"
import { useCategories } from "@/components/boty/categories-store"
import { discountLabel } from "@/lib/offers"

function isActiveNow(offer: { isActive: boolean; startDate?: string; endDate?: string }): boolean {
  if (!offer.isActive) return false
  const now = new Date()
  if (offer.startDate && new Date(offer.startDate) > now) return false
  if (offer.endDate && new Date(offer.endDate) < now) return false
  return true
}

export default function OffersPage() {
  const { offers, hydrated } = useOffers()
  const { products } = useProducts()
  const { categories } = useCategories()

  if (!hydrated) return null

  const activeOffers = offers.filter(isActiveNow)

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">Save More</span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Current Offers
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Limited-time discounts on handpicked sarees and collections
            </p>
          </div>

          {activeOffers.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">No active offers right now — check back soon.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {activeOffers.map((offer) => {
                const targetHref =
                  offer.scope === "product" ? `/product/${offer.targetId}` : `/shop?category=${offer.targetId}`
                const targetLabel =
                  offer.scope === "product"
                    ? products.find((p) => p.id === offer.targetId)?.name ?? "Product"
                    : categories.find((c) => c.value === offer.targetId)?.label ?? offer.targetId

                return (
                  <Link
                    key={offer.id}
                    href={targetHref}
                    className="group bg-card rounded-3xl boty-shadow p-6 boty-transition hover:scale-[1.01]"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Tag className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-destructive bg-destructive/10 px-3 py-1 rounded-full">
                        {discountLabel(offer)}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl text-foreground mb-1">{offer.title}</h2>
                    {offer.description && <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>}
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Shop {targetLabel}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
                    </span>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
