"use client"

import { useEffect, useRef, useState } from "react"
import { Truck, RotateCcw, BadgeCheck, PackageCheck } from "lucide-react"

const badges = [
  {
    icon: PackageCheck,
    title: "COD Available",
    description: "Pay when your order arrives"
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description: "Hassle-free return policy"
  },
  {
    icon: BadgeCheck,
    title: "Authentic Fabrics",
    description: "Handpicked, genuine quality"
  },
  {
    icon: Truck,
    title: "Pan-India Delivery",
    description: "Shipped safely to your door"
  }
]

export function TrustBadges() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section className="py-8 sm:py-12 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div
          ref={sectionRef}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6"
        >
          {badges.map((badge, index) => (
            <div
              key={badge.title}
              className={`bg-background p-3 sm:p-5 lg:p-8 text-center rounded-xl border border-stone-200 transition-all duration-700 ease-out border-none ${
                isVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <badge.icon className="text-primary mb-1.5 sm:mb-3 lg:mb-4 mx-auto size-6 sm:size-9 lg:size-12" strokeWidth={1} />
              <h3 className="font-serif text-foreground mb-0.5 sm:mb-1.5 lg:mb-2 text-sm sm:text-lg lg:text-2xl">{badge.title}</h3>
              <p className="text-[11px] sm:text-xs lg:text-sm text-muted-foreground">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
