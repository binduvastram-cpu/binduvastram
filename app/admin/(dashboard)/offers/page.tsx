"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Tag } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useOffers } from "@/components/boty/offers-store"
import { useProducts } from "@/components/boty/products-store"
import { useCategories } from "@/components/boty/categories-store"
import type { Offer } from "@/lib/types"
import { discountLabel } from "@/lib/offers"

function emptyOffer(defaultTargetId: string): Offer {
  return {
    id: `offer_${Date.now()}`,
    title: "",
    description: "",
    scope: "category",
    targetId: defaultTargetId,
    discountType: "percent",
    discountValue: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

function offerStatus(offer: Offer): { label: string; className: string } {
  const now = new Date()
  if (!offer.isActive) return { label: "Inactive", className: "bg-muted text-muted-foreground" }
  if (offer.startDate && new Date(offer.startDate) > now) return { label: "Scheduled", className: "bg-accent/10 text-accent" }
  if (offer.endDate && new Date(offer.endDate) < now) return { label: "Expired", className: "bg-muted text-muted-foreground" }
  return { label: "Active", className: "bg-primary/10 text-primary" }
}

export default function AdminOffersPage() {
  const { offers, hydrated, addOffer, updateOffer, deleteOffer } = useOffers()
  const { products } = useProducts()
  const { categories, hydrated: categoriesHydrated } = useCategories()
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!hydrated || !categoriesHydrated) return null

  const targetLabel = (offer: Offer) => {
    if (offer.scope === "product") return products.find((p) => p.id === offer.targetId)?.name ?? "Unknown product"
    return categories.find((c) => c.value === offer.targetId)?.label ?? offer.targetId
  }

  const handleSave = (offer: Offer) => {
    if (isCreating) {
      addOffer(offer)
    } else {
      updateOffer(offer)
    }
    setEditingOffer(null)
    setIsCreating(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Offers</h1>
          <p className="text-muted-foreground">{offers.length} total</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingOffer(emptyOffer(categories[0]?.value ?? ""))
            setIsCreating(true)
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Offer
        </button>
      </div>

      {offers.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <Tag className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No offers yet — create one to start discounting a product or category.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const status = offerStatus(offer)
            return (
              <div key={offer.id} className="bg-card rounded-2xl boty-shadow p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground">{offer.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {discountLabel(offer)} on {offer.scope === "product" ? "product" : "category"}: {targetLabel(offer)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setEditingOffer(offer); setIsCreating(false) }} className="p-2 text-muted-foreground hover:text-foreground boty-transition" aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(offer.id)} className="p-2 text-muted-foreground hover:text-destructive boty-transition" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingOffer} onOpenChange={(open) => !open && setEditingOffer(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add Offer" : "Edit Offer"}</DialogTitle>
            <DialogDescription className="sr-only">Offer details form</DialogDescription>
          </DialogHeader>
          {editingOffer && (
            <OfferForm offer={editingOffer} onSave={handleSave} onCancel={() => setEditingOffer(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this offer?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirmDeleteId) deleteOffer(confirmDeleteId)
                setConfirmDeleteId(null)
              }}
              className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-full text-sm font-medium"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteId(null)}
              className="flex-1 border border-border py-2.5 rounded-full text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OfferForm({
  offer,
  onSave,
  onCancel,
}: {
  offer: Offer
  onSave: (offer: Offer) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Offer>(offer)
  const { products } = useProducts()
  const { categories } = useCategories()

  const handleSubmit = () => {
    if (!form.title.trim() || !form.targetId) return
    onSave(form)
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Title</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Aadi Sale"
          className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Description (optional)</label>
        <textarea
          value={form.description ?? ""}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={2}
          className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Applies To</label>
        <div className="flex gap-3 mb-3">
          {(["category", "product"] as const).map((scope) => (
            <label key={scope} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="scope"
                checked={form.scope === scope}
                onChange={() => setForm({ ...form, scope, targetId: scope === "category" ? categories[0]?.value ?? "" : products[0]?.id ?? "" })}
                className="accent-primary"
              />
              {scope === "category" ? "Entire Category" : "Specific Product"}
            </label>
          ))}
        </div>
        {form.scope === "category" ? (
          <select
            value={form.targetId}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        ) : (
          <select
            value={form.targetId}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} {p.code ? `(${p.code})` : ""}</option>
            ))}
          </select>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Discount Type</label>
          <select
            value={form.discountType}
            onChange={(e) => setForm({ ...form, discountType: e.target.value as Offer["discountType"] })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="percent">Percentage (%)</option>
            <option value="flat">Flat Amount (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Discount Value {form.discountType === "percent" ? "(%)" : "(₹)"}
          </label>
          <input
            type="number"
            value={form.discountValue}
            onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Start Date (optional)</label>
          <input
            type="date"
            value={form.startDate?.slice(0, 10) ?? ""}
            onChange={(e) => setForm({ ...form, startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">End Date (optional)</label>
          <input
            type="date"
            value={form.endDate?.slice(0, 10) ?? ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Active
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
        >
          Save Offer
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-border text-foreground py-3 rounded-full font-medium boty-transition hover:bg-muted"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
