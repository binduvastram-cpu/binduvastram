"use client"

import { useState } from "react"
import Image from "next/image"
import { Plus, Pencil, Trash2, Search, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useProducts } from "@/components/boty/products-store"
import { categories } from "@/lib/products"
import { IMAGE_LIBRARY } from "@/lib/image-library"
import type { Product, Category } from "@/lib/types"

function emptyProduct(): Product {
  return {
    id: `product_${Date.now()}`,
    name: "",
    tagline: "",
    description: "",
    price: 0,
    mrp: null,
    images: [],
    badge: null,
    category: "sarees",
    properties: {},
    stock: 0,
    codAvailable: true,
    estimatedDeliveryDays: [4, 7],
    isActive: true,
  }
}

export default function AdminProductsPage() {
  const { products, hydrated, addProduct, updateProduct, deleteProduct } = useProducts()
  const [search, setSearch] = useState("")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (!hydrated) return null

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))

  const handleSave = (product: Product) => {
    if (isCreating) {
      addProduct(product)
    } else {
      updateProduct(product)
    }
    setEditingProduct(null)
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

      <div className="relative mb-6 max-w-sm">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products..."
          className="w-full bg-card border border-border/50 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary/50 boty-transition"
        />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-2xl boty-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-background text-muted-foreground text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-5 py-3">Product</th>
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
                <td className="px-5 py-3 text-muted-foreground capitalize">{product.category.replace("-", " ")}</td>
                <td className="px-5 py-3 text-foreground">₹{product.price.toLocaleString("en-IN")}</td>
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
              <p className="text-xs text-muted-foreground capitalize mb-1">{product.category.replace("-", " ")}</p>
              <p className="text-sm text-foreground">₹{product.price.toLocaleString("en-IN")} • Stock: {product.stock}</p>
            </div>
            <div className="flex flex-col items-end justify-between">
              <span className={`text-xs px-2 py-0.5 rounded-full ${product.isActive !== false ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {product.isActive !== false ? "Active" : "Inactive"}
              </span>
              <div className="flex gap-1">
                <button type="button" onClick={() => { setEditingProduct(product); setIsCreating(false) }} className="p-2 text-muted-foreground" aria-label="Edit">
                  <Pencil className="w-4 h-4" />
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
          <label className="text-sm font-medium text-foreground mb-2 block">Category</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
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
          <label className="text-sm font-medium text-foreground mb-2 block">Stock Quantity</label>
          <input
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Badge</label>
          <select
            value={form.badge ?? ""}
            onChange={(e) => setForm({ ...form, badge: (e.target.value || null) as Product["badge"] })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          >
            <option value="">None</option>
            <option value="New">New</option>
            <option value="Sale">Sale</option>
            <option value="Bestseller">Bestseller</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Fabric</label>
          <input
            value={form.properties.fabric ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, fabric: e.target.value } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Work</label>
          <input
            value={form.properties.work ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, work: e.target.value } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Color</label>
          <input
            value={form.properties.color ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, color: e.target.value } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Occasion</label>
          <input
            value={form.properties.occasion ?? ""}
            onChange={(e) => setForm({ ...form, properties: { ...form.properties, occasion: e.target.value } })}
            className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
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
