"use client"

import Image from "next/image"
import Link from "next/link"
import { Shirt } from "lucide-react"
import { categories } from "@/lib/products"

export function CategoryGrid() {
  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
            Shop by Category
          </span>
          <h2 className="font-serif leading-tight text-foreground mb-4 text-balance text-5xl md:text-6xl">
            Explore the collection
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => (
            <Link
              key={category.value}
              href={`/shop?category=${category.value}`}
              className="group relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow boty-transition hover:scale-[1.02]"
            >
              {category.image ? (
                <Image
                  src={category.image}
                  alt={category.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover boty-transition group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-card to-secondary/30 flex items-center justify-center">
                  <Shirt className="w-10 h-10 text-primary/40" strokeWidth={1} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/10 to-transparent" />
              <span className="absolute bottom-4 left-4 right-4 font-serif text-lg sm:text-xl text-background">
                {category.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
