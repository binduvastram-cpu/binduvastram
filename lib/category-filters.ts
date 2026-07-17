import type { Category } from "./types"

export type FilterKind = "fabric" | "material" | "size" | "color" | "price"

// Which filter controls make sense for each category — avoids showing an
// irrelevant "Fabric" dropdown on jewellery/handbags, or no "Size" filter on
// apparel that needs it. See redesign spec Section 9.
export const CATEGORY_FILTERS: Record<Category, FilterKind[]> = {
  sarees: ["fabric", "color", "price"],
  "womens-wear": ["fabric", "size", "color", "price"],
  "salwar-suits": ["fabric", "size", "color", "price"],
  blouses: ["fabric", "size", "color", "price"],
  "mens-wear": ["fabric", "size", "color", "price"],
  petticoats: ["fabric", "size", "color", "price"],
  handbags: ["material", "price"],
  jewellery: ["price"],
}

export function filtersForCategory(category: string): FilterKind[] {
  if (category === "all") {
    // "All" view shows every filter kind so nothing feels missing while
    // browsing everything; picking a specific category narrows it down.
    return ["fabric", "material", "size", "color", "price"]
  }
  return CATEGORY_FILTERS[category as Category] ?? ["price"]
}
