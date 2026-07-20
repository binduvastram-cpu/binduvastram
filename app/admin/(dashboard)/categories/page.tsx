"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Layers, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { useCategories, type CategoryEntry } from "@/components/boty/categories-store"
import { useCollections } from "@/components/boty/collections-store"
import { useProducts } from "@/components/boty/products-store"
import { slugify } from "@/lib/saree-collections"
import type { FilterKind } from "@/lib/category-filters"

const FILTER_KIND_OPTIONS: FilterKind[] = ["fabric", "material", "size", "color"]

export default function AdminCategoriesPage() {
  const { categories, hydrated: categoriesHydrated, addCategory, updateCategory, deleteCategory } = useCategories()
  const { families, hydrated: collectionsHydrated, addFamily, addItem, deleteItem, deleteFamily } = useCollections()
  const { products } = useProducts()

  const [editingCategory, setEditingCategory] = useState<CategoryEntry | null>(null)
  const [isCreatingCategory, setIsCreatingCategory] = useState(false)
  const [confirmDeleteCategory, setConfirmDeleteCategory] = useState<string | null>(null)
  const [addingFamily, setAddingFamily] = useState(false)
  const [newFamilyLabel, setNewFamilyLabel] = useState("")
  const [newItemInputs, setNewItemInputs] = useState<Record<string, string>>({})

  if (!categoriesHydrated || !collectionsHydrated) return null

  const productCountFor = (categoryValue: string) => products.filter((p) => p.category === categoryValue).length
  const productCountForCollection = (slug: string) => products.filter((p) => p.collection === slug).length
  const productCountForFamily = (familySlug: string) => products.filter((p) => p.category === "sarees" && p.collection && families[familySlug] && (p.collection === familySlug || Object.keys(families[familySlug].groups ?? {}).includes(p.collection) || familyLeafSlugs(familySlug).includes(p.collection))).length

  function familyLeafSlugs(familySlug: string): string[] {
    const family = families[familySlug]
    if (!family) return []
    const leafs: string[] = []
    if (family.groups) {
      for (const group of Object.values(family.groups)) {
        leafs.push(...group.items.map((item) => slugify(item)))
      }
    }
    if (family.items) leafs.push(...family.items.map((item) => slugify(item)))
    return leafs
  }

  const handleAddFamily = () => {
    if (!newFamilyLabel.trim()) return
    addFamily(newFamilyLabel.trim())
    setNewFamilyLabel("")
    setAddingFamily(false)
  }

  const handleAddItem = (familySlug: string, groupSlug: string | null) => {
    const key = groupSlug ?? familySlug
    const label = (newItemInputs[key] ?? "").trim()
    if (!label) return
    addItem(familySlug, groupSlug, label)
    setNewItemInputs((prev) => ({ ...prev, [key]: "" }))
  }

  return (
    <div className="space-y-10">
      {/* Section 1 — Product Categories */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-serif text-3xl text-foreground mb-1">Categories & Types</h1>
            <p className="text-muted-foreground">Manage top-level product categories and saree collection types</p>
          </div>
          <button
            type="button"
            onClick={() => { setEditingCategory({ value: "", label: "", image: null, filterKinds: ["fabric", "size", "color"] }); setIsCreatingCategory(true) }}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full text-sm font-medium boty-transition hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>

        <div className="bg-card rounded-2xl boty-shadow divide-y divide-border/50">
          {categories.map((category) => {
            const count = productCountFor(category.value)
            return (
              <div key={category.value} className="p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-foreground">{category.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {category.value} · {count} product{count === 1 ? "" : "s"}
                    {category.filterKinds && (
                      <span> · filters: {category.filterKinds.join(", ")}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => { setEditingCategory(category); setIsCreatingCategory(false) }} className="p-2 text-muted-foreground hover:text-foreground boty-transition" aria-label="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteCategory(category.value)} className="p-2 text-muted-foreground hover:text-destructive boty-transition" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Section 2 — Saree Collection Types */}
      <div>
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Saree Collection Types
            </h2>
            <p className="text-muted-foreground text-sm">
              Fabric families shown in the header nav (Silk, Cotton, etc.) — add a new type under an existing
              family, or start a brand-new family, which gets its own nav slot automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setAddingFamily(true)}
            className="inline-flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 px-5 py-2.5 rounded-full text-sm font-medium boty-transition"
          >
            <Plus className="w-4 h-4" />
            Add Family
          </button>
        </div>

        {addingFamily && (
          <div className="bg-card rounded-2xl boty-shadow p-4 mb-4 flex gap-2">
            <input
              autoFocus
              value={newFamilyLabel}
              onChange={(e) => setNewFamilyLabel(e.target.value)}
              placeholder="e.g. Georgette"
              className="flex-1 bg-background border border-border/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50"
            />
            <button type="button" onClick={handleAddFamily} className="px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium">Add</button>
            <button type="button" onClick={() => { setAddingFamily(false); setNewFamilyLabel("") }} className="p-2 text-muted-foreground" aria-label="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(families).map(([familySlug, family]) => (
            <div key={familySlug} className="bg-card rounded-2xl boty-shadow p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-serif text-lg text-foreground">{family.label}</p>
                <button
                  type="button"
                  onClick={() => {
                    const count = productCountForFamily(familySlug)
                    if (count > 0) {
                      alert(`Can't delete — ${count} product(s) still use ${family.label}. Reassign them first.`)
                      return
                    }
                    if (confirm(`Delete the "${family.label}" family and all its types?`)) deleteFamily(familySlug)
                  }}
                  className="p-1.5 text-muted-foreground hover:text-destructive boty-transition"
                  aria-label={`Delete ${family.label}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {family.groups ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {Object.entries(family.groups).map(([groupSlug, group]) => (
                    <div key={groupSlug}>
                      <p className="text-sm font-medium text-foreground mb-2">{group.label}</p>
                      <ul className="space-y-1.5 mb-2">
                        {group.items.map((item) => {
                          const slug = slugify(item)
                          const count = productCountForCollection(slug)
                          return (
                            <li key={slug} className="flex items-center justify-between gap-2 text-sm text-foreground/80">
                              <span>{item}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  if (count > 0) {
                                    alert(`Can't delete — ${count} product(s) are tagged with "${item}".`)
                                    return
                                  }
                                  deleteItem(slug)
                                }}
                                className="p-1 text-muted-foreground/60 hover:text-destructive boty-transition shrink-0"
                                aria-label={`Delete ${item}`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      <div className="flex gap-1.5">
                        <input
                          value={newItemInputs[groupSlug] ?? ""}
                          onChange={(e) => setNewItemInputs((prev) => ({ ...prev, [groupSlug]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && handleAddItem(familySlug, groupSlug)}
                          placeholder="New type..."
                          className="flex-1 min-w-0 bg-background border border-border/50 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
                        />
                        <button type="button" onClick={() => handleAddItem(familySlug, groupSlug)} className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 rounded-full text-xs font-medium boty-transition shrink-0">
                          Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <ul className="space-y-1.5 mb-2">
                    {(family.items ?? []).map((item) => {
                      const slug = slugify(item)
                      const count = productCountForCollection(slug)
                      return (
                        <li key={slug} className="flex items-center justify-between gap-2 text-sm text-foreground/80 max-w-sm">
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (count > 0) {
                                alert(`Can't delete — ${count} product(s) are tagged with "${item}".`)
                                return
                              }
                              deleteItem(slug)
                            }}
                            className="p-1 text-muted-foreground/60 hover:text-destructive boty-transition shrink-0"
                            aria-label={`Delete ${item}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </li>
                      )
                    })}
                    {(family.items ?? []).length === 0 && (
                      <li className="text-sm text-muted-foreground italic">No types yet — this family shows as a plain nav link until one is added.</li>
                    )}
                  </ul>
                  <div className="flex gap-1.5 max-w-sm">
                    <input
                      value={newItemInputs[familySlug] ?? ""}
                      onChange={(e) => setNewItemInputs((prev) => ({ ...prev, [familySlug]: e.target.value }))}
                      onKeyDown={(e) => e.key === "Enter" && handleAddItem(familySlug, null)}
                      placeholder="New type..."
                      className="flex-1 min-w-0 bg-background border border-border/50 rounded-full px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50"
                    />
                    <button type="button" onClick={() => handleAddItem(familySlug, null)} className="px-3 py-1.5 bg-foreground/5 hover:bg-foreground/10 rounded-full text-xs font-medium boty-transition shrink-0">
                      Add
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit category dialog */}
      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isCreatingCategory ? "Add Category" : "Edit Category"}</DialogTitle>
            <DialogDescription className="sr-only">Category details</DialogDescription>
          </DialogHeader>
          {editingCategory && (
            <CategoryForm
              category={editingCategory}
              isCreating={isCreatingCategory}
              onSave={(label, filterKinds) => {
                if (isCreatingCategory) {
                  addCategory(label, filterKinds)
                } else {
                  updateCategory(editingCategory.value, { label, filterKinds })
                }
                setEditingCategory(null)
              }}
              onCancel={() => setEditingCategory(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete category confirm */}
      <Dialog open={!!confirmDeleteCategory} onOpenChange={(open) => !open && setConfirmDeleteCategory(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete this category?</DialogTitle>
            <DialogDescription>
              {confirmDeleteCategory && productCountFor(confirmDeleteCategory) > 0
                ? `${productCountFor(confirmDeleteCategory)} product(s) still use this category — reassign them first.`
                : "This can't be undone."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!!confirmDeleteCategory && productCountFor(confirmDeleteCategory) > 0}
              onClick={() => {
                if (confirmDeleteCategory) deleteCategory(confirmDeleteCategory)
                setConfirmDeleteCategory(null)
              }}
              className="flex-1 bg-destructive text-destructive-foreground py-2.5 rounded-full text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => setConfirmDeleteCategory(null)}
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

function CategoryForm({
  category,
  isCreating,
  onSave,
  onCancel,
}: {
  category: CategoryEntry
  isCreating: boolean
  onSave: (label: string, filterKinds: FilterKind[]) => void
  onCancel: () => void
}) {
  const [label, setLabel] = useState(category.label)
  const [filterKinds, setFilterKinds] = useState<FilterKind[]>(category.filterKinds ?? ["fabric", "size", "color"])

  return (
    <div className="space-y-5">
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Label</label>
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Home Decor"
          className="w-full bg-background border border-border/50 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary/50"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">
          Shop Filters <span className="text-muted-foreground font-normal">(price is always included)</span>
        </label>
        <div className="flex flex-wrap gap-3">
          {FILTER_KIND_OPTIONS.map((kind) => (
            <label key={kind} className="flex items-center gap-1.5 text-sm text-foreground bg-background border border-border/50 rounded-full px-3 py-1.5 cursor-pointer capitalize">
              <input
                type="checkbox"
                checked={filterKinds.includes(kind)}
                onChange={(e) => setFilterKinds(e.target.checked ? [...filterKinds, kind] : filterKinds.filter((k) => k !== kind))}
                className="accent-primary"
              />
              {kind}
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={() => label.trim() && onSave(label.trim(), [...filterKinds, "price"])}
          className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
        >
          {isCreating ? "Add Category" : "Save Changes"}
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
