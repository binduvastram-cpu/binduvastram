"use client"

import { useState, useEffect, type ReactNode, type FormEvent } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Minus, Plus, ChevronDown, Heart, Star, Check, Truck, PackageCheck, ShieldCheck, RotateCcw } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useWishlist } from "@/components/boty/wishlist-context"
import { useProducts } from "@/components/boty/products-store"
import { useReviews } from "@/components/boty/reviews-store"
import { useAccount } from "@/components/boty/account-context"
import { useOrders } from "@/components/boty/orders-store"
import { ProductGallery } from "@/components/boty/product-gallery"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { sizeChartForCategory } from "@/lib/size-charts"
import { formatPrice } from "@/lib/format"
import { useOffers } from "@/components/boty/offers-store"
import { computeSalePrice, discountLabel } from "@/lib/offers"
import { displayBoughtCount, realSampleLocations } from "@/lib/social-proof"

type AccordionSection = "details" | "fabricCare" | "delivery"

export default function ProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  const { products } = useProducts()
  const product = products.find((p) => p.id === productId) ?? products[0]

  const { addItem } = useCart()
  const { isWishlisted, toggleWishlist } = useWishlist()
  const { reviews, addReview } = useReviews()
  const { profile, isLoggedIn } = useAccount()
  const { offers } = useOffers()
  const { orders } = useOrders()
  const applied = computeSalePrice(product, offers)

  // No size is pre-selected — Section 9a requires an active choice before
  // Add to Cart, not a silently-defaulted one.
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined)
  const [sizeError, setSizeError] = useState(false)
  const [showSizeChart, setShowSizeChart] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [openAccordion, setOpenAccordion] = useState<AccordionSection | null>("details")
  const [isAdded, setIsAdded] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState("")
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === "approved")
  const averageRating = productReviews.length > 0
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : null
  const boughtCount = displayBoughtCount(product, orders)
  const sampleLocations = realSampleLocations(product.id, orders)
  const sizeChart = sizeChartForCategory(product.category)

  useEffect(() => {
    window.scrollTo(0, 0)
    setSelectedSize(undefined)
    setSizeError(false)
    setQuantity(1)
    setReviewSubmitted(false)
    setReviewText("")
  }, [productId])

  const toggleAccordion = (section: AccordionSection) => {
    setOpenAccordion(openAccordion === section ? null : section)
  }

  const validateSize = () => {
    if (product.sizes && !selectedSize) {
      setSizeError(true)
      return false
    }
    return true
  }

  const handleAddToCart = () => {
    if (!validateSize()) return
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: product.id,
        name: product.name,
        description: product.tagline ?? product.description,
        price: applied ? applied.salePrice : product.price,
        image: product.images[0],
      })
    }
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!validateSize()) return
    handleAddToCart()
    router.push("/cart")
  }

  const handleReviewSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!reviewText.trim() || !isLoggedIn || !profile) return
    await addReview({
      productId: product.id,
      customerName: profile.name,
      rating: reviewRating,
      text: reviewText.trim(),
    })
    setReviewSubmitted(true)
    setReviewText("")
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
    material: "Material",
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

      <div className="pt-28 lg:pt-36 pb-28 lg:pb-20">
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
            {/* Product Image Gallery — swipeable on touch, arrows/thumbnails on desktop */}
            <ProductGallery images={product.images} videoUrl={product.videoUrl} alt={product.name} />

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
                {averageRating !== null ? (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < Math.round(averageRating) ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {averageRating.toFixed(1)} ({productReviews.length} {productReviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-4">No reviews yet — be the first to review this product.</p>
                )}

                {/* Social proof — real order data once it exists, plus the manual baseline */}
                {boughtCount > 0 && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-4 text-sm text-muted-foreground">
                    <span>
                      Bought by {boughtCount} people
                      {sampleLocations.length > 0 ? `, recently from ${sampleLocations[0]}` : ""}
                    </span>
                  </div>
                )}

                <p className="text-foreground/80 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-medium text-foreground">
                  {formatPrice(applied ? applied.salePrice : product.price)}
                </span>
                {applied ? (
                  <>
                    <span className="text-xl text-muted-foreground line-through">{formatPrice(product.price)}</span>
                    <span className="text-sm font-medium text-destructive">{discountLabel(applied.offer)}</span>
                  </>
                ) : (
                  product.mrp && (
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.mrp)}
                    </span>
                  )
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
                {product.category === "jewellery" && (
                  <>
                    <span className="inline-flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      Certified Materials
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-primary" />
                      Easy Returns
                    </span>
                  </>
                )}
              </div>

              {/* Size Selector — required before Add to Cart (Section 9a) */}
              {product.sizes && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-foreground block">
                      Size {!selectedSize && <span className="text-muted-foreground font-normal">(required)</span>}
                    </label>
                    {sizeChart && (
                      <button
                        type="button"
                        onClick={() => setShowSizeChart(true)}
                        className="text-xs text-primary hover:underline"
                      >
                        Size Chart
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => {
                      const stock = product.sizeStock?.[size]
                      const outOfStock = stock === 0
                      return (
                        <button
                          key={size}
                          type="button"
                          disabled={outOfStock}
                          onClick={() => {
                            setSelectedSize(size)
                            setSizeError(false)
                          }}
                          className={`px-6 py-3 rounded-full text-sm boty-transition boty-shadow relative ${
                            outOfStock
                              ? "bg-muted text-muted-foreground/50 cursor-not-allowed line-through"
                              : selectedSize === size
                              ? "bg-primary text-primary-foreground"
                              : "bg-card text-foreground hover:bg-card/80"
                          }`}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                  {sizeError && (
                    <p className="text-xs text-destructive mt-2">Please select a size before continuing.</p>
                  )}
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

          {/* Reviews */}
          <div className="mt-16 pt-16 border-t border-border/50 max-w-3xl">
            <h2 className="font-serif text-2xl md:text-3xl text-foreground mb-6">
              Reviews {productReviews.length > 0 && `(${productReviews.length})`}
            </h2>

            {productReviews.length === 0 ? (
              <p className="text-sm text-muted-foreground mb-8">No reviews yet — be the first to share your experience.</p>
            ) : (
              <div className="space-y-6 mb-10">
                {productReviews.map((review) => (
                  <div key={review.id} className="border-b border-border/50 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                      ))}
                      <span className="text-sm font-medium text-foreground">{review.customerName}</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed">{review.text}</p>
                    {review.reply && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/30">
                        <p className="text-xs font-medium text-primary mb-1">Bindu Vastram</p>
                        <p className="text-sm text-muted-foreground">{review.reply}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Submit a review — requires a real account so it's tied to a genuine
                customer; goes to moderation before appearing either way. */}
            <div className="bg-card rounded-2xl p-6">
              {!isLoggedIn ? (
                <p className="text-sm text-muted-foreground">
                  <Link href="/account" className="text-primary hover:underline">Log in</Link> to leave a review.
                </p>
              ) : reviewSubmitted ? (
                <p className="text-sm text-foreground">Thanks for your review! It'll appear here once approved.</p>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Your Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} type="button" onClick={() => setReviewRating(star)} aria-label={`${star} stars`}>
                          <Star className={`w-6 h-6 ${star <= reviewRating ? "fill-primary text-primary" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Your Review</label>
                    <textarea
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                      placeholder="Share your experience with this product..."
                      className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 resize-none"
                    />
                  </div>
                  <button type="submit" className="bg-primary text-primary-foreground px-6 py-3 rounded-full text-sm font-medium boty-transition hover:bg-primary/90">
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {sizeChart && (
        <Dialog open={showSizeChart} onOpenChange={setShowSizeChart}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Size Chart</DialogTitle>
              <DialogDescription>Measurements in inches / centimeters</DialogDescription>
            </DialogHeader>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Size</th>
                  <th className="py-2 pr-4 text-muted-foreground font-medium">Bust/Chest</th>
                  <th className="py-2 text-muted-foreground font-medium">Waist</th>
                </tr>
              </thead>
              <tbody>
                {sizeChart.map((row) => (
                  <tr key={row.size} className="border-b border-border/50">
                    <td className="py-2 pr-4 font-medium text-foreground">{row.size}</td>
                    <td className="py-2 pr-4 text-foreground/80">{row.bust}</td>
                    <td className="py-2 text-foreground/80">{row.waist}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </DialogContent>
        </Dialog>
      )}

      <Footer />

      {/* Sticky mobile Add to Cart / Buy Now bar */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t border-border/50 px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
      >
        <div className="flex-shrink-0">
          <p className="text-lg font-medium text-foreground leading-none">
            {formatPrice(applied ? applied.salePrice : product.price)}
          </p>
          {applied ? (
            <p className="text-xs text-muted-foreground line-through leading-none mt-1">{formatPrice(product.price)}</p>
          ) : (
            product.mrp && (
              <p className="text-xs text-muted-foreground line-through leading-none mt-1">
                {formatPrice(product.mrp)}
              </p>
            )
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
