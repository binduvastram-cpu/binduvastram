"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Gem, Sparkles, Package } from "lucide-react"

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Bento Grid */}
        <div
          ref={bentoRef}
          className="grid md:grid-cols-4 mb-20 md:grid-rows-[300px_300px] gap-6"
        >
          {/* Left Large Block - Image with Overlay Card */}
          <div
            className={`relative rounded-3xl overflow-hidden h-[500px] md:h-auto md:col-span-2 md:row-span-2 transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '0ms' }}
          >
            <Image
              src="/images/saree-portrait-earring.jpg"
              alt="Handpicked saree detail"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
            {/* Overlay text — directly on the image, no card */}
            <div className="absolute bottom-8 left-8 right-8">
              <h3
                className="font-serif text-2xl md:text-3xl text-white mb-2"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}
              >
                Elegant Packaging
              </h3>
              <p
                className="text-sm text-white/90 leading-relaxed"
                style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}
              >
                Every order arrives beautifully packaged, ready to gift or keep.
              </p>
            </div>
          </div>

          {/* Top Right - Exclusive Collections */}
          <div
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-center md:col-span-2 relative overflow-hidden transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Background Image */}
            <Image
              src="/images/saree-duo-editorial.jpg"
              alt="Exclusive saree collection"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />

            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl text-white mb-2">
                Exclusive Collections
              </h3>
              <h3 className="text-2xl md:text-3xl text-white/70 mb-4">
                High Quality Fabrics
              </h3>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Gem className="w-4 h-4 flex-shrink-0" />
                  <span>Handpicked Craftsmanship</span>
                </div>
                <div className="flex items-center gap-2 text-white/90 text-sm">
                  <Sparkles className="w-4 h-4 flex-shrink-0" />
                  <span>Festive & Bridal Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Right - Elegant Packaging */}
          <div
            className={`rounded-3xl p-6 md:p-8 flex flex-col justify-center relative overflow-hidden md:col-span-2 bg-card transition-all duration-700 ease-out ${
              isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="relative z-10 flex flex-col justify-center h-full text-left items-start">
              <div className="inline-flex items-center justify-center w-10 h-10 mb-3">
                <Package className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-sans text-base mb-1 text-foreground">
                Ships With Care
              </h3>
              <h3 className="text-2xl md:text-3xl mb-2 text-foreground">
                Across India
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
