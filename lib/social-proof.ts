import type { Order, Product } from "./types"

// A product needs at least this many real units sold before it's eligible
// for a demand badge at all — otherwise a single sale in a young store would
// get labelled "Bestseller", which would be misleading rather than helpful.
const MIN_SOLD_FOR_RANKING = 3
const BESTSELLER_RANK_CUTOFF = 3
const MOST_WANTED_RANK_CUTOFF = 10

function soldQuantities(orders: Order[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const order of orders) {
    if (order.orderStatus === "Cancelled") continue
    for (const item of order.items) {
      totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity)
    }
  }
  return totals
}

export function realSoldQuantity(productId: string, orders: Order[]): number {
  return soldQuantities(orders).get(productId) ?? 0
}

// Combines the admin's manual baseline (useful while a store is brand new)
// with real order quantities as they come in — the number only ever grows
// more "real" over time, never needs a mode switch.
export function displayBoughtCount(product: Product, orders: Order[]): number {
  return (product.boughtCount ?? 0) + realSoldQuantity(product.id, orders)
}

// Ranks every product by real units sold and tiers the top of that ranking
// into Bestseller / Most Wanted — computed once across the whole catalog
// (not per-product) since "rank" is inherently a cross-product comparison.
export function computeDemandRanking(
  products: Product[],
  orders: Order[]
): Record<string, "Bestseller" | "Most Wanted"> {
  const totals = soldQuantities(orders)
  const ranked = products
    .map((p) => ({ id: p.id, sold: totals.get(p.id) ?? 0 }))
    .filter((p) => p.sold >= MIN_SOLD_FOR_RANKING)
    .sort((a, b) => b.sold - a.sold)

  const result: Record<string, "Bestseller" | "Most Wanted"> = {}
  ranked.forEach((entry, index) => {
    if (index < BESTSELLER_RANK_CUTOFF) result[entry.id] = "Bestseller"
    else if (index < MOST_WANTED_RANK_CUTOFF) result[entry.id] = "Most Wanted"
  })
  return result
}

// Best-effort "shoppers from" location, read from real order delivery
// addresses (no structured city field exists pre-backend, so this takes the
// second-to-last comma-separated segment of the address — the common
// "Street, Area, City, State PIN" shape — falling back to the raw address).
// Revisit once a real backend/checkout form captures city as its own field.
function guessCity(address: string): string {
  const parts = address.split(",").map((p) => p.trim()).filter(Boolean)
  if (parts.length >= 2) return parts[parts.length - 2]
  return parts[0] ?? address
}

export function realSampleLocations(productId: string, orders: Order[], max = 3): string[] {
  const locations: string[] = []
  for (const order of orders) {
    if (order.orderStatus === "Cancelled") continue
    if (!order.items.some((item) => item.productId === productId)) continue
    const city = guessCity(order.customerAddress)
    if (city && !locations.includes(city)) locations.push(city)
    if (locations.length >= max) break
  }
  return locations
}
