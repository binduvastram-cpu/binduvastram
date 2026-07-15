"use client"

import { useState, useEffect, type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Heart, Star, Check, Truck, PackageCheck } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useWishlist } from "@/components/boty/wishlist-context"
import { useProducts } from "@/components/boty/products-store"

type AccordionSection = "details" | "fabricCare" | "delivery"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { products } = useProducts()
  const product = products.find((p) => p.id === productId) ?? products[0]

  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()

  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0])
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
    setSelectedSize(product.sizes?.[0])
    setQuantity(1)
  }, [productId])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        description: product.tagline ?? product.description,
        price: product.price,
        image: product.images[0],
      })
    }
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    handleAddToCart()
    router.push("/cart")
  }

  const propertyEntries = Object.entries(product.properties).filter(([, value]) => value !== undefined)
  const propertyLabels: Record<string, string> = {
    fabric: "Fabric",
    work: "Work",
    blouseIncluded: "Blouse",
    washCare: "Wash Care",
    occasion: "Occasion",
    color: "Color",
    length: "Length",
  }

  const accordionItems: { key: AccordionSection; title: string; content: ReactNode }[] = [
    {
      key: "details",
      title: "Details",
      content: (
        <div className="space-y-3">
          <p>{product.description}</p>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-foreground/80">
            {propertyEntries
              .filter(([key]) => key !== "washCare")
              .map(([key, value]) => (
                <li key={key}>
                  <span className="text-muted-foreground">{propertyLabels[key]}: </span>
                  {key === "blouseIncluded" ? (value ? "Included" : "Not Included") : String(value)}
                </li>
              ))}
          </ul>
        </div>
      ),
    },
    {
      key: "fabricCare",
      title: "Fabric & Care",
      content: (
        <div className="space-y-2">
          <p>{product.properties.washCare ?? "Care instructions available on request."}</p>
          {product.properties.blouseIncluded !== undefined && (
            <p>{product.properties.blouseIncluded ? "Comes with a matching unstitched blouse piece." : "Blouse piece not included."}</p>
          )}
        </div>
      ),
    },
    {
      key: "delivery",
      title: "Delivery & Returns",
      content: (
        <p>
          {product.codAvailable ? "Cash on Delivery available. " : ""}
          Estimated delivery in {product.estimatedDeliveryDays[0]}–{product.estimatedDeliveryDays[1]} business days.
          Easy returns accepted within 7 days of delivery if the product is unused and unwashed with original tags intact.
        </p>
      ),
    },
  ]

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-28 lg:pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Back Link */}
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground boty-transition mb-8"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Shop
          </Link>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Product Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
                <Image
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.map((image, i) => (
                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-card boty-shadow">
                      <Image
                        src={image}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        sizes="(max-width: 1024px) 25vw, 12vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-start justify-between gap-4">
                  <span className="text-sm tracking-[0.3em] uppercase text-primary mb-2 block">
                    Bindu Vastram
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(product.id)}
                    className="p-2 rounded-full bg-card boty-shadow flex-shrink-0"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? "fill-primary text-primary" : "text-foreground"}`} />
                  </button>
                </div>
                <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-3">
                  {product.name}
                </h1>
                {product.tagline && (
                  <p className="text-lg text-muted-foreground italic mb-4">
                    {product.tagline}
                  </p>
                )}

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">(128 reviews)</span>
                </div>

                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-medium text-foreground">₹{product.price.toLocaleString("en-IN")}</span>
                {product.mrp && (
                  <span className="text-xl text-muted-foreground line-through">
                    ₹{product.mrp.toLocaleString("en-IN")}
                  </span>
                )}
              </div>

              {/* Trust line */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-sm text-muted-foreground">
                {product.codAvailable && (
                  <span className="inline-flex items-center gap-2">
                    <PackageCheck className="w-4 h-4 text-primary" />
                    COD Available
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary" />
                  Delivery in {product.estimatedDeliveryDays[0]}–{product.estimatedDeliveryDays[1]} days
                </span>
              </div>

              {/* Size Selector */}
              {product.sizes && (
                <div className="mb-6">
                  <label className="text-sm font-medium text-foreground mb-3 block">Size</label>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setSelectedSize(size)}
                        className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow ${
                          selectedSize === size
                            ? "bg-primary text-primary-foreground"
                            : "bg-card text-foreground hover:bg-card/80"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-8">
                <label className="text-sm font-medium text-foreground mb-3 block">Quantity</label>
                <div className="inline-flex items-center gap-4 bg-card rounded-full px-2 py-2 boty-shadow">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-medium text-foreground">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Add to Cart Buttons — desktop/tablet only; phones use the sticky bar below */}
              <div className="hidden lg:flex gap-4 mb-10">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full text-sm tracking-wide boty-transition boty-shadow ${
                    isAdded
                      ? "bg-primary/80 text-primary-foreground"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      Added to Cart
                    </>
                  ) : (
                    "Add to Cart"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-transparent border border-foreground/20 text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-foreground/5"
                >
                  Buy Now
                </button>
              </div>

              {/* Accordion */}
              <div className="border-t border-border/50">
                {accordionItems.map((item) => (
                  <div key={item.key} className="border-b border-border/50">
                    <button
                      type="button"
                      onClick={() => toggleAccordion(item.key)}
                      className="w-full flex items-center justify-between py-5 text-left"
                    >
                      <span className="font-medium text-foreground">{item.title}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-muted-foreground boty-transition ${
                          openAccordion === item.key ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden boty-transition ${
                        openAccordion === item.key ? "max-h-96 pb-5" : "max-h-0"
                      }`}
                    >
                      <div className="text-sm text-muted-foreground leading-relaxed">
                        {item.content}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Sticky mobile Add to Cart / Buy Now bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex-shrink-0">
          <p className="text-lg font-medium text-foreground leading-none">₹{product.price.toLocaleString("en-IN")}</p>
          {product.mrp && (
            <p className="text-xs text-muted-foreground line-through leading-none mt-1">
              ₹{product.mrp.toLocaleString("en-IN")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-sm font-medium boty-transition ${
            isAdded ? "bg-primary/80 text-primary-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4" />
              Added
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-foreground/20 text-foreground px-4 py-3 rounded-full text-sm font-medium boty-transition"
        >
          Buy Now
        </button>
      </div>
    </main>
  )
}
