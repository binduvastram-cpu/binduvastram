import type { CategoryInfo, Product } from "./types"

// Case-insensitive match score: exact > starts-with > contains > in-order
// letter overlap (so typos/partial words still surface, ranked by how well they match).
function fieldScore(query: string, text: string): number {
  if (!query || !text) return 0
  const q = query.toLowerCase()
  const t = text.toLowerCase()

  if (t === q) return 100
  if (t.startsWith(q)) return 80
  if (t.includes(q)) return 60

  let qi = 0
  for (const ch of t) {
    if (ch === q[qi]) qi++
    if (qi === q.length) break
  }
  const ratio = qi / q.length
  return ratio >= 0.6 ? Math.round(ratio * 40) : 0
}

export function matchScore(query: string, product: Product, categories: CategoryInfo[]): number {
  const categoryLabel = categories.find((c) => c.value === product.category)?.label ?? ""
  const fields = [product.name, product.tagline ?? "", product.properties.fabric ?? "", categoryLabel]
  return Math.max(...fields.map((field) => fieldScore(query, field)))
}

export function searchProducts(query: string, products: Product[], categories: CategoryInfo[]): Product[] {
  const trimmed = query.trim()
  if (!trimmed) return products

  return products
    .map((product) => ({ product, score: matchScore(trimmed, product, categories) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.product)
}
