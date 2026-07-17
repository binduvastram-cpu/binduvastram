"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const gallery = images.length > 0 ? images : ["/placeholder.svg"]

  useEffect(() => {
    if (!api) return
    setSelectedIndex(api.selectedScrollSnap())
    api.on("select", () => setSelectedIndex(api.selectedScrollSnap()))
  }, [api])

  return (
    <div className="space-y-3">
      <div className="relative">
        <Carousel setApi={setApi} opts={{ loop: gallery.length > 1 }}>
          <CarouselContent className="-ml-0">
            {gallery.map((image, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
                  <Image
                    src={image}
                    alt={`${alt} ${i + 1}`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => api?.scrollPrev()}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center boty-shadow"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center boty-shadow"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-foreground" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => api?.scrollTo(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`h-1.5 rounded-full boty-transition ${
                    i === selectedIndex ? "w-5 bg-white" : "w-1.5 bg-white/60"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {gallery.map((image, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-card boty-shadow boty-transition border-2 ${
                i === selectedIndex ? "border-primary" : "border-transparent"
              }`}
            >
              <Image src={image} alt={`${alt} thumbnail ${i + 1}`} fill sizes="12vw" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
