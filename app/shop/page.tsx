"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Heart, SlidersHorizontal, X } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useWishlist } from "@/components/boty/wishlist-context"
import { useProducts } from "@/components/boty/products-store"
import { categories } from "@/lib/products"
import { searchProducts } from "@/lib/search"
import type { Product } from "@/lib/types"
import { Drawer, DrawerContent, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

const categoryOptions = [{ value: "all", label: "All" }, ...categories]

const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹3,000", min: 1000, max: 3000 },
  { label: "₹3,000 – ₹5,000", min: 3000, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: Infinity },
]

function ShopPageContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") ?? "all"
  const searchQuery = searchParams.get("search")?.trim() ?? ""

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [priceRangeIndex, setPriceRangeIndex] = useState(0)
  const [selectedFabric, setSelectedFabric] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const { products } = useProducts()
  const activeProducts = useMemo(() => products.filter((p) => p.isActive !== false), [products])

  const fabricOptions = useMemo(() => {
    const fabrics = new Set(
      activeProducts.map((p) => p.properties.fabric).filter((fabric): fabric is string => Boolean(fabric))
    )
    return ["all", ...Array.from(fabrics).sort()]
  }, [activeProducts])

  const priceRange = PRICE_RANGES[priceRangeIndex]

  const filteredProducts = searchProducts(searchQuery, activeProducts).filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false
    if (product.price < priceRange.min || product.price > priceRange.max) return false
    if (selectedFabric !== "all" && product.properties.fabric !== selectedFabric) return false
    return true
  })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => {
      if (gridRef.current) {
        observer.unobserve(gridRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setIsVisible(false)
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [selectedCategory, priceRangeIndex, selectedFabric])

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Our Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              {searchQuery ? `Results for "${searchParams.get("search")}"` : "Shop All Products"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Sarees, ethnic wear, jewellery, and more — handpicked for every occasion
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border/50">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* Desktop Categories */}
            <div className="hidden lg:flex items-center gap-2 flex-wrap">
              {categoryOptions.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-full text-sm capitalize boty-transition bg-popover ${
                    selectedCategory === category.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card text-foreground/70 hover:text-foreground boty-shadow"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          </div>

          {/* Desktop secondary filters: price + fabric */}
          <div className="hidden lg:flex items-center gap-6 mb-10">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Price</span>
              <select
                value={priceRangeIndex}
                onChange={(e) => setPriceRangeIndex(Number(e.target.value))}
                className="text-sm bg-card rounded-full px-4 py-2 border border-border/50 boty-transition"
              >
                {PRICE_RANGES.map((range, index) => (
                  <option key={range.label} value={index}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-muted-foreground">Fabric</span>
              <select
                value={selectedFabric}
                onChange={(e) => setSelectedFabric(e.target.value)}
                className="text-sm bg-card rounded-full px-4 py-2 border border-border/50 boty-transition capitalize"
              >
                {fabricOptions.map((fabric) => (
                  <option key={fabric} value={fabric}>
                    {fabric === "all" ? "All Fabrics" : fabric}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mobile Filters — compact bottom sheet instead of a full-page takeover */}
          <Drawer open={showFilters} onOpenChange={setShowFilters} direction="bottom">
            <DrawerContent className="lg:hidden max-h-[80vh]">
              <div className="p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <DrawerTitle className="font-serif text-xl text-foreground font-normal">Filters</DrawerTitle>
                  <DrawerDescription className="sr-only">Filter products by category, price, and fabric</DrawerDescription>
                  <DrawerClose asChild>
                    <button type="button" className="p-2 text-foreground/70 hover:text-foreground" aria-label="Close filters">
                      <X className="w-5 h-5" />
                    </button>
                  </DrawerClose>
                </div>

                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Category</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {categoryOptions.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setSelectedCategory(category.value)}
                      className={`px-4 py-2 rounded-full text-sm boty-transition ${
                        selectedCategory === category.value
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Price</p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {PRICE_RANGES.map((range, index) => (
                    <button
                      key={range.label}
                      type="button"
                      onClick={() => setPriceRangeIndex(index)}
                      className={`px-4 py-2 rounded-full text-sm boty-transition ${
                        priceRangeIndex === index
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Fabric</p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {fabricOptions.map((fabric) => (
                    <button
                      key={fabric}
                      type="button"
                      onClick={() => setSelectedFabric(fabric)}
                      className={`px-4 py-2 rounded-full text-sm capitalize boty-transition ${
                        selectedFabric === fabric
                          ? "bg-primary text-primary-foreground"
                          : "bg-card text-foreground boty-shadow"
                      }`}
                    >
                      {fabric === "all" ? "All Fabrics" : fabric}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="w-full bg-primary text-primary-foreground py-3.5 rounded-full font-medium"
                >
                  Show {filteredProducts.length} Results
                </button>
              </div>
            </DrawerContent>
          </Drawer>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-24 text-muted-foreground">
              No products match these filters. Try clearing a filter.
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  isVisible={isVisible}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}

export default function ShopPage() {
  return (
    <Suspense fallback={null}>
      <ShopPageContent />
    </Suspense>
  )
}

function ProductCard({
  product,
  index,
  isVisible,
}: {
  product: Product
  index: number
  isVisible: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const wishlisted = isWishlisted(product.id)

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Skeleton */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <Image
            src={product.images[0] || "/placeholder.svg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badge */}
          {product.badge && (
            <span
              className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs tracking-wide ${
                product.badge === "Sale"
                  ? "bg-destructive/10 text-destructive"
                  : product.badge === "New"
                  ? "bg-primary/10 text-primary"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {product.badge}
            </span>
          )}
          {/* Wishlist toggle */}
          <button
            type="button"
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 boty-transition boty-shadow"
            onClick={(e) => {
              e.preventDefault()
              toggleWishlist(product.id)
            }}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-4 h-4 ${wishlisted ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
          {/* Quick add button */}
          <button
            type="button"
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
            onClick={(e) => {
              e.preventDefault()
              addItem({
                id: product.id,
                name: product.name,
                description: product.tagline ?? product.description,
                price: product.price,
                image: product.images[0],
              })
            }}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-6">
          <h3 className="font-serif text-xl text-foreground mb-1">{product.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">{product.tagline ?? product.description}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
            {product.mrp && (
              <span className="text-sm text-muted-foreground line-through">
                ₹{product.mrp.toLocaleString("en-IN")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
