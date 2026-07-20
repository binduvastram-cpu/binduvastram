"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Product } from "@/lib/types"
import type { Json } from "@/lib/supabase/types"

const SELECT = `
  id, code, name, tagline, description, price, mrp, video_url, stock, cod_available,
  estimated_delivery_min, estimated_delivery_max, is_active, created_at, bought_count, properties,
  categories ( value ),
  collection_items ( slug ),
  product_images ( image_url, sort_order ),
  product_sizes ( size, stock )
`

type ProductRow = {
  id: string
  code: string | null
  name: string
  tagline: string | null
  description: string
  price: number
  mrp: number | null
  video_url: string | null
  stock: number
  cod_available: boolean
  estimated_delivery_min: number
  estimated_delivery_max: number
  is_active: boolean
  created_at: string
  bought_count: number | null
  properties: Record<string, unknown>
  categories: { value: string } | null
  collection_items: { slug: string } | null
  product_images: { image_url: string; sort_order: number }[]
  product_sizes: { size: string; stock: number }[]
}

function rowToProduct(row: ProductRow): Product {
  const sizes = row.product_sizes ?? []
  return {
    id: row.id,
    code: row.code ?? undefined,
    name: row.name,
    tagline: row.tagline ?? undefined,
    description: row.description,
    price: Number(row.price),
    mrp: row.mrp !== null ? Number(row.mrp) : null,
    images: [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order).map((i) => i.image_url),
    videoUrl: row.video_url ?? undefined,
    collection: row.collection_items?.slug,
    category: row.categories?.value ?? "",
    properties: (row.properties ?? {}) as Product["properties"],
    sizes: sizes.length > 0 ? sizes.map((s) => s.size) : undefined,
    sizeStock: sizes.length > 0 ? Object.fromEntries(sizes.map((s) => [s.size, s.stock])) : undefined,
    stock: row.stock,
    codAvailable: row.cod_available,
    estimatedDeliveryDays: [row.estimated_delivery_min, row.estimated_delivery_max],
    isActive: row.is_active,
    createdAt: row.created_at,
    boughtCount: row.bought_count ?? undefined,
  }
}

interface ProductsContextType {
  products: Product[]
  hydrated: boolean
  addProduct: (product: Product) => Promise<Product>
  updateProduct: (product: Product) => Promise<void>
  deleteProduct: (id: string) => Promise<void>
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [products, setProducts] = useState<Product[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("products").select(SELECT).order("created_at", { ascending: false })
    setProducts(((data as unknown as ProductRow[]) ?? []).map(rowToProduct))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))

    const channel = supabase
      .channel("products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => {
        fetchAll()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categoryId = async (value: string): Promise<string> => {
    const { data } = await supabase.from("categories").select("id").eq("value", value).single()
    if (!data) throw new Error(`Unknown category: ${value}`)
    return data.id
  }

  const collectionItemId = async (slug?: string) => {
    if (!slug) return null
    const { data } = await supabase.from("collection_items").select("id").eq("slug", slug).maybeSingle()
    return data?.id ?? null
  }

  const writeSizes = async (productId: string, product: Product) => {
    await supabase.from("product_sizes").delete().eq("product_id", productId)
    if (product.sizes && product.sizes.length > 0) {
      await supabase.from("product_sizes").insert(
        product.sizes.map((size) => ({ product_id: productId, size, stock: product.sizeStock?.[size] ?? 0 }))
      )
    } else {
      // No sizes — the stock-sync trigger only fires on product_sizes writes,
      // so a sizeless product's stock has to be set directly here.
      await supabase.from("products").update({ stock: product.stock }).eq("id", productId)
    }
  }

  const writeImages = async (productId: string, images: string[]) => {
    await supabase.from("product_images").delete().eq("product_id", productId)
    if (images.length > 0) {
      await supabase.from("product_images").insert(
        images.map((image_url, sort_order) => ({ product_id: productId, image_url, sort_order }))
      )
    }
  }

  const addProduct = async (product: Product): Promise<Product> => {
    const [catId, collId] = await Promise.all([categoryId(product.category), collectionItemId(product.collection)])
    const { data, error } = await supabase
      .from("products")
      .insert({
        code: product.code ?? null,
        name: product.name,
        tagline: product.tagline ?? null,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        video_url: product.videoUrl ?? null,
        category_id: catId,
        collection_item_id: collId,
        properties: product.properties as unknown as Json,
        stock: product.stock,
        cod_available: product.codAvailable,
        estimated_delivery_min: product.estimatedDeliveryDays[0],
        estimated_delivery_max: product.estimatedDeliveryDays[1],
        is_active: product.isActive !== false,
        created_at: product.createdAt,
        bought_count: product.boughtCount ?? null,
      })
      .select("id")
      .single()

    if (error || !data) throw new Error(error?.message ?? "Failed to create product")

    await Promise.all([writeImages(data.id, product.images), writeSizes(data.id, product)])
    await fetchAll()
    return { ...product, id: data.id }
  }

  const updateProduct = async (updated: Product) => {
    const [catId, collId] = await Promise.all([categoryId(updated.category), collectionItemId(updated.collection)])
    await supabase
      .from("products")
      .update({
        code: updated.code ?? null,
        name: updated.name,
        tagline: updated.tagline ?? null,
        description: updated.description,
        price: updated.price,
        mrp: updated.mrp,
        video_url: updated.videoUrl ?? null,
        category_id: catId,
        collection_item_id: collId,
        properties: updated.properties as unknown as Json,
        cod_available: updated.codAvailable,
        estimated_delivery_min: updated.estimatedDeliveryDays[0],
        estimated_delivery_max: updated.estimatedDeliveryDays[1],
        is_active: updated.isActive !== false,
        bought_count: updated.boughtCount ?? null,
      })
      .eq("id", updated.id)

    await Promise.all([writeImages(updated.id, updated.images), writeSizes(updated.id, updated)])
    await fetchAll()
  }

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id)
    setProducts((current) => current.filter((p) => p.id !== id))
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
