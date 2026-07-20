"use client"

import { useState, useMemo, useEffect, type ChangeEvent } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Search, Check, Copy, Loader2, Upload } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useProducts } from "@/components/boty/products-store"
import { useCategories } from "@/components/boty/categories-store"
import { useCollections } from "@/components/boty/collections-store"
import { useAttributes } from "@/components/boty/attributes-store"
import { IMAGE_LIBRARY } from "@/lib/image-library"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { isOutOfStock } from "@/lib/product-tags"
import { generateProductCode } from "@/lib/product-code"
import { slugify } from "@/lib/saree-collections"
import { uploadProductMedia } from "@/lib/supabase/upload"

function emptyProduct(): Product {
  return {
    id: `product_${Date.now()}`,
    name: "",
    tagline: "",
    description: "",
    price: 0,
    mrp: null,
    images: [],
    category: "sarees",
    properties: {},
    stock: 0,
    codAvailable: true,
    estimatedDeliveryDays: [4, 7],
    isActive: true,
    createdAt: new Date().toISOString(),
  }
}

type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock"

export default function AdminProductsPage() {
  const { products, hydrated, addProduct, updateProduct, deleteProduct } = useProducts()
  const { categories, hydrated: categoriesHydrated } = useCategories()
  const { collectionLabel, hydrated: collectionsHydrated } = useCollections()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<StockFilter>("all")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return products.filter((p) => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.code?.toLowerCase().includes(q) ?? false) ||
          (p.properties.fabric?.toLowerCase().includes(q) ?? false)
        if (!matches) return false
      }
      if (categoryFilter !== "all" && p.category !== categoryFilter) return false
      if (priceMin && p.price < Number(priceMin)) return false
      if (priceMax && p.price > Number(priceMax)) return false
      if (stockFilter === "out-of-stock" && !isOutOfStock(p)) return false
      if (stockFilter === "low-stock" && !(p.stock > 0 && p.stock <= 5)) return false
      if (stockFilter === "in-stock" && p.stock <= 5) return false
      return true
    })
  }, [products, search, categoryFilter, stockFilter, priceMin, priceMax])

  if (!hydrated || !categoriesHydrated || !collectionsHydrated) return null

  const handleSave = async (product: Product) => {
    if (isCreating) {
      await addProduct({ ...product, code: product.code || generateProductCode(product, products) })
    } else {
      await updateProduct(product)
    }
    setEditingProduct(null)
    setIsCreating(false)
  }

  const handleDuplicate = async (product: Product) => {
    const duplicate: Product = {
      ...product,
      id: `product_${Date.now()}`,
      code: generateProductCode(product, products),
      name: `${product.name} (Copy)`,
      createdAt: new Date().toISOString(),
    }
    const created = await addProduct(duplicate)
    setEditingProduct(created)
    setIsCreating(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Products</h1>
          <p className="text-muted-foreground">{products.length} total</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingProduct(emptyProduct())
            setIsCreating(true)
          }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, or fabric..."
            className="w-full bg-card border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 boty-transition"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-card border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          className="bg-card border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        >
          <option value="all">All Stock</option>
          <option value="in-stock">In Stock</option>
          <option value="low-stock">Low Stock (≤5)</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
        <input
          type="number"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          placeholder="Min ₹"
          className="w-24 bg-card border border-border/50 rounded-full px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
        <input
          type="number"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          placeholder="Max ₹"
          className="w-24 bg-card border border-border/50 rounded-full px-3 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl boty-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Product</th>
              <th className="text-left px-5 py-3">Code</th>
              <th className="text-left px-5 py-3">Category</th>
              <th className="text-left px-5 py-3">Price</th>
              <th className="text-left px-5 py-3">Stock</th>
              <th className="text-left px-5 py-3">Status</th>
              <th className="text-right px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id} className="border-t border-border/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill sizes="40px" className="object-cover" />
                    </div>
                    <span className="text-foreground font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-mono text-xs">{product.code ?? "—"}</td>
                <td className="px-5 py-3 text-muted-foreground capitalize">
                  {product.category.replace("-", " ")}
                  {product.collection && <span className="text-xs"> • {collectionLabel(product.collection)}</span>}
                </td>
                <td className="px-5 py-3 text-foreground">{formatPrice(product.price)}</td>
                <td className="px-5 py-3 text-foreground">{product.stock}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full ${product.isActive !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {product.isActive !== false ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button type="button" onClick={() => { setEditingProduct(product); setIsCreating(false) }} className="p-2 text-muted-foreground hover:text-foreground boty-transition" aria-label="Edit">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => handleDuplicate(product)} className="p-2 text-muted-foreground hover:text-foreground boty-transition" aria-label="Duplicate">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button type="button" onClick={() => setConfirmDeleteId(product.id)} className="p-2 text-muted-foreground hover:text-destructive boty-transition" aria-label="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {filtered.map((product) => (
          <div key={product.id} className="bg-card rounded-2xl boty-shadow p-4 flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              <Image src={product.images[0] || "/placeholder.svg"} alt={product.name} fill sizes="64px" className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground capitalize mb-1">{product.category.replace("-", " ")} {product.code && `• ${product.code}`}</p>
              <p className="text-sm text-foreground">{formatPrice(product.price)} • Stock: {product.stock}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {product.isActive !== false ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditingProduct(product); setIsCreating(false) }} className="p-2 text-muted-foreground" aria-label="Edit">
                  <Pencil className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => handleDuplicate(product)} className="p-2 text-muted-foreground" aria-label="Duplicate">
                  <Copy className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setConfirmDeleteId(product.id)} className="p-2 text-muted-foreground" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Create Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreating ? "Add Product" : "Edit Product"}</DialogTitle>
            <DialogDescription className="sr-only">Product details form</DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setEditingProduct(null)} />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this product?</DialogTitle>
            <DialogDescription>This can't be undone.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                if (confirmDeleteId) deleteProduct(confirmDeleteId)
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

function ProductForm({
  product,
  onSave,
  onCancel,
}: {
  product: Product
  onSave: (product: Product) => void
  onCancel: () => void
}) {
  const [form, setForm] = useState<Product>(product)
  const [imageUrlInput, setImageUrlInput] = useState("")
  const { categories } = useCategories()
  const { families, addItem } = useCollections()
  const { attributes } = useAttributes()
  const [addingType, setAddingType] = useState(false)
  const [newTypeFamily, setNewTypeFamily] = useState<string>("")
  const [newTypeGroup, setNewTypeGroup] = useState<string>("")
  const [newTypeLabel, setNewTypeLabel] = useState("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)

  // Sum per-size stock automatically once sizes are set — keeps the two
  // numbers from ever drifting apart instead of trusting a second manual entry.
  useEffect(() => {
    if (!form.sizes || form.sizes.length === 0) return
    const total = form.sizes.reduce((sum, size) => sum + (form.sizeStock?.[size] ?? 0), 0)
    if (total !== form.stock) setForm((f) => ({ ...f, stock: total }))
  }, [form.sizes, form.sizeStock])

  const toggleImage = (src: string) => {
    setForm((f) => ({
      ...f,
      images: f.images.includes(src) ? f.images.filter((i) => i !== src) : [...f.images, src],
    }))
  }

  const addImageUrl = () => {
    if (!imageUrlInput.trim()) return
    setForm((f) => ({ ...f, images: [...f.images, imageUrlInput.trim()] }))
    setImageUrlInput("")
  }

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ""
    if (files.length === 0) return
    setUploadingImage(true)
    try {
      const urls = await Promise.all(files.map((file) => uploadProductMedia(file, "image")))
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleVideoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    setUploadingVideo(true)
    try {
      const url = await uploadProductMedia(file, "video")
      setForm((f) => ({ ...f, videoUrl: url }))
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleSubmit = () => {
    if (!form.name.trim() || form.images.length === 0) return
    onSave(form)
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Name</label>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Product Code</label>
          <input
            disabled
            value={form.code ?? "Auto-generated on save"}
            className="w-full bg-muted border border-border/50 rounded-full px-4 py-2.5 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-1.5">
            Don't see the right category? <a href="/admin/categories" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Manage categories</a>
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Price (₹)</label>
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">MRP (₹, optional)</label>
          <input
            type="number"
            value={form.mrp ?? ""}
            onChange={(e) => setForm({ ...form, mrp: e.target.value ? Number(e.target.value) : null })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Stock Quantity {form.sizes && form.sizes.length > 0 && <span className="text-muted-foreground font-normal">(auto-summed from sizes below)</span>}
          </label>
          <input
            type="number"
            disabled={!!(form.sizes && form.sizes.length > 0)}
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className={`w-full border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 ${
              form.sizes && form.sizes.length > 0 ? "bg-muted text-muted-foreground" : "bg-background"
            }`}
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground -mt-2">
        "Out of Stock", "Limited Stock", "New", "Bestseller" and "Most Wanted" badges are all shown automatically
        (from stock, listing age, and real order volume) — there's nothing to tag by hand.
      </p>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      {form.category === "sarees" && (
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Saree Collection</label>
          <select
            value={form.collection ?? ""}
            onChange={(e) => setForm({ ...form, collection: e.target.value || undefined })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {Object.entries(families).map(([familySlug, family]) => (
              <optgroup key={familySlug} label={family.label}>
                <option value={familySlug}>All {family.label}</option>
                {family.groups
                  ? Object.entries(family.groups).flatMap(([groupSlug, group]) => [
                      <option key={groupSlug} value={groupSlug}>{group.label} (all)</option>,
                      ...group.items.map((item) => {
                        const slug = slugify(item)
                        return <option key={slug} value={slug}>{`— ${item}`}</option>
                      }),
                    ])
                  : (family.items ?? []).map((item) => {
                      const slug = slugify(item)
                      return <option key={slug} value={slug}>{item}</option>
                    })}
              </optgroup>
            ))}
          </select>

          {!addingType ? (
            <button
              type="button"
              onClick={() => {
                setAddingType(true)
                setNewTypeFamily(Object.keys(families)[0] ?? "")
                setNewTypeGroup("")
              }}
              className="mt-2 text-xs text-primary underline"
            >
              + Add new saree type
            </button>
          ) : (
            <div className="mt-3 bg-muted/50 rounded-2xl p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newTypeFamily}
                  onChange={(e) => { setNewTypeFamily(e.target.value); setNewTypeGroup("") }}
                  className="bg-background border border-border/50 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
                >
                  {Object.entries(families).map(([slug, f]) => (
                    <option key={slug} value={slug}>{f.label}</option>
                  ))}
                </select>
                {families[newTypeFamily]?.groups && (
                  <select
                    value={newTypeGroup}
                    onChange={(e) => setNewTypeGroup(e.target.value)}
                    className="bg-background border border-border/50 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
                  >
                    <option value="">(no group)</option>
                    {Object.entries(families[newTypeFamily].groups ?? {}).map(([slug, g]) => (
                      <option key={slug} value={slug}>{g.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={newTypeLabel}
                  onChange={(e) => setNewTypeLabel(e.target.value)}
                  placeholder="New type name, e.g. Uppada Silk"
                  className="flex-1 bg-background border border-border/50 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
                />
                <button
                  type="button"
                  onClick={async () => {
                    if (!newTypeLabel.trim()) return
                    const slug = await addItem(newTypeFamily, newTypeGroup || null, newTypeLabel.trim())
                    setForm((f) => ({ ...f, collection: slug }))
                    setNewTypeLabel("")
                    setAddingType(false)
                  }}
                  className="px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-xs font-medium whitespace-nowrap"
                >
                  Add &amp; Select
                </button>
                <button type="button" onClick={() => setAddingType(false)} className="px-3 py-1.5 text-xs text-muted-foreground">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Fabric</label>
          <select
            value={form.properties.fabric ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, fabric: e.target.value || undefined } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {attributes.fabric.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Work</label>
          <select
            value={form.properties.work ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, work: e.target.value || undefined } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {attributes.work.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
          <select
            value={form.properties.color ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, color: e.target.value || undefined } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {attributes.color.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Occasion</label>
          <select
            value={form.properties.occasion ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, occasion: e.target.value || undefined } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {attributes.occasion.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Material (bags)</label>
          <select
            value={form.properties.material ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, material: e.target.value || undefined } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            {attributes.material.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Don't see the right value? <a href="/admin/attributes" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Manage attributes</a>
      </p>

      {/* Sizes (fixed list, multi-select) + per-size stock */}
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Sizes (leave none selected if not applicable)</label>
        <div className="flex flex-wrap gap-2">
          {attributes.size.map((size) => {
            const selected = (form.sizes ?? []).includes(size)
            return (
              <button
                key={size}
                type="button"
                onClick={() => {
                  const current = form.sizes ?? []
                  const sizes = selected ? current.filter((s) => s !== size) : [...current, size]
                  setForm({ ...form, sizes: sizes.length > 0 ? sizes : undefined })
                }}
                className={`px-4 py-1.5 rounded-full text-sm border boty-transition ${
                  selected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border/50 text-foreground hover:border-primary/50"
                }`}
              >
                {size}
              </button>
            )
          })}
        </div>
        {form.sizes && form.sizes.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-3">
            {form.sizes.map((size) => (
              <div key={size}>
                <label className="text-xs text-muted-foreground mb-1 block">{size} stock</label>
                <input
                  type="number"
                  value={form.sizeStock?.[size] ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, sizeStock: { ...form.sizeStock, [size]: Number(e.target.value) } })
                  }
                  className="w-full bg-background border border-border/50 rounded-full px-3 py-2 text-sm focus:outline-none focus:border-primary/50"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Social proof (Section 5) */}
      <div className="border-t border-border/50 pt-5">
        <p className="text-sm font-medium text-foreground mb-1">Social Proof</p>
        <p className="text-xs text-muted-foreground mb-3">
          "New" is automatic from listing age, and "Bestseller"/"Most Wanted" badges plus the shopper counts below are
          computed from real orders once they exist. Bought Count is the only manual number — a baseline for a new
          listing that real sales add to automatically, never replace.
        </p>
        <div className="max-w-xs">
          <label className="text-xs text-muted-foreground mb-2 block">Bought Count (baseline)</label>
          <input
            type="number"
            value={form.boughtCount ?? ""}
            onChange={(e) => setForm({ ...form, boughtCount: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 flex-wrap">
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isActive !== false}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active (visible in shop)
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.codAvailable}
            onChange={(e) => setForm({ ...form, codAvailable: e.target.checked })}
          />
          COD Available
        </label>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Images {form.images.length === 0 && <span className="text-destructive">— at least 1 required</span>}
        </label>
        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm boty-transition cursor-pointer mb-3 ${uploadingImage ? "opacity-60 pointer-events-none" : ""}`}>
          {uploadingImage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploadingImage ? "Uploading..." : "Upload Image(s)"}
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
          {form.images
            .filter((src) => !IMAGE_LIBRARY.includes(src))
            .map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => toggleImage(src)}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-primary"
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" unoptimized={src.includes("supabase.co")} />
                <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              </button>
            ))}
        </div>
        <p className="text-xs text-muted-foreground mb-2">Or pick from the curated sample library:</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 mb-3">
          {IMAGE_LIBRARY.map((src) => {
            const selected = form.images.includes(src)
            return (
              <button
                key={src}
                type="button"
                onClick={() => toggleImage(src)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 boty-transition ${
                  selected ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                {selected && (
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
        <div className="flex gap-2">
          <input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="Or paste an external image URL"
            className="flex-1 bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
          />
          <button type="button" onClick={addImageUrl} className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm boty-transition">
            Add
          </button>
        </div>
        {form.images.length > 0 && (
          <p className="text-xs text-muted-foreground mt-2">{form.images.length} image(s) selected</p>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Product Video (optional)</label>
        <div className="flex gap-2 mb-2">
          <input
            value={form.videoUrl ?? ""}
            onChange={(e) => setForm({ ...form, videoUrl: e.target.value || undefined })}
            placeholder="https://... (shown as an extra slide in the product gallery)"
            className="flex-1 bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
          <label className={`inline-flex items-center gap-2 px-4 py-2.5 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm boty-transition cursor-pointer shrink-0 ${uploadingVideo ? "opacity-60 pointer-events-none" : ""}`}>
            {uploadingVideo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {uploadingVideo ? "Uploading..." : "Upload"}
            <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" disabled={uploadingVideo} />
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
        >
          Save Product
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
