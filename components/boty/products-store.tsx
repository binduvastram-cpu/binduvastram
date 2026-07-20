"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { products as seedProducts } from "@/lib/products"
import type { Product } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-products"
const SEED_VERSION_KEY = "bindu-vastram-products-seed-version"
// Bump this whenever lib/products.ts seed data changes in a meaningful way
// (new fields, corrected properties, etc). Without it, a browser that has
// already visited once keeps reading its original localStorage snapshot
// forever and never picks up seed edits — e.g. adding a `material` value to
// the handbag products wouldn't show up for a returning visitor.
const SEED_VERSION = "4"

interface ProductsContextType {
  products: Product[]
  hydrated: boolean
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (id: string) => void
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY)
      if (stored && storedVersion === SEED_VERSION) {
        setProducts(JSON.parse(stored))
      } else {
        setProducts(seedProducts)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts))
        window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
      }
    } catch {
      // ignore malformed localStorage content, fall back to seed data
    }
    setHydrated(true)
  }, [])

  const persist = (next: Product[]) => {
    setProducts(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addProduct = (product: Product) => {
    persist([product, ...products])
  }

  const updateProduct = (updated: Product) => {
    persist(products.map((p) => (p.id === updated.id ? updated : p)))
  }

  const deleteProduct = (id: string) => {
    persist(products.filter((p) => p.id !== id))
  }

  return (
    <ProductsContext.Provider value={{ products, hydrated, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductsContext)
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return context
}
