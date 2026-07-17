"use client"

import { useState, type FormEvent } from "react"
import { Video, Check } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useVirtualShopping } from "@/components/boty/virtual-shopping-store"
import { useProducts } from "@/components/boty/products-store"

export default function VirtualShoppingPage() {
  const { addRequest } = useVirtualShopping()
  const { products } = useProducts()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ name: "", phone: "", productId: "", preferredDate: "", preferredTime: "", topic: "" })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const selectedProduct = products.find((p) => p.id === form.productId)
    addRequest({
      name: form.name,
      phone: form.phone,
      preferredDate: form.preferredDate,
      preferredTime: form.preferredTime,
      topic: form.topic,
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
    })
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="w-14 h-14 rounded-full bg-card flex items-center justify-center mb-4 mx-auto">
              <Video className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-foreground mb-3 text-balance">Virtual Shopping</h1>
            <p className="text-muted-foreground">
              Book a live video call with our team — perfect for saree draping advice, fabric texture viewing, or
              custom sizing help before you buy.
            </p>
          </div>

          <div className="bg-card rounded-3xl boty-shadow p-8">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-2xl text-foreground mb-2">Request Sent!</h2>
                <p className="text-sm text-muted-foreground">
                  We'll confirm your slot over WhatsApp or a call shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Full Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Phone Number</label>
                  <input
                    required
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="10-digit mobile number"
                    className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Product (optional)</label>
                  <select
                    value={form.productId}
                    onChange={(e) => setForm({ ...form, productId: e.target.value })}
                    className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select a product to discuss</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Preferred Date</label>
                    <input
                      required
                      type="date"
                      value={form.preferredDate}
                      onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                      className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Preferred Time</label>
                    <input
                      required
                      type="time"
                      value={form.preferredTime}
                      onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
                      className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">What would you like help with?</label>
                  <textarea
                    required
                    value={form.topic}
                    onChange={(e) => setForm({ ...form, topic: e.target.value })}
                    rows={3}
                    placeholder="e.g. Saree draping styles for a wedding, fabric texture for silk sarees..."
                    className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90"
                >
                  Request Video Call
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
