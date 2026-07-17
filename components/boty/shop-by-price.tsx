"use client"

import Link from "next/link"

const PRICE_BADGES: { lines: string[]; caption: string; min: number; max: number | null }[] = [
  { lines: ["Under", "₹2,000"], caption: "Under ₹2,000", min: 0, max: 1999 },
  { lines: ["Under", "₹5,000"], caption: "Under ₹5,000", min: 0, max: 4999 },
  { lines: ["₹5,000", "to", "₹15,000"], caption: "₹5,000 to ₹15,000", min: 5000, max: 15000 },
  { lines: ["₹15,000", "to", "₹35,000"], caption: "₹15,000 to ₹35,000", min: 15000, max: 35000 },
  { lines: ["Above", "₹35,000"], caption: "Above ₹35,000", min: 35000, max: null },
]

export function ShopByPrice() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-sm tracking-[0.3em] uppercase text-primary mb-3 block">
            Budget First
          </span>
          <h2 className="font-serif text-3xl md:text-4xl text-foreground text-balance">
            Shop by Price
          </h2>
        </div>

        {/* Horizontal scroll on mobile, centered wrap on larger screens */}
        <div className="flex overflow-x-auto sm:flex-wrap sm:justify-center sm:overflow-visible gap-5 sm:gap-6 px-6 -mx-6 sm:px-0 sm:mx-0 pb-2 snap-x snap-mandatory sm:snap-none">
          {PRICE_BADGES.map((badge) => (
            <Link
              key={badge.caption}
              href={badge.max !== null ? `/shop?price_min=${badge.min}&price_max=${badge.max}` : `/shop?price_min=${badge.min}`}
              className="flex-shrink-0 snap-start flex flex-col items-center gap-2.5 group"
            >
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-primary text-primary-foreground flex flex-col items-center justify-center text-center px-2 boty-shadow boty-transition group-hover:scale-105">
                {badge.lines.map((line, i) => (
                  <span key={i} className="font-semibold uppercase tracking-wide leading-tight text-[11px] sm:text-sm">
                    {line}
                  </span>
                ))}
              </div>
              <span className="text-xs sm:text-sm text-foreground/80 whitespace-nowrap">{badge.caption}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
