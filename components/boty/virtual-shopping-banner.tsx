"use client"

import Link from "next/link"
import { Video } from "lucide-react"

export function VirtualShoppingBanner() {
  return (
    <section className="py-12 sm:py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-center sm:text-left">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-foreground/15 flex items-center justify-center shrink-0">
            <Video className="w-6 h-6 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-xl sm:text-3xl text-primary-foreground text-balance">
            Experience Virtual Shopping From Anywhere
          </h2>
          <Link
            href="/virtual-shopping"
            className="shrink-0 inline-flex items-center justify-center bg-primary-foreground text-primary px-8 py-3.5 rounded-full text-sm font-medium tracking-wide boty-transition hover:bg-primary-foreground/90"
          >
            Book Now
          </Link>
        </div>
      </div>
    </section>
  )
}
