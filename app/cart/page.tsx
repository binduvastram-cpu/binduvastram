"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Check, MessageCircle } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useAccount } from "@/components/boty/account-context"
import { useOrders } from "@/components/boty/orders-store"
import { AccountDetailsForm } from "@/components/boty/account-form"
import type { Order } from "@/lib/types"

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const { profile, isLoggedIn, createAccount } = useAccount()
  const { placeOrder } = useOrders()
  const [couponCode, setCouponCode] = useState("")
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const shipping = 0
  const total = subtotal + shipping

  // UI-only placeholder — real coupon validation runs server-side against
  // Supabase in phase 2. No discount is actually applied here.
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return
    setCouponMessage("Coupon codes will be validated at checkout once payments go live.")
  }

  const createOrderForProfile = (customer: { name: string; phone: string; address: string; pincode: string }) => {
    const order: Order = {
      id: `bv_${Date.now()}`,
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      total,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      customerPincode: customer.pincode,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      orderStatus: "Placed",
      createdAt: new Date().toISOString(),
    }
    placeOrder(order)
    clearCart()
    setConfirmedOrder(order)
  }

  const handleProceedToBuy = () => {
    if (profile && isLoggedIn) {
      createOrderForProfile(profile)
    } else {
      setShowAddressForm(true)
    }
  }

  const whatsappMessage = confirmedOrder
    ? `Hi Bindu Vastram, I've placed order #${confirmedOrder.id.slice(-6).toUpperCase()} for ₹${confirmedOrder.total.toLocaleString("en-IN")} (COD). Please confirm.`
    : ""

  if (confirmedOrder) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20">
          <div className="max-w-xl mx-auto px-6 lg:px-8">
            <div className="bg-card rounded-3xl boty-shadow p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-2">Order Placed!</h1>
              <p className="text-muted-foreground mb-1">
                Order #{confirmedOrder.id.slice(-6).toUpperCase()} • ₹{confirmedOrder.total.toLocaleString("en-IN")} (Cash on Delivery)
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                We'll prepare your order for dispatch. You can track its status anytime from your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`https://wa.me/917795092349?text=${encodeURIComponent(whatsappMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-full font-medium boty-transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  Confirm on WhatsApp
                </a>
                <Link
                  href="/account"
                  className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground py-3 rounded-full font-medium boty-transition hover:bg-muted"
                >
                  View Order
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">Your Cart</h1>
          <p className="text-muted-foreground mb-12">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>

          {showAddressForm ? (
            <div className="max-w-xl mx-auto bg-card rounded-3xl boty-shadow p-8">
              <h2 className="font-serif text-2xl text-foreground mb-2">Delivery Details</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We just need this once — save it to place future orders in one tap.
              </p>
              <AccountDetailsForm
                submitLabel={`Place Order (COD) • ₹${total.toLocaleString("en-IN")}`}
                onSubmit={(details) => {
                  createAccount(details)
                  createOrderForProfile(details)
                }}
              />
              <button
                type="button"
                onClick={() => setShowAddressForm(false)}
                className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground boty-transition"
              >
                Back to cart
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl boty-shadow">
              <ShoppingBag className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-6">Your cart is empty</p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10 min-w-0">
              {/* Items */}
              <div className="lg:col-span-2 space-y-6 min-w-0">
                {items.map((item) => (
                  <div key={item.id} className="bg-card rounded-2xl p-4 boty-shadow overflow-hidden">
                    {/* Mobile layout — separate from desktop, no shared flex-wrap math */}
                    <div className="sm:hidden">
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="64px" className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm text-foreground mb-0.5 font-semibold truncate">{item.name}</h3>
                          <p className="text-muted-foreground text-xs mb-1 truncate">{item.description}</p>
                          <p className="font-medium text-foreground text-sm">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                        <QuantityControls
                          quantity={item.quantity}
                          onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                          onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-muted-foreground hover:text-destructive boty-transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:flex gap-4">
                      <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="96px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-base text-foreground mb-1 font-semibold">{item.name}</h3>
                        <p className="text-muted-foreground mb-3 text-sm">{item.description}</p>
                        <div className="flex items-center gap-3">
                          <QuantityControls
                            quantity={item.quantity}
                            onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                            onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                          />
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive boty-transition"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-foreground">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="bg-card rounded-2xl p-6 boty-shadow h-fit space-y-6 min-w-0">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Coupon Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 bg-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary boty-transition"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm boty-transition"
                    >
                      Apply
                    </button>
                  </div>
                  {couponMessage && <p className="text-xs text-muted-foreground mt-2">{couponMessage}</p>}
                </div>

                <div className="space-y-2 text-sm border-t border-border/50 pt-4">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>₹{total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToBuy}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium hover:bg-primary/90 boty-transition"
                >
                  Proceed to Buy — Cash on Delivery
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  UPI, cards, and netbanking are coming in a future update — Cash on Delivery only for now.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

function QuantityControls({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number
  onDecrease: () => void
  onIncrease: () => void
}) {
  return (
    <div className="flex items-center border border-border rounded-full">
      <button
        type="button"
        onClick={onDecrease}
        className="p-2 hover:bg-muted boty-transition rounded-l-full"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3 h-3" />
      </button>
      <span className="px-3 text-sm font-medium">{quantity}</span>
      <button
        type="button"
        onClick={onIncrease}
        className="p-2 hover:bg-muted boty-transition rounded-r-full"
        aria-label="Increase quantity"
      >
        <Plus className="w-3 h-3" />
      </button>
    </div>
  )
}
