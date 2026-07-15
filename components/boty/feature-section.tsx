"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Gem, ShieldCheck, Crown, HeartHandshake, Package, Sparkles } from "lucide-react"

const features = [
  {
    icon: Gem,
    title: "Premium Handpicked Sarees",
    description: "Every piece selected for quality and craft"
  },
  {
    icon: ShieldCheck,
    title: "Quality You Can Trust",
    description: "Authentic fabrics, verified before dispatch"
  },
  {
    icon: Crown,
    title: "Timeless Elegance",
    description: "Designs that stay in style, season after season"
  },
  {
    icon: HeartHandshake,
    title: "Made With Passion",
    description: "Handpicked with care for every customer"
  }
]

export function FeatureSection() {
  const [isVisible, setIsVisible] = useState(false)
  const [isImageVisible, setIsImageVisible] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(false)
  const bentoRef = useRef<HTMLDivElement>(null)
  const imageSectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const imageObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImageVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (bentoRef.current) {
      observer.observe(bentoRef.current)
    }

    if (imageSectionRef.current) {
      imageObserver.observe(imageSectionRef.current)
    }

    if (headerRef.current) {
      headerObserver.observe(headerRef.current)
    }

    return () => {
      if (bentoRef.current) {
        observer.unobserve(bentoRef.current)
      }
      if (imageSectionRef.current) {
        imageObserver.unobserve(imageSectionRef.current)
      }
      if (headerRef.current) {
        headerObserver.unobserve(headerRef.current)
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
            {/* Overlay Card */}
            <div className="absolute bottom-8 left-8 right-8 bg-white p-6 shadow-lg rounded-xl">
              <div className="flex items-start gap-3">
                <div>
                  <h3 className="text-xl text-foreground mb-2 font-medium">
                    Elegant <span className="">Packaging</span>
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Every order arrives beautifully packaged, ready to gift or keep.
                  </p>
                </div>
              </div>
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

        <div
          ref={imageSectionRef}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center my-0 py-20"
        >
          {/* Image */}
          <div
            className={`relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow transition-all duration-700 ease-out ${
              isImageVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
            }`}
          >
            <Image
              src="/images/saree-garden-breeze.jpg"
              alt="Saree crafted with passion"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>

          {/* Content */}
          <div
            ref={headerRef}
            className={`transition-all duration-700 ease-out ${
              isImageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
              Why Bindu Vastram
            </span>
            <h2 className={`font-serif text-4xl leading-tight text-foreground mb-6 text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
              Woven with passion.
            </h2>
            <p className={`text-lg text-muted-foreground leading-relaxed mb-10 max-w-md ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.6s', animationFillMode: 'forwards' } : {}}>
              Tradition in every thread, elegance in every drape. Every piece is handpicked
              for quality, craft, and timeless style.
            </p>

            {/* Feature Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group p-5 boty-transition hover:scale-[1.02] rounded-md bg-card"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 group-hover:bg-primary/20 boty-transition bg-background">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium text-foreground mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
