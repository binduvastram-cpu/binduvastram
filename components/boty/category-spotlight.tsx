"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useProducts } from "./products-store"
import { SwipeableCardImage } from "./swipeable-card-image"
import { formatPrice } from "@/lib/format"

const SPOTLIGHT_CATEGORY = "sarees" as const
const SPOTLIGHT_IMAGE = "/images/saree-heritage-wall.jpg"

export function CategorySpotlight() {
  const { products } = useProducts()
  const spotlightProducts = products
    .filter((product) => product.isActive !== false && product.category === SPOTLIGHT_CATEGORY)
    .slice(0, 8)

  if (spotlightProducts.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-card">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 lg:gap-10 items-stretch">
          {/* Promo image + CTA */}
          <Link
            href={`/shop?category=${SPOTLIGHT_CATEGORY}`}
            className="group relative rounded-3xl overflow-hidden boty-shadow h-64 lg:h-auto"
          >
            <Image
              src={SPOTLIGHT_IMAGE}
              alt="Saree collection spotlight"
              fill
              sizes="(max-width: 1024px) 100vw, 380px"
              className="object-cover boty-transition group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="text-xs tracking-[0.3em] uppercase text-background/80 mb-2 block">
                Handpicked
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-background mb-4 text-balance">
                The Saree Edit
              </h2>
              <span className="inline-flex items-center gap-2 bg-background text-foreground px-5 py-2.5 rounded-full text-sm font-medium boty-transition group-hover:gap-3">
                View Collection
                <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Horizontally scrolling product row */}
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory lg:snap-none -mx-6 px-6 lg:mx-0 lg:px-0">
            {spotlightProducts.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                className="group shrink-0 w-40 sm:w-48 snap-start"
              >
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted mb-3">
                  <SwipeableCardImage
                    images={product.images}
                    alt={product.name}
                    sizes="200px"
                    className="object-cover boty-transition group-hover:scale-105"
                  />
                </div>
                <h3 className="font-serif text-sm sm:text-base text-foreground mb-1 truncate">{product.name}</h3>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-foreground">{formatPrice(product.price)}</span>
                  {product.mrp && (
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.mrp)}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
