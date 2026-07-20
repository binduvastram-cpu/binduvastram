export type Category =
  | "sarees"
  | "mens-wear"
  | "womens-wear"
  | "blouses"
  | "jewellery"
  | "handbags"
  | "petticoats"
  | "salwar-suits"
  | "designer"

// Widened so admin-created categories (arbitrary slugs, see categories-store.tsx)
// are assignable too, while the built-in literals still autocomplete.
export type CategoryValue = Category | (string & {})

export interface CategoryInfo {
  value: CategoryValue
  label: string
  image: string | null
}

export interface ProductProperties {
  fabric?: string
  work?: string
  blouseIncluded?: boolean
  washCare?: string
  occasion?: string
  color?: string
  length?: string
  material?: string
}

export interface Product {
  id: string
  // Human-readable/searchable code, auto-generated from category/collection
  // at creation time (e.g. "SL001" for a Silk saree, "CO002" for Cotton).
  // Purely additive — routing/cart/wishlist still key off `id`.
  code?: string
  name: string
  tagline?: string
  description: string
  price: number
  mrp: number | null
  images: string[]
  videoUrl?: string
  // Only meaningful when category === "sarees" — the most specific saree
  // collection slug known for this product (see lib/saree-collections.ts).
  collection?: string
  category: CategoryValue
  properties: ProductProperties
  sizes?: string[]
  // Per-size stock; a size with 0 (or missing when `sizes` is set) is disabled in the selector.
  sizeStock?: Record<string, number>
  stock: number
  codAvailable: boolean
  estimatedDeliveryDays: [number, number]
  // Defaults to true when omitted (all seed products are active).
  isActive?: boolean
  // Stamped once at creation, never edited — every "New"/"Bestseller"/
  // "Most Wanted" badge is derived live from this plus real order data
  // (see lib/product-tags.ts and lib/social-proof.ts) instead of a manual flag.
  createdAt: string
  // Manual baseline an admin can seed before a product has real sales history;
  // real order quantities are added to this automatically as they come in
  // (see lib/social-proof.ts#displayBoughtCount) instead of replacing it.
  boughtCount?: number
}

export interface Review {
  id: string
  productId: string
  customerName: string
  rating: number
  text: string
  status: "pending" | "approved" | "rejected"
  reply?: string
  createdAt: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  couponCode: string
  redeemed: boolean
  createdAt: string
}

export interface VirtualShoppingRequest {
  id: string
  name: string
  phone: string
  productId?: string
  productName?: string
  preferredDate: string
  preferredTime: string
  topic: string
  status: "pending" | "confirmed" | "completed"
  createdAt: string
}

export interface CustomerProfile {
  id: string
  name: string
  phone: string
  address: string
  pincode: string
  createdAt: string
}

export type OrderStatus =
  | "Placed"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"

export interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  image: string
}

export interface Order {
  id: string
  items: OrderItem[]
  total: number
  customerName: string
  customerPhone: string
  customerAddress: string
  customerPincode: string
  paymentMethod: "COD"
  paymentStatus: "Pending" | "Paid on Delivery"
  orderStatus: OrderStatus
  createdAt: string
}

export interface Offer {
  id: string
  title: string
  description?: string
  scope: "product" | "category"
  // A productId when scope is "product", a Category value when scope is "category".
  targetId: string
  discountType: "percent" | "flat"
  discountValue: number
  startDate?: string
  endDate?: string
  isActive: boolean
  createdAt: string
}
