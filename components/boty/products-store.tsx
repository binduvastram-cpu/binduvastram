"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { products as seedProducts } from "@/lib/products"
import type { Product } from "@/lib/types"

const STORAGE_KEY = "bindu-vastram-products"

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
      if (stored) {
        setProducts(JSON.parse(stored))
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedProducts))
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
