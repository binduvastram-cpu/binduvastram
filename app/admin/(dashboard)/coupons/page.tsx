"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, BadgePercent } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useCoupons } from "@/components/boty/coupons-store"
import { useProducts } from "@/components/boty/products-store"
import { useCategories } from "@/components/boty/categories-store"
import type { Coupon } from "@/lib/types"

function emptyCoupon(): Coupon {
  const end = new Date()
  end.setDate(end.getDate() + 30)
  return {
    id: `coupon_${Date.now()}`,
    code: "",
    discountPercent: 10,
    scope: "all",
    endDate: end.toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

function couponStatus(coupon: Coupon): { label: string; className: string } {
  const now = new Date()
  if (!coupon.isActive) return { label: "Inactive", className: "bg-muted text-muted-foreground" }
  if (coupon.startDate && new Date(coupon.startDate) > now) return { label: "Scheduled", className: "bg-accent/10 text-accent" }
  if (new Date(coupon.endDate) < now) return { label: "Expired", className: "bg-muted text-muted-foreground" }
  return { label: "Active", className: "bg-primary/10 text-primary" }
}

export default function AdminCouponsPage() {
  const { coupons, hydrated, addCoupon, updateCoupon, deleteCoupon } = useCoupons()
  const { products } = useProducts()
  const { categories, hydrated: categoriesHydrated } = useCategories()
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!hydrated || !categoriesHydrated) return null

  const targetLabel = (coupon: Coupon) => {
    if (coupon.scope === "all") return "All Products"
    if (coupon.scope === "product") return products.find((p) => p.id === coupon.targetId)?.name ?? "Unknown product"
    return categories.find((c) => c.value === coupon.targetId)?.label ?? coupon.targetId
  }

  const handleSave = (coupon: Coupon) => {
    if (isCreating) {
      addCoupon(coupon)
    } else {
      updateCoupon(coupon)
    }
    setEditingCoupon(null)
    setIsCreating(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Coupons</h1>
          <p className="text-muted-foreground">{coupons.length} total — codes customers type in at checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingCoupon(emptyCoupon())
            setIsCreating(true)
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Coupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="bg-card rounded-2xl boty-shadow p-10 text-center">
          <BadgePercent className="w-10 h-10 text-muted-foreground/50 mb-3 mx-auto" />
          <p className="text-muted-foreground">No coupons yet — create one to share with customers.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => {
            const status = couponStatus(coupon)
            return (
              <div key={coupon.id} className="bg-card rounded-2xl boty-shadow p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-foreground font-mono">{coupon.code}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>{status.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {coupon.discountPercent}% off on {targetLabel(coupon)} • expires{" "}
                    {new Date(coupon.endDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setEditingCoupon(coupon); setIsCreating(false) }} className="p-2 text-muted-foreground hover:text-foreground boty-transition" aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(coupon.id)} className="p-2 text-muted-foreground hover:text-destructive boty-transition" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingCoupon} onOpenChange={(open) => !open && setEditingCoupon(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add Coupon" : "Edit Coupon"}</DialogTitle>
            <DialogDescription className="sr-only">Coupon details form</DialogDescription>
          </DialogHeader>
          {editingCoupon && (
            <CouponForm coupon={editingCoupon} onSave={handleSave} onCancel={() => setEditingCoupon(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this coupon?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirmDeleteId) deleteCoupon(confirmDeleteId)
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

function CouponForm({
  coupon,
  onSave,
  onCancel,
}: {
  coupon: Coupon
  onSave: (coupon: Coupon) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Coupon>(coupon)
  const { products } = useProducts()
  const { categories } = useCategories()

  const handleSubmit = () => {
    if (!form.code.trim() || !form.endDate) return
    if (form.scope !== "all" && !form.targetId) return
    onSave({ ...form, code: form.code.trim().toUpperCase() })
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Coupon Code</label>
        <input
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          placeholder="e.g. WELCOME20"
          className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-primary/50"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Applies To</label>
        <div className="flex flex-wrap gap-3 mb-3">
          {(["all", "category", "product"] as const).map((scope) => (
            <label key={scope} className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name="scope"
                checked={form.scope === scope}
                onChange={() =>
                  setForm({
                    ...form,
                    scope,
                    targetId: scope === "all" ? undefined : scope === "category" ? categories[0]?.value ?? "" : products[0]?.id ?? "",
                  })
                }
                className="accent-primary"
              />
              {scope === "all" ? "All Products" : scope === "category" ? "Entire Category" : "Specific Product"}
            </label>
          ))}
        </div>
        {form.scope === "category" && (
          <select
            value={form.targetId ?? ""}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        )}
        {form.scope === "product" && (
          <select
            value={form.targetId ?? ""}
            onChange={(e) => setForm({ ...form, targetId: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name} {p.code ? `(${p.code})` : ""}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Discount Percentage (%)</label>
        <input
          type="number"
          min={1}
          max={100}
          value={form.discountPercent}
          onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
          className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
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
          <label className="text-sm font-medium text-foreground mb-2 block">End Date</label>
          <input
            type="date"
            value={form.endDate?.slice(0, 10) ?? ""}
            onChange={(e) => setForm({ ...form, endDate: e.target.value ? new Date(e.target.value).toISOString() : form.endDate })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
            required
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
          Save Coupon
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
