import type { Product } from "./types"
import { familyOf } from "./saree-collections"

// Saree prefixes are collection-family-based (matches how the client
// described it: "SL123" for silk, "CO456" for cotton) since "sarees" alone
// doesn't distinguish fabric families. Everything else uses a category prefix.
const FAMILY_PREFIXES: Record<string, string> = {
  silk: "SL",
  cotton: "CO",
  "silk-cotton": "SC",
  tussars: "TU",
  linens: "LI",
  fancy: "FA",
}

const CATEGORY_PREFIXES: Record<string, string> = {
  sarees: "SR",
  "mens-wear": "MW",
  "womens-wear": "WW",
  blouses: "BL",
  jewellery: "JW",
  handbags: "HB",
  petticoats: "PC",
  "salwar-suits": "SS",
  designer: "DE",
}

// Admin-created categories have no static prefix entry — derive one from the
// category slug itself so codes stay readable/searchable instead of falling
// back to something generic like "XX".
function fallbackPrefix(category: string): string {
  const letters = category.replace(/[^a-z]/gi, "").toUpperCase()
  return (letters.slice(0, 2) || "XX").padEnd(2, "X")
}

function prefixFor(product: Pick<Product, "category" | "collection">): string {
  if (product.category === "sarees" && product.collection) {
    const family = familyOf(product.collection)
    if (family && FAMILY_PREFIXES[family]) return FAMILY_PREFIXES[family]
  }
  return CATEGORY_PREFIXES[product.category] ?? fallbackPrefix(product.category)
}

// Auto-generates the next code for a given prefix by scanning existing
// products' codes — no server/counter needed, consistent with this app's
// localStorage-only data layer.
export function generateProductCode(
  product: Pick<Product, "category" | "collection">,
  existingProducts: Product[]
): string {
  const prefix = prefixFor(product)
  let max = 0
  for (const p of existingProducts) {
    if (!p.code || !p.code.startsWith(prefix)) continue
    const num = parseInt(p.code.slice(prefix.length), 10)
    if (!Number.isNaN(num) && num > max) max = num
  }
  return `${prefix}${String(max + 1).padStart(3, "0")}`
}
