"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Gem, Gift, ShieldCheck } from "lucide-react"

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false)
  const bannerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bannerRef.current) {
      observer.observe(bannerRef.current)
    }

    return () => {
      if (bannerRef.current) {
        observer.unobserve(bannerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={bannerRef}
          className={`rounded-3xl p-12 md:p-16 flex flex-col justify-center relative overflow-hidden min-h-[400px] transition-all duration-700 ease-out ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Background Image */}
          <Image
            src="/images/saree-beach-silhouette.jpg"
            alt="Bindu Vastram festive collection"
            fill
            sizes="(max-width: 1024px) 100vw, 1200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />

          <div className="relative z-10 text-left max-w-2xl">
            <h3 className="text-4xl md:text-5xl text-white mb-4 lg:text-5xl">
              Exclusive Collections
            </h3>
            <h3 className="text-3xl md:text-4xl lg:text-5xl text-white/70 mb-8">
              Handpicked for Every Occasion
            </h3>

            <div className="flex flex-col items-start gap-4 mb-10">
              <div className="flex items-center gap-3 text-white/90">
                <Gem className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">Exclusive Collections</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <Gift className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">Elegant Packaging</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" strokeWidth={1} />
                <span className="text-base">High Quality Fabrics</span>
              </div>
            </div>

            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-white text-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-white/90"
            >
              Shop the Collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
