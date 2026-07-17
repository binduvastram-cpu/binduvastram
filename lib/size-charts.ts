import type { Category } from "./types"

export interface SizeChartRow {
  size: string
  bust: string
  waist: string
}

// Static measurement tables per category (Section 9a). Admin-editable in
// phase 2 once Supabase is wired up; for now these are shared across every
// product in the category, matching how most ready-made ethnic-wear brands
// present sizing.
export const SIZE_CHARTS: Partial<Record<Category, SizeChartRow[]>> = {
  blouses: [
    { size: "32", bust: "32 in / 81 cm", waist: "27 in / 69 cm" },
    { size: "34", bust: "34 in / 86 cm", waist: "29 in / 74 cm" },
    { size: "36", bust: "36 in / 91 cm", waist: "31 in / 79 cm" },
    { size: "38", bust: "38 in / 97 cm", waist: "33 in / 84 cm" },
    { size: "40", bust: "40 in / 102 cm", waist: "35 in / 89 cm" },
  ],
  "mens-wear": [
    { size: "M", bust: "38 in / 97 cm", waist: "34 in / 86 cm" },
    { size: "L", bust: "40 in / 102 cm", waist: "36 in / 91 cm" },
    { size: "XL", bust: "42 in / 107 cm", waist: "38 in / 97 cm" },
    { size: "XXL", bust: "44 in / 112 cm", waist: "40 in / 102 cm" },
  ],
  petticoats: [
    { size: "S", bust: "28 in / 71 cm", waist: "26 in / 66 cm" },
    { size: "M", bust: "30 in / 76 cm", waist: "28 in / 71 cm" },
    { size: "L", bust: "32 in / 81 cm", waist: "30 in / 76 cm" },
    { size: "XL", bust: "34 in / 86 cm", waist: "32 in / 81 cm" },
    { size: "XXL", bust: "36 in / 91 cm", waist: "34 in / 86 cm" },
  ],
  "salwar-suits": [
    { size: "S", bust: "34 in / 86 cm", waist: "28 in / 71 cm" },
    { size: "M", bust: "36 in / 91 cm", waist: "30 in / 76 cm" },
    { size: "L", bust: "38 in / 97 cm", waist: "32 in / 81 cm" },
    { size: "XL", bust: "40 in / 102 cm", waist: "34 in / 86 cm" },
    { size: "XXL", bust: "42 in / 107 cm", waist: "36 in / 91 cm" },
  ],
  "womens-wear": [
    { size: "S", bust: "34 in / 86 cm", waist: "28 in / 71 cm" },
    { size: "M", bust: "36 in / 91 cm", waist: "30 in / 76 cm" },
    { size: "L", bust: "38 in / 97 cm", waist: "32 in / 81 cm" },
    { size: "XL", bust: "40 in / 102 cm", waist: "34 in / 86 cm" },
  ],
}

export function sizeChartForCategory(category: Category): SizeChartRow[] | undefined {
  return SIZE_CHARTS[category]
}
