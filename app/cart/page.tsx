"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, Check, MessageCircle } from "lucide-react"
import { useCart } from "@/components/boty/cart-context"
import { useAccount } from "@/components/boty/account-context"
import { useOrders } from "@/components/boty/orders-store"
import { useCoupons } from "@/components/boty/coupons-store"
import { useProducts } from "@/components/boty/products-store"
import { ProfileField } from "@/components/boty/account-form"
import { SUPPORT_WHATSAPP_NUMBER, buildWhatsAppLink } from "@/lib/whatsapp"
import type { Order } from "@/lib/types"
import { formatPrice } from "@/lib/format"

const emptyCheckoutForm = { name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" }

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCart()
  const { profile, address, isLoggedIn, logInWithPhone, saveAddress } = useAccount()
  const { placeOrder } = useOrders()
  const { validateCoupon } = useCoupons()
  const { products } = useProducts()
  const [couponCode, setCouponCode] = useState("")
  const [couponMessage, setCouponMessage] = useState<string | null>(null)
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutForm, setCheckoutForm] = useState(emptyCheckoutForm)
  const [prefilled, setPrefilled] = useState(false)
  const [showLoginToggle, setShowLoginToggle] = useState(false)
  const [loginForm, setLoginForm] = useState({ phone: "", password: "" })
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)
  const [placing, setPlacing] = useState(false)

  const shipping = 0
  const discountAmount = appliedCoupon?.discountAmount ?? 0
  const total = Math.max(0, subtotal + shipping - discountAmount)

  // Once a session resolves (already logged in, or just logged in via the
  // "already have an account" toggle below), autofill the checkout form from
  // the saved profile/address — but only once, so it never stomps edits the
  // shopper has already made.
  useEffect(() => {
    if (isLoggedIn && profile && !prefilled) {
      setCheckoutForm({
        name: profile.name || "",
        phone: profile.phone || "",
        line1: address?.line1 ?? "",
        line2: address?.line2 ?? "",
        city: address?.city ?? "",
        state: address?.state ?? "",
        pincode: address?.pincode ?? "",
      })
      setPrefilled(true)
      setShowLoginToggle(false)
    }
  }, [isLoggedIn, profile, address, prefilled])

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    const result = await validateCoupon(couponCode.trim())
    if (!result.valid) {
      setAppliedCoupon(null)
      setCouponMessage(result.message)
      return
    }

    let base = subtotal
    if (result.scope === "category" && result.categoryValue) {
      base = items
        .filter((item) => products.find((p) => p.id === item.id)?.category === result.categoryValue)
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
    } else if (result.scope === "product" && result.productId) {
      base = items.filter((item) => item.id === result.productId).reduce((sum, item) => sum + item.price * item.quantity, 0)
    }

    const amount = Math.round((base * result.discountPercent) / 100)
    if (amount <= 0) {
      setAppliedCoupon(null)
      setCouponMessage("This coupon doesn't apply to any items in your cart.")
      return
    }

    setAppliedCoupon({ code: couponCode.trim().toUpperCase(), discountAmount: amount })
    setCouponMessage(`Coupon applied — you saved ${formatPrice(amount)}!`)
  }

  const handleMiniLogin = async (e: FormEvent) => {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)
    const err = await logInWithPhone(loginForm)
    setLoggingIn(false)
    if (err) setLoginError(err)
  }

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    setPlacing(true)
    const customerAddress = [checkoutForm.line1, checkoutForm.line2, checkoutForm.city, checkoutForm.state]
      .filter(Boolean)
      .join(", ")
    const order = await placeOrder({
      items: items.map((item) => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
      })),
      subtotal,
      total,
      customerName: checkoutForm.name,
      customerPhone: checkoutForm.phone,
      customerAddress,
      customerPincode: checkoutForm.pincode,
      couponCode: appliedCoupon?.code,
      discountAmount: appliedCoupon?.discountAmount,
    })
    if (isLoggedIn) {
      await saveAddress({
        line1: checkoutForm.line1,
        line2: checkoutForm.line2,
        city: checkoutForm.city,
        state: checkoutForm.state,
        pincode: checkoutForm.pincode,
      })
    }
    setPlacing(false)
    clearCart()
    setConfirmedOrder(order)
  }

  const whatsappMessage = confirmedOrder
    ? `Hi Bindu Vastram, I've placed order #${confirmedOrder.orderCode} for ${formatPrice(confirmedOrder.total)} (COD). Please confirm.`
    : ""

  if (confirmedOrder) {
    return (
      <main className="min-h-screen">
        <div className="pt-28 lg:pt-36 pb-20">
          <div className="max-w-xl mx-auto px-6 lg:px-8">
            <div className="bg-card rounded-3xl boty-shadow p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6 mx-auto">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <h1 className="font-serif text-3xl text-foreground mb-2">Order Placed!</h1>
              <p className="text-muted-foreground mb-1">
                Order #{confirmedOrder.orderCode} • {formatPrice(confirmedOrder.total)} (Cash on Delivery)
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                We'll prepare your order for dispatch. You can track its status anytime from your account.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={buildWhatsAppLink(SUPPORT_WHATSAPP_NUMBER, whatsappMessage)}
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
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">Your Cart</h1>
          <p className="text-muted-foreground mb-12">
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>

          {showCheckout ? (
            <div className="max-w-xl mx-auto bg-card rounded-3xl boty-shadow p-8">
              <h2 className="font-serif text-2xl text-foreground mb-2">Delivery Details</h2>
              <p className="text-sm text-muted-foreground mb-6">
                You don't need an account to order — just fill in your details below.
              </p>

              {!isLoggedIn && (
                <div className="mb-6">
                  {!showLoginToggle ? (
                    <button
                      type="button"
                      onClick={() => setShowLoginToggle(true)}
                      className="text-sm text-primary hover:underline"
                    >
                      Already have an account? Log in to autofill your saved details
                    </button>
                  ) : (
                    <form onSubmit={handleMiniLogin} className="bg-background rounded-2xl p-4 space-y-3">
                      <ProfileField
                        label="Mobile Number"
                        value={loginForm.phone}
                        onChange={(v) => setLoginForm({ ...loginForm, phone: v })}
                        placeholder="10-digit mobile number"
                        type="tel"
                        required
                      />
                      <ProfileField
                        label="Password"
                        value={loginForm.password}
                        onChange={(v) => setLoginForm({ ...loginForm, password: v })}
                        type="password"
                        required
                      />
                      {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={loggingIn}
                          className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-primary/90 disabled:opacity-60"
                        >
                          {loggingIn ? "Logging in..." : "Log In"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowLoginToggle(false)}
                          className="flex-1 border border-border text-foreground py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <ProfileField label="Full Name" value={checkoutForm.name} onChange={(v) => setCheckoutForm({ ...checkoutForm, name: v })} placeholder="Your name" required />
                <ProfileField label="Phone Number" value={checkoutForm.phone} onChange={(v) => setCheckoutForm({ ...checkoutForm, phone: v })} placeholder="10-digit mobile number" type="tel" required />
                <ProfileField label="Colony / Street" value={checkoutForm.line1} onChange={(v) => setCheckoutForm({ ...checkoutForm, line1: v })} placeholder="House no, street, colony" textarea required />
                <ProfileField label="Landmark" value={checkoutForm.line2} onChange={(v) => setCheckoutForm({ ...checkoutForm, line2: v })} placeholder="Nearby landmark" />
                <ProfileField label="District / City" value={checkoutForm.city} onChange={(v) => setCheckoutForm({ ...checkoutForm, city: v })} placeholder="District or city" required />
                <div className="grid grid-cols-2 gap-4">
                  <ProfileField label="State" value={checkoutForm.state} onChange={(v) => setCheckoutForm({ ...checkoutForm, state: v })} placeholder="State" required />
                  <ProfileField label="Pincode" value={checkoutForm.pincode} onChange={(v) => setCheckoutForm({ ...checkoutForm, pincode: v })} placeholder="6-digit pincode" required />
                </div>

                <p className="text-xs text-muted-foreground">
                  Need to cancel later? {isLoggedIn
                    ? "You can request cancellation anytime from your Account page."
                    : `Contact us on WhatsApp at ${SUPPORT_WHATSAPP_NUMBER} — cancellation requests need an account.`}
                </p>

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90 disabled:opacity-60"
                >
                  {placing ? "Placing order..." : `Place Order (COD) • ${formatPrice(total)}`}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowCheckout(false)}
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
                          <p className="font-medium text-foreground text-sm">{formatPrice((item.price * item.quantity))}</p>
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
                        <p className="font-medium text-foreground">{formatPrice((item.price * item.quantity))}</p>
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
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-primary">
                      <span>Coupon ({appliedCoupon.code})</span>
                      <span>-{formatPrice(appliedCoupon.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-base font-medium text-foreground pt-2 border-t border-border/50">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCheckout(true)}
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
