import type { Order, OrderStatus } from "@/lib/types"

export const STATUS_MESSAGES: Record<OrderStatus, (order: Order) => string> = {
  Placed: (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} has been placed. Thank you for shopping with us!`,
  Confirmed: (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} has been confirmed and is being prepared.`,
  Packed: (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} has been packed and will be shipped soon.`,
  Shipped: (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} has been shipped.`,
  "Out for Delivery": (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} is out for delivery today.`,
  Delivered: (order) => `Hi ${order.customerName}, your item is delivered, thanks for shopping with Bindu Vastram!`,
  Cancelled: (order) => `Hi ${order.customerName}, your Bindu Vastram order #${order.orderCode} has been cancelled as requested.`,
}
