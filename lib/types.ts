export type Category =
  | "sarees"
  | "mens-wear"
  | "womens-wear"
  | "blouses"
  | "jewellery"
  | "handbags"
  | "petticoats"
  | "salwar-suits"

export interface CategoryInfo {
  value: Category
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
  name: string
  tagline?: string
  description: string
  price: number
  mrp: number | null
  images: string[]
  badge: "New" | "Sale" | "Bestseller" | null
  category: Category
  properties: ProductProperties
  sizes?: string[]
  // Per-size stock; a size with 0 (or missing when `sizes` is set) is disabled in the selector.
  sizeStock?: Record<string, number>
  stock: number
  codAvailable: boolean
  estimatedDeliveryDays: [number, number]
  // Defaults to true when omitted (all seed products are active).
  isActive?: boolean
  // New Arrivals control — shown while `badge === "New"` OR until this date if set.
  newArrivalUntil?: string
  // Social proof (Section 5) — hybrid, defaults to "manual" since a new store
  // has little/no real order history yet. Admin can flip to "real" per product
  // once genuine order volume exists.
  socialProofMode?: "manual" | "real"
  boughtCount?: number
  sampleLocations?: string[]
  likeCountBase?: number
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
