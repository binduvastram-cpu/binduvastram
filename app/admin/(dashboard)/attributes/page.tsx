"use client"

import { useState } from "react"
import { Plus, Pencil, X, Check } from "lucide-react"
import { useAttributes, ATTRIBUTE_KINDS, type AttributeKind } from "@/components/boty/attributes-store"
import { useProducts } from "@/components/boty/products-store"
import type { Product } from "@/lib/types"

function productsUsing(products: Product[], kind: AttributeKind, value: string): Product[] {
  if (kind === "size") return products.filter((p) => p.sizes?.includes(value))
  return products.filter((p) => p.properties[kind] === value)
}

function renameAcrossProduct(product: Product, kind: AttributeKind, oldValue: string, newValue: string): Product {
  if (kind === "size") {
    if (!product.sizes?.includes(oldValue)) return product
    const sizes = product.sizes.map((s) => (s === oldValue ? newValue : s))
    const sizeStock = product.sizeStock
      ? Object.fromEntries(Object.entries(product.sizeStock).map(([s, qty]) => [s === oldValue ? newValue : s, qty]))
      : product.sizeStock
    return { ...product, sizes, sizeStock }
  }
  if (product.properties[kind] !== oldValue) return product
  return { ...product, properties: { ...product.properties, [kind]: newValue } }
}

export default function AdminAttributesPage() {
  const { attributes, hydrated, addValue, renameValue, deleteValue } = useAttributes()
  const { products, hydrated: productsHydrated, updateProduct } = useProducts()
  const [newValueInputs, setNewValueInputs] = useState<Record<AttributeKind, string>>({
    fabric: "", work: "", color: "", occasion: "", material: "", size: "",
  })
  const [editing, setEditing] = useState<{ kind: AttributeKind; value: string } | null>(null)
  const [editingText, setEditingText] = useState("")

  if (!hydrated || !productsHydrated) return null

  const handleAdd = (kind: AttributeKind) => {
    const value = newValueInputs[kind].trim()
    if (!value) return
    addValue(kind, value)
    setNewValueInputs((prev) => ({ ...prev, [kind]: "" }))
  }

  const handleRename = (kind: AttributeKind, oldValue: string) => {
    const newValue = editingText.trim()
    if (!newValue || newValue === oldValue) { setEditing(null); return }
    renameValue(kind, oldValue, newValue)
    productsUsing(products, kind, oldValue).forEach((p) => updateProduct(renameAcrossProduct(p, kind, oldValue, newValue)))
    setEditing(null)
  }

  const handleDelete = (kind: AttributeKind, value: string) => {
    const used = productsUsing(products, kind, value)
    if (used.length > 0) {
      alert(`Can't delete "${value}" — ${used.length} product(s) still use it. Edit those products first.`)
      return
    }
    deleteValue(kind, value)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-foreground mb-1">Attributes</h1>
        <p className="text-muted-foreground">
          Fixed value lists used by the product form's Fabric, Work, Color, Occasion, Material and Size fields —
          add, rename, or remove values here instead of typing them freely on every product.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {ATTRIBUTE_KINDS.map(({ kind, label }) => (
          <div key={kind} className="bg-card rounded-2xl boty-shadow p-5">
            <p className="font-medium text-foreground mb-3">{label}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {attributes[kind].map((value) => (
                <div
                  key={value}
                  className="flex items-center gap-1.5 bg-background border border-border/50 rounded-full pl-3 pr-1.5 py-1 text-sm text-foreground"
                >
                  {editing?.kind === kind && editing.value === value ? (
                    <>
                      <input
                        autoFocus
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRename(kind, value)}
                        className="w-24 bg-transparent border-b border-primary text-sm focus:outline-none"
                      />
                      <button type="button" onClick={() => handleRename(kind, value)} className="p-1 text-primary" aria-label="Save">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setEditing(null)} className="p-1 text-muted-foreground" aria-label="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span>{value}</span>
                      <button
                        type="button"
                        onClick={() => { setEditing({ kind, value }); setEditingText(value) }}
                        className="p-1 text-muted-foreground/60 hover:text-foreground boty-transition"
                        aria-label={`Rename ${value}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(kind, value)}
                        className="p-1 text-muted-foreground/60 hover:text-destructive boty-transition"
                        aria-label={`Delete ${value}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              ))}
              {attributes[kind].length === 0 && (
                <p className="text-sm text-muted-foreground italic">No values yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                value={newValueInputs[kind]}
                onChange={(e) => setNewValueInputs((prev) => ({ ...prev, [kind]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && handleAdd(kind)}
                placeholder={`Add a new ${label.toLowerCase()}...`}
                className="flex-1 min-w-0 bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
              />
              <button
                type="button"
                onClick={() => handleAdd(kind)}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-full text-sm font-medium boty-transition shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
