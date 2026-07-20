import type { Offer, Product } from "./types"

function isWithinWindow(offer: Offer, now: Date): boolean {
  if (offer.startDate && new Date(offer.startDate) > now) return false
  if (offer.endDate && new Date(offer.endDate) < now) return false
  return true
}

// Every offer that currently applies to this product — a direct product-scoped
// offer or a category-scoped offer covering its category. Both can be active
// at once; computeSalePrice below picks the single best one to display.
export function effectiveOffersFor(product: Product, offers: Offer[]): Offer[] {
  const now = new Date()
  return offers.filter((offer) => {
    if (!offer.isActive || !isWithinWindow(offer, now)) return false
    if (offer.scope === "product") return offer.targetId === product.id
    return offer.targetId === product.category
  })
}

function discountAmount(offer: Offer, price: number): number {
  return offer.discountType === "percent" ? (price * offer.discountValue) / 100 : offer.discountValue
}

export interface AppliedOffer {
  offer: Offer
  salePrice: number
}

// Auto-calculates the sale price from whichever matching offer discounts the
// product the most — admin never has to hand-type a discounted price per
// product; it's always derived live from the active Offers list.
export function computeSalePrice(product: Product, offers: Offer[]): AppliedOffer | null {
  const applicable = effectiveOffersFor(product, offers)
  if (applicable.length === 0) return null

  let best: AppliedOffer | null = null
  for (const offer of applicable) {
    const amount = discountAmount(offer, product.price)
    const salePrice = Math.max(0, Math.round(product.price - amount))
    if (!best || salePrice < best.salePrice) {
      best = { offer, salePrice }
    }
  }
  return best
}

export function discountLabel(offer: Offer): string {
  return offer.discountType === "percent" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`
}
