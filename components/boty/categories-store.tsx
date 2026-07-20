"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { categories as DEFAULT_CATEGORIES } from "@/lib/products"
import { slugify } from "@/lib/saree-collections"
import type { FilterKind } from "@/lib/category-filters"
import type { CategoryInfo } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-categories"
const SEED_VERSION_KEY = "bindu-vastram-categories-seed-version"
const SEED_VERSION = "1"

// Admin-created categories carry their own filter kinds since they can't
// have a built-in CATEGORY_FILTERS entry (lib/category-filters.ts) — built-in
// categories leave this unset and keep using that static table.
export interface CategoryEntry extends CategoryInfo {
  filterKinds?: FilterKind[]
  custom?: boolean
}

function cloneDefaults(): CategoryEntry[] {
  return DEFAULT_CATEGORIES.map((c) => ({ ...c }))
}

interface CategoriesContextType {
  categories: CategoryEntry[]
  hydrated: boolean
  addCategory: (label: string, filterKinds: FilterKind[]) => string
  updateCategory: (value: string, patch: { label?: string; filterKinds?: FilterKind[] }) => void
  deleteCategory: (value: string) => void
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<CategoryEntry[]>(cloneDefaults())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY)
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && storedVersion === SEED_VERSION) {
        setCategories(JSON.parse(stored))
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneDefaults()))
        window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
      }
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: CategoryEntry[]) => {
    setCategories(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addCategory = (label: string, filterKinds: FilterKind[]): string => {
    const value = slugify(label)
    if (categories.some((c) => c.value === value)) return value
    persist([...categories, { value: value as CategoryEntry["value"], label, image: null, filterKinds, custom: true }])
    return value
  }

  const updateCategory = (value: string, patch: { label?: string; filterKinds?: FilterKind[] }) => {
    persist(categories.map((c) => (c.value === value ? { ...c, ...patch } : c)))
  }

  const deleteCategory = (value: string) => {
    persist(categories.filter((c) => c.value !== value))
  }

  return (
    <CategoriesContext.Provider value={{ categories, hydrated, addCategory, updateCategory, deleteCategory }}>
      {children}
    </CategoriesContext.Provider>
  )
}

export function useCategories() {
  const context = useContext(CategoriesContext)
  if (context === undefined) {
    throw new Error("useCategories must be used within a CategoriesProvider")
  }
  return context
}
