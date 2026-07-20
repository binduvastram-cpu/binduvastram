"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/saree-collections"
import type { FilterKind } from "@/lib/category-filters"
import type { CategoryInfo } from "@/lib/types"

export interface CategoryEntry extends CategoryInfo {
  filterKinds?: FilterKind[]
}

interface CategoriesContextType {
  categories: CategoryEntry[]
  hydrated: boolean
  addCategory: (label: string, filterKinds: FilterKind[]) => Promise<string>
  updateCategory: (value: string, patch: { label?: string; filterKinds?: FilterKind[] }) => Promise<void>
  deleteCategory: (value: string) => Promise<void>
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined)

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [categories, setCategories] = useState<CategoryEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("categories").select("value, label, image_url, filter_kinds").order("created_at")
    setCategories((data ?? []).map((row) => ({ value: row.value, label: row.label, image: row.image_url, filterKinds: (row.filter_kinds as FilterKind[]) ?? undefined })))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addCategory = async (label: string, filterKinds: FilterKind[]): Promise<string> => {
    const value = slugify(label)
    if (categories.some((c) => c.value === value)) return value
    await supabase.from("categories").insert({ value, label, filter_kinds: filterKinds })
    await fetchAll()
    return value
  }

  const updateCategory = async (value: string, patch: { label?: string; filterKinds?: FilterKind[] }) => {
    await supabase
      .from("categories")
      .update({
        ...(patch.label !== undefined ? { label: patch.label } : {}),
        ...(patch.filterKinds !== undefined ? { filter_kinds: patch.filterKinds } : {}),
      })
      .eq("value", value)
    await fetchAll()
  }

  const deleteCategory = async (value: string) => {
    await supabase.from("categories").delete().eq("value", value)
    await fetchAll()
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
