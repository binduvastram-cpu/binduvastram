"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useCart } from "@/components/boty/cart-context"
import { useWishlist } from "@/components/boty/wishlist-context"
import { useProducts } from "@/components/boty/products-store"
import { formatPrice } from "@/lib/format"

export default function WishlistPage() {
  const { ids, toggleWishlist } = useWishlist()
  const { addItem } = useCart()
  const { products } = useProducts()

  const wishlistedProducts = products.filter((product) => ids.includes(product.id))

  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">Your Wishlist</h1>
          <p className="text-muted-foreground mb-12">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? "item" : "items"} saved
          </p>

          {wishlistedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-3xl boty-shadow">
              <Heart className="w-12 h-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-6">Nothing saved yet</p>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90"
              >
                Browse the Collection
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wishlistedProducts.map((product) => (
                <div key={product.id} className="bg-card rounded-3xl overflow-hidden boty-shadow">
                  <Link href={`/product/${product.id}`} className="block relative aspect-square bg-muted">
                    <Image
                      src={product.images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        toggleWishlist(product.id)
                      }}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center boty-shadow"
                      aria-label="Remove from wishlist"
                    >
                      <Heart className="w-4 h-4 fill-primary text-primary" />
                    </button>
                  </Link>
                  <div className="p-5">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-serif text-lg text-foreground mb-1">{product.name}</h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="font-medium text-foreground">{formatPrice(product.price)}</span>
                      {product.mrp && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatPrice(product.mrp)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        addItem({
                          id: product.id,
                          name: product.name,
                          description: product.tagline ?? product.description,
                          price: product.price,
                          image: product.images[0],
                        })
                      }
                      className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-full text-sm boty-transition hover:bg-primary/90"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
