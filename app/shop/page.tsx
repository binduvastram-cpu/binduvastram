"use client"

import { useState, useEffect, useRef, useMemo, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ShoppingBag, Heart, SlidersHorizontal, X, RectangleVertical, Columns2, Columns3, Columns4 } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useWishlist } from "@/components/boty/wishlist-context"
import { useProducts } from "@/components/boty/products-store"
import { useCategories } from "@/components/boty/categories-store"
import { useCollections } from "@/components/boty/collections-store"
import { useOrders } from "@/components/boty/orders-store"
import { SwipeableCardImage } from "@/components/boty/swipeable-card-image"
import { searchProducts } from "@/lib/search"
import { filtersForCategory } from "@/lib/category-filters"
import type { Product } from "@/lib/types"
import { Drawer, DrawerContent, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { formatPrice } from "@/lib/format"
import { computeBadge, isNewArrival, isOutOfStock } from "@/lib/product-tags"
import { computeDemandRanking, displayBoughtCount } from "@/lib/social-proof"
import { useOffers } from "@/components/boty/offers-store"
import { computeSalePrice, discountLabel } from "@/lib/offers"

const SLIDER_MAX = 50000
const SLIDER_STEP = 500

function optionsFrom(products: Product[], pick: (p: Product) => string | undefined): string[] {
  return Array.from(new Set(products.map(pick).filter((v): v is string => Boolean(v)))).sort()
}

function ShopPageContent() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get("category") ?? "all"
  const searchQuery = searchParams.get("search")?.trim() ?? ""
  const urlPriceMin = searchParams.get("price_min")
  const urlPriceMax = searchParams.get("price_max")

  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [priceMin, setPriceMin] = useState(urlPriceMin ? Number(urlPriceMin) : 0)
  const [priceMax, setPriceMax] = useState(urlPriceMax ? Number(urlPriceMax) : Infinity)
  // Collection/new-arrivals start from the URL (header nav links land here),
  // but unlike category/price they had no way to ever be cleared — once set,
  // they silently kept filtering out every product after any other filter
  // was touched, since they were re-read from the URL on every render instead
  // of being real state. Now they're state, seeded from the URL, clearable
  // like everything else.
  const [selectedCollection, setSelectedCollection] = useState(searchParams.get("collection"))
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(searchParams.get("filter") === "new-arrivals")
  const [selectedFabrics, setSelectedFabrics] = useState<string[]>([])
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  // null = the default responsive layout (2 per row on mobile, 3 on desktop);
  // once the shopper picks a density it applies at every breakpoint. 1-per-row
  // is mobile-only and 4-per-row is desktop-only (their toggle buttons are
  // hidden the other way), but this still clamps 4 down to 3 on narrow
  // screens in case the choice carries over from a wider viewport.
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4 | null>(null)
  const gridColsClass =
    gridCols === 1 ? "grid-cols-1" :
    gridCols === 2 ? "grid-cols-2" :
    gridCols === 3 ? "grid-cols-3" :
    gridCols === 4 ? "grid-cols-3 sm:grid-cols-4" :
    "grid-cols-2 lg:grid-cols-3"
  // At 3-per-row on a phone-width screen there just isn't room for the name/
  // price/heart below the image — collapse those cards down to image-only.
  const compactCard = isMobile && gridCols === 3
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < 640)
    checkViewport()
    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])
  const { products } = useProducts()
  const { categories } = useCategories()
  const { ancestorsOf, collectionLabel } = useCollections()
  const { orders } = useOrders()
  const categoryOptions = useMemo(() => [{ value: "all", label: "All" }, ...categories], [categories])
  const activeProducts = useMemo(() => products.filter((p) => p.isActive !== false), [products])
  const rankingMap = useMemo(() => computeDemandRanking(products, orders), [products, orders])

  // Which filter controls are relevant to the selected category (Section 9 —
  // e.g. no "Fabric" checkboxes on jewellery, no "Fabric"-less on sarees).
  // Admin-created categories carry their own filterKinds (chosen at creation
  // time in /admin/categories) since they have no static CATEGORY_FILTERS entry.
  const activeFilters = useMemo(() => {
    const custom = categories.find((c) => c.value === selectedCategory)?.filterKinds
    return custom ?? filtersForCategory(selectedCategory)
  }, [selectedCategory, categories])

  // Products narrowed by category + search only — used to compute filter
  // option counts and to derive which option values are even relevant.
  const categoryProducts = useMemo(
    () => searchProducts(searchQuery, activeProducts).filter((p) => selectedCategory === "all" || p.category === selectedCategory),
    [activeProducts, searchQuery, selectedCategory]
  )

  const fabricOptions = useMemo(() => optionsFrom(categoryProducts, (p) => p.properties.fabric), [categoryProducts])
  const materialOptions = useMemo(() => optionsFrom(categoryProducts, (p) => p.properties.material), [categoryProducts])
  const colorOptions = useMemo(() => optionsFrom(categoryProducts, (p) => p.properties.color), [categoryProducts])
  const sizeOptions = useMemo(
    () => Array.from(new Set(categoryProducts.flatMap((p) => p.sizes ?? []))),
    [categoryProducts]
  )

  const countFor = (pick: (p: Product) => string | string[] | undefined, value: string) =>
    categoryProducts.filter((p) => {
      const v = pick(p)
      return Array.isArray(v) ? v.includes(value) : v === value
    }).length

  const filteredProducts = categoryProducts.filter((product) => {
    if (product.price < priceMin || product.price > priceMax) return false
    if (activeFilters.includes("fabric") && selectedFabrics.length > 0 && !selectedFabrics.includes(product.properties.fabric ?? "")) return false
    if (activeFilters.includes("material") && selectedMaterials.length > 0 && !selectedMaterials.includes(product.properties.material ?? "")) return false
    if (activeFilters.includes("size") && selectedSizes.length > 0 && !selectedSizes.some((s) => (product.sizes ?? []).includes(s))) return false
    if (activeFilters.includes("color") && selectedColors.length > 0 && !selectedColors.includes(product.properties.color ?? "")) return false
    if (selectedCollection && !(product.collection && ancestorsOf(product.collection).includes(selectedCollection))) return false
    if (newArrivalsOnly && !isNewArrival(product)) return false
    return true
  })

  // Re-sync from the URL whenever it changes. Navigating from the mobile menu
  // to a different category while already on /shop reuses this same page
  // instance (no remount), so without this effect the `useState(initialCategory)`
  // snapshot from the first mount would just keep showing whatever was
  // selected before — the URL would change but the page wouldn't follow it.
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") ?? "all")
    const min = searchParams.get("price_min")
    const max = searchParams.get("price_max")
    setPriceMin(min ? Number(min) : 0)
    setPriceMax(max ? Number(max) : Infinity)
    setSelectedCollection(searchParams.get("collection"))
    setNewArrivalsOnly(searchParams.get("filter") === "new-arrivals")
  }, [searchParams])

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
  }, [selectedCategory, priceMin, priceMax, selectedFabrics, selectedMaterials, selectedSizes, selectedColors])

  // Reset attribute filters whenever the category changes, so a stale
  // selection from a previous category doesn't zero-out an unrelated one.
  useEffect(() => {
    setSelectedFabrics([])
    setSelectedMaterials([])
    setSelectedSizes([])
    setSelectedColors([])
  }, [selectedCategory])

  const toggleValue = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  const handlePriceChange = (min: number, max: number) => { setPriceMin(min); setPriceMax(max) }

  const categoryFilter = (
    <CategoryFilterGroup
      options={categoryOptions}
      selected={selectedCategory}
      onSelect={(value) => {
        setSelectedCategory(value)
        // Switching category manually drops any collection/new-arrivals
        // narrowing carried over from a header nav link — otherwise it keeps
        // silently filtering out every product in the newly-picked category.
        setSelectedCollection(null)
        setNewArrivalsOnly(false)
      }}
      counts={categoryOptions.map((c) =>
        c.value === "all" ? activeProducts.length : activeProducts.filter((p) => p.category === c.value).length
      )}
    />
  )

  // Fabric/Material/Size/Color only — price moved to its own desktop top-bar
  // slot (see below), and lives here separately so it can still appear
  // inside the mobile filter drawer where there's no top-bar room for it.
  const attributeFilters = (
    <>
      {activeFilters.includes("fabric") && fabricOptions.length > 0 && (
        <CheckboxFilterGroup
          label="Fabric"
          options={fabricOptions}
          selected={selectedFabrics}
          onToggle={(v) => toggleValue(selectedFabrics, setSelectedFabrics, v)}
          countFor={(v) => countFor((p) => p.properties.fabric, v)}
        />
      )}
      {activeFilters.includes("material") && materialOptions.length > 0 && (
        <CheckboxFilterGroup
          label="Material"
          options={materialOptions}
          selected={selectedMaterials}
          onToggle={(v) => toggleValue(selectedMaterials, setSelectedMaterials, v)}
          countFor={(v) => countFor((p) => p.properties.material, v)}
        />
      )}
      {activeFilters.includes("size") && sizeOptions.length > 0 && (
        <CheckboxFilterGroup
          label="Size"
          options={sizeOptions}
          selected={selectedSizes}
          onToggle={(v) => toggleValue(selectedSizes, setSelectedSizes, v)}
          countFor={(v) => countFor((p) => p.sizes, v)}
        />
      )}
      {activeFilters.includes("color") && colorOptions.length > 0 && (
        <CheckboxFilterGroup
          label="Color"
          options={colorOptions}
          selected={selectedColors}
          onToggle={(v) => toggleValue(selectedColors, setSelectedColors, v)}
          countFor={(v) => countFor((p) => p.properties.color, v)}
        />
      )}
    </>
  )

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Our Collection
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              {searchQuery
                ? `Results for "${searchParams.get("search")}"`
                : newArrivalsOnly
                ? "Just Arrived"
                : selectedCollection
                ? collectionLabel(selectedCollection)
                : "Shop All Products"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Sarees, ethnic wear, jewellery, and more — handpicked for every occasion
            </p>
            {(selectedCollection || newArrivalsOnly) && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="inline-flex items-center gap-2 bg-card border border-border/50 rounded-full pl-4 pr-2 py-1.5 text-sm text-foreground">
                  {newArrivalsOnly ? "New Arrivals" : collectionLabel(selectedCollection!)}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCollection(null)
                      setNewArrivalsOnly(false)
                    }}
                    className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-muted boty-transition"
                    aria-label="Clear filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              </div>
            )}
          </div>

          <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-10">
            {/* Desktop sidebar — sticky and independently scrollable, so a long
                filter list scrolls on its own instead of dragging the whole page
                (and the product grid keeps scrolling normally beside it). */}
            <aside className="hidden lg:block lg:sticky lg:top-28 lg:self-start lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto lg:pr-2">
              <h2 className="font-serif text-2xl text-foreground mb-5">Filter:</h2>
              <div className="space-y-6">
                {categoryFilter}
                {attributeFilters}
              </div>
            </aside>

            <div className="min-w-0">
              {/* Filter bar — price range sits here (desktop only) instead of the
                  sidebar, with the grid-density selector and count to the right */}
              <div className="flex items-center mb-6 pb-6 border-b border-border/50">
                <button
                  type="button"
                  suppressHydrationWarning
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden inline-flex items-center gap-2 text-sm text-foreground"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </button>
                <div className="hidden lg:block w-72">
                  <PriceRangeFilter priceMin={priceMin} priceMax={priceMax} onChange={handlePriceChange} compact />
                </div>
                <div className="flex items-center gap-4 ml-auto">
                  <div className="flex items-center gap-1 bg-card rounded-full p-1">
                    {([1, 2, 3, 4] as const).map((n) => {
                      const Icon = n === 1 ? RectangleVertical : n === 2 ? Columns2 : n === 3 ? Columns3 : Columns4
                      const mobileOnly = n === 1 ? "sm:hidden" : n === 4 ? "hidden sm:inline-flex" : ""
                      return (
                        <button
                          key={n}
                          type="button"
                          suppressHydrationWarning
                          onClick={() => setGridCols(n)}
                          aria-label={`Show ${n} per row`}
                          aria-pressed={gridCols === n}
                          className={`p-1.5 rounded-full boty-transition ${mobileOnly} ${
                            gridCols === n ? "bg-foreground text-background" : "text-foreground/60 hover:text-foreground"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </button>
                      )
                    })}
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
                  </span>
                </div>
              </div>

              {/* Mobile Filters — a right-side sliding panel (not a bottom sheet) so its
                  vertical scroll never fights the drawer's own dismiss gesture; the
                  filter list scrolls in its own region while the header/CTA stay put. */}
              <Drawer open={showFilters} onOpenChange={setShowFilters} direction="right">
                <DrawerContent className="lg:hidden !w-[85%] max-w-sm h-full flex flex-col">
                  <div className="flex items-center justify-between p-6 pb-4 shrink-0 border-b border-border/50">
                    <DrawerTitle className="font-serif text-xl text-foreground font-normal">Filters</DrawerTitle>
                    <DrawerDescription className="sr-only">Filter products by category, price, and other attributes</DrawerDescription>
                    <DrawerClose asChild>
                      <button type="button" className="p-2 text-foreground/70 hover:text-foreground" aria-label="Close filters">
                        <X className="w-5 h-5" />
                      </button>
                    </DrawerClose>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
                    {categoryFilter}
                    <PriceRangeFilter priceMin={priceMin} priceMax={priceMax} onChange={handlePriceChange} />
                    {attributeFilters}
                  </div>

                  <div className="p-6 pt-4 shrink-0 border-t border-border/50">
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

              {/* Product Grid — 2 columns from the smallest breakpoint (Section 8) */}
              {filteredProducts.length === 0 ? (
                <div className="text-center py-24 text-muted-foreground">
                  No products match these filters. Try clearing a filter.
                </div>
              ) : (
                <div
                  ref={gridRef}
                  className={`grid ${gridColsClass} gap-4 sm:gap-6`}
                >
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      rank={rankingMap[product.id]}
                      index={index}
                      isVisible={isVisible}
                      compact={compactCard}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
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

function CategoryFilterGroup({
  options,
  selected,
  onSelect,
  counts,
}: {
  options: { value: string; label: string }[]
  selected: string
  onSelect: (value: string) => void
  counts: number[]
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-3">Category</p>
      <div className="space-y-2.5">
        {options.map((option, i) => (
          <label key={option.value} className="flex items-center justify-between gap-2 cursor-pointer group">
            <span className="flex items-center gap-2.5">
              <input
                type="radio"
                name="category"
                checked={selected === option.value}
                onChange={() => onSelect(option.value)}
                className="accent-primary w-4 h-4"
              />
              <span className={`text-sm boty-transition ${selected === option.value ? "text-foreground font-medium" : "text-foreground/70 group-hover:text-foreground"}`}>
                {option.label}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">({counts[i]})</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function PriceRangeFilter({
  priceMin,
  priceMax,
  onChange,
  compact,
}: {
  priceMin: number
  priceMax: number
  onChange: (min: number, max: number) => void
  compact?: boolean
}) {
  const sliderValue: [number, number] = [
    Math.min(priceMin, SLIDER_MAX),
    priceMax === Infinity ? SLIDER_MAX : Math.min(priceMax, SLIDER_MAX),
  ]

  return (
    <div className={compact ? "" : "border-t border-border/50 pt-6"}>
      <p className="text-sm font-medium text-foreground mb-4">Price</p>
      <Slider
        min={0}
        max={SLIDER_MAX}
        step={SLIDER_STEP}
        value={sliderValue}
        onValueChange={(value) => {
          const [min, max] = value as number[]
          onChange(min, max >= SLIDER_MAX ? Infinity : max)
        }}
        className="mb-4"
      />
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-background border border-border/50 rounded-full px-3 py-2 text-sm text-foreground">
          {formatPrice(priceMin)}
        </div>
        <span className="text-muted-foreground text-sm">to</span>
        <div className="flex-1 bg-background border border-border/50 rounded-full px-3 py-2 text-sm text-foreground">
          {priceMax === Infinity ? `${formatPrice(SLIDER_MAX)}+` : formatPrice(priceMax)}
        </div>
      </div>
    </div>
  )
}

function CheckboxFilterGroup({
  label,
  options,
  selected,
  onToggle,
  countFor,
}: {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  countFor: (value: string) => number
}) {
  return (
    <div className="border-t border-border/50 pt-6">
      <p className="text-sm font-medium text-foreground mb-3">{label}</p>
      <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
        {options.map((option) => (
          <label key={option} className="flex items-center justify-between gap-2 cursor-pointer group">
            <span className="flex items-center gap-2.5">
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
                className="accent-primary w-4 h-4 rounded"
              />
              <span className={`text-sm capitalize boty-transition ${selected.includes(option) ? "text-foreground font-medium" : "text-foreground/70 group-hover:text-foreground"}`}>
                {option}
              </span>
            </span>
            <span className="text-xs text-muted-foreground">({countFor(option)})</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function ProductCard({
  product,
  rank,
  index,
  isVisible,
  compact,
}: {
  product: Product
  rank?: "Bestseller" | "Most Wanted"
  index: number
  isVisible: boolean
  compact?: boolean
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { offers } = useOffers()
  const { orders } = useOrders()
  const wishlisted = isWishlisted(product.id)
  const boughtCount = displayBoughtCount(product, orders)
  const applied = computeSalePrice(product, offers)
  const badgeText = isOutOfStock(product) ? "Out of Stock" : applied ? discountLabel(applied.offer) : computeBadge(product, rank)

  return (
    <Link
      href={`/product/${product.id}`}
      className={`group transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className="bg-card rounded-xl sm:rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {/* Skeleton */}
          <div
            className={`absolute inset-0 bg-gradient-to-br from-muted via-muted/50 to-muted animate-pulse transition-opacity duration-500 ${
              imageLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          <SwipeableCardImage
            images={product.images}
            alt={product.name}
            sizes="(max-width: 1024px) 50vw, 33vw"
            className={`object-cover boty-transition group-hover:scale-105 transition-opacity duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* Badge */}
          {badgeText && (
            <span
              className={`absolute top-2 left-2 sm:top-4 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs tracking-wide ${
                applied || badgeText === "Sale"
                  ? "bg-destructive/10 text-destructive"
                  : badgeText === "New"
                  ? "bg-primary/10 text-primary"
                  : badgeText === "Out of Stock"
                  ? "bg-muted text-muted-foreground"
                  : "bg-accent/10 text-accent"
              }`}
            >
              {badgeText}
            </span>
          )}
          {/* Wishlist toggle — dropped in compact mode, there's no room for it */}
          {!compact && (
            <button
              type="button"
              suppressHydrationWarning
              className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 boty-transition boty-shadow"
              onClick={(e) => {
                e.preventDefault()
                toggleWishlist(product.id)
              }}
              aria-label="Toggle wishlist"
            >
              <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? "fill-primary text-primary" : "text-foreground"}`} />
            </button>
          )}
          {/* Quick add button */}
          <button
            type="button"
            suppressHydrationWarning
            className="hidden sm:flex absolute bottom-4 right-4 w-12 h-12 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
            onClick={(e) => {
              e.preventDefault()
              addItem({
                id: product.id,
                name: product.name,
                description: product.tagline ?? product.description,
                price: applied ? applied.salePrice : product.price,
                image: product.images[0],
              })
            }}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Info — dropped in compact mode (3-per-row on a phone screen), where
            the image is all that reliably fits; tap through for the rest. */}
        {!compact && (
          <div className="p-3 sm:p-6">
            <h3 className="font-serif text-sm sm:text-xl text-foreground mb-0.5 sm:mb-1 truncate">{product.name}</h3>
            <p className="hidden sm:block text-sm text-muted-foreground mb-4">{product.tagline ?? product.description}</p>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-lg font-medium text-foreground">
                {formatPrice(applied ? applied.salePrice : product.price)}
              </span>
              {applied ? (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.price)}</span>
              ) : product.mrp ? (
                <span className="text-xs sm:text-sm text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
              ) : null}
            </div>
            {boughtCount > 0 && (
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-2">
                Bought by {boughtCount}
              </p>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
