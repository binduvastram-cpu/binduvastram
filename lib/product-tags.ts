import type { Product } from "./types"

const LOW_STOCK_THRESHOLD = 5

// Every status here is derived live from real data (stock count, product
// age, real order volume) — none of it is a manually-set flag an admin can
// forget to update or leave stale.
const NEW_ARRIVAL_WINDOW_DAYS = 21

export function isOutOfStock(product: Product): boolean {
  return product.stock <= 0
}

export function isLowStock(product: Product): boolean {
  return product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD
}

export function isNewArrival(product: Product): boolean {
  const ageMs = Date.now() - new Date(product.createdAt).getTime()
  return ageMs >= 0 && ageMs <= NEW_ARRIVAL_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

// Stock status always wins over a promotional badge (it's more useful to a
// shopper), then how new the listing is, then real demand ranking (passed in
// by the caller — see lib/social-proof.ts#computeDemandRanking, which needs
// every product + order at once so it can't be computed per-product here).
export function computeBadge(product: Product, rank?: "Bestseller" | "Most Wanted"): string | null {
  if (isOutOfStock(product)) return "Out of Stock"
  if (isLowStock(product)) return "Limited Stock"
  if (isNewArrival(product)) return "New"
  return rank ?? null
}
