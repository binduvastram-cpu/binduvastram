export type Category =
  | "sarees"
  | "mens-wear"
  | "womens-wear"
  | "blouses"
  | "jewellery"
  | "handbags"
  | "petticoats"

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
  stock: number
  codAvailable: boolean
  estimatedDeliveryDays: [number, number]
  // Defaults to true when omitted (all seed products are active).
  isActive?: boolean
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
