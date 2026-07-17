"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useLeads } from "./leads-store"
import { useAccount } from "./account-context"

const SHOWN_KEY = "bv-discount-popup-shown"
const CLAIMED_KEY = "bv-discount-claimed"
const TRIGGER_DELAY = 6000

export function DiscountPopup() {
  const [open, setOpen] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [alreadyClaimed, setAlreadyClaimed] = useState(true) // assume claimed until checked, to avoid a flash of the tag
  const [couponCode, setCouponCode] = useState("")
  const { addLead } = useLeads()
  const { createAccount } = useAccount()
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "" })

  useEffect(() => {
    setAlreadyClaimed(window.localStorage.getItem(CLAIMED_KEY) === "1")
    if (window.localStorage.getItem(SHOWN_KEY)) return
    const timer = setTimeout(() => setOpen(true), TRIGGER_DELAY)
    return () => clearTimeout(timer)
  }, [])

  const dismiss = () => {
    setOpen(false)
    window.localStorage.setItem(SHOWN_KEY, "1")
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const code = addLead(form)
    // Claiming registers an account against their phone number, so a return
    // visit (or a second order) recognizes them and the same offer can't be
    // claimed twice on this device.
    createAccount({ name: `${form.firstName} ${form.lastName}`.trim(), phone: form.phone, address: "", pincode: "" })
    setCouponCode(code)
    setClaimed(true)
    setAlreadyClaimed(true)
    window.localStorage.setItem(SHOWN_KEY, "1")
    window.localStorage.setItem(CLAIMED_KEY, "1")
  }

  return (
    <>
      {/* Persistent floating tag — stuck to the right edge, above the WhatsApp button's corner */}
      {!alreadyClaimed && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Get 5% off your first order"
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-foreground text-background px-3 py-4 rounded-l-xl boty-shadow boty-transition hover:pr-4"
          style={{ writingMode: "vertical-rl" }}
        >
          <span className="text-xs font-medium tracking-wide">Get 5% OFF</span>
        </button>
      )}

      <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
        <DialogContent className="max-w-md">
          {claimed ? (
            <div className="text-center py-2">
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl text-center">Welcome to Bindu Vastram!</DialogTitle>
                <DialogDescription className="text-center">Here's your code for 5% off your first order.</DialogDescription>
              </DialogHeader>
              <div className="mt-4 bg-card rounded-2xl py-4 px-6 inline-block">
                <p className="text-xl font-medium tracking-widest text-primary">{couponCode}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif text-2xl">Get 5% Off Your First Order</DialogTitle>
                <DialogDescription>Join the Bindu Vastram family and save on your first purchase.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-3 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    required
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                  <input
                    required
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                />
                <div className="flex gap-2">
                  <span className="px-4 py-2.5 bg-background border border-border/50 rounded-full text-sm text-muted-foreground">+91</span>
                  <input
                    required
                    type="tel"
                    placeholder="Phone Number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="flex-1 bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
                >
                  Claim Discount
                </button>
                <button type="button" onClick={dismiss} className="w-full text-sm text-muted-foreground hover:text-foreground text-center boty-transition">
                  No, thanks
                </button>
                <a
                  href="https://instagram.com/binduvastram"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-primary hover:underline"
                >
                  Follow us on Instagram
                </a>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
