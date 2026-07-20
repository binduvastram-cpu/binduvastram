"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { ShoppingBag, Heart } from "lucide-react"
import { useCart } from "./cart-context"
import { useWishlist } from "./wishlist-context"
import { useProducts } from "./products-store"
import { useOrders } from "./orders-store"
import { SwipeableCardImage } from "./swipeable-card-image"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { computeBadge, isNewArrival, isOutOfStock } from "@/lib/product-tags"
import { computeDemandRanking, displayBoughtCount, realSoldQuantity } from "@/lib/social-proof"
import { useOffers } from "./offers-store"
import { computeSalePrice, discountLabel } from "@/lib/offers"

type Tab = "new-arrivals" | "best-sellers"

const tabs: { value: Tab; label: string }[] = [
  { value: "new-arrivals", label: "New Arrivals" },
  { value: "best-sellers", label: "Best Sellers" },
]

export function ProductGrid() {
  const [selectedTab, setSelectedTab] = useState<Tab>("new-arrivals")
  const [isVisible, setIsVisible] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const { addItem } = useCart()
  const { products } = useProducts()
  const { offers } = useOffers()
  const { orders } = useOrders()
  const activeProducts = products.filter((product) => product.isActive !== false)
  const rankingMap = useMemo(() => computeDemandRanking(products, orders), [products, orders])

  const visibleProducts = (
    selectedTab === "new-arrivals"
      ? activeProducts.filter(isNewArrival)
      : activeProducts
          .filter((product) => rankingMap[product.id])
          .sort((a, b) => realSoldQuantity(b.id, orders) - realSoldQuantity(a.id, orders))
  ).slice(0, 8)

  const handleTabChange = (tab: Tab) => {
    if (tab !== selectedTab) {
      setIsTransitioning(true)
      setTimeout(() => {
        setSelectedTab(tab)
        setTimeout(() => {
          setIsTransitioning(false)
        }, 50)
      }, 300)
    }
  }

  useEffect(() => {
    const gridObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (gridRef.current) {
      gridObserver.observe(gridRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (gridRef.current) {
        gridObserver.unobserve(gridRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Fresh This Season
          </span>
          <h2 className={`font-serif leading-tight text-foreground mb-4 text-balance text-4xl md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            New Arrivals
          </h2>
          <p className={`text-lg text-muted-foreground max-w-md mx-auto ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
            The latest additions to our handpicked collection, updated regularly
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-background rounded-full p-1 gap-1 relative">
            <div
              className="absolute top-1 bottom-1 bg-foreground rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{
                left: selectedTab === 'new-arrivals' ? '4px' : '50%',
                width: 'calc(50% - 4px)'
              }}
            />
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => handleTabChange(tab.value)}
                className={`relative z-10 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedTab === tab.value
                    ? "text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                suppressHydrationWarning
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div
          ref={gridRef}
          className="flex overflow-x-auto gap-3 snap-x snap-mandatory -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible"
        >
          {visibleProducts.map((product, index) => (
            <ProductCard
              key={`${selectedTab}-${product.id}`}
              product={product}
              rank={rankingMap[product.id]}
              index={index}
              isVisible={isVisible && !isTransitioning}
              onAddToCart={() =>
                addItem({
                  id: product.id,
                  name: product.name,
                  description: product.tagline ?? product.description,
                  price: computeSalePrice(product, offers)?.salePrice ?? product.price,
                  image: product.images[0],
                })
              }
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  )
}

function ProductCard({
  product,
  rank,
  index,
  isVisible,
  onAddToCart,
}: {
  product: Product
  rank?: "Bestseller" | "Most Wanted"
  index: number
  isVisible: boolean
  onAddToCart: () => void
}) {
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
      className={`group w-40 shrink-0 snap-start sm:w-auto sm:shrink transition-all duration-500 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}
      style={{ transitionDelay: isVisible ? `${index * 80}ms` : '0ms' }}
    >
      <div className="bg-background rounded-xl sm:rounded-3xl overflow-hidden boty-shadow boty-transition group-hover:scale-[1.02]">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          <SwipeableCardImage
            images={product.images}
            alt={product.name}
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-cover boty-transition group-hover:scale-105"
          />
          {/* Badge */}
          {badgeText && (
            <span
              className={`absolute top-2 left-2 sm:top-4 sm:left-4 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs tracking-wide bg-white text-black ${
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
          {/* Wishlist toggle */}
          <button
            type="button"
            suppressHydrationWarning
            className="absolute top-2 right-2 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 boty-transition boty-shadow"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toggleWishlist(product.id)
            }}
            aria-label="Toggle wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${wishlisted ? "fill-primary text-primary" : "text-foreground"}`} />
          </button>
          {/* Quick add button */}
          <button
            type="button"
            suppressHydrationWarning
            className="hidden sm:flex absolute bottom-4 right-4 w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 boty-transition boty-shadow"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAddToCart()
            }}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4 text-foreground" />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-5">
          <h3 className="font-serif text-sm sm:text-lg text-foreground mb-0.5 sm:mb-1 truncate">{product.name}</h3>
          <p className="hidden sm:block text-sm text-muted-foreground mb-3">{product.tagline ?? product.description}</p>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-sm sm:text-base font-medium text-foreground">
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
      </div>
    </Link>
  )
}
