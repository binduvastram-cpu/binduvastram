"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

type Slide = { type: "image"; src: string } | { type: "video"; src: string }

export function ProductGallery({ images, videoUrl, alt }: { images: string[]; videoUrl?: string; alt: string }) {
  const [api, setApi] = useState<CarouselApi>()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const imageSlides: Slide[] = (images.length > 0 ? images : ["/placeholder.svg"]).map((src) => ({ type: "image", src }))
  const gallery: Slide[] = videoUrl ? [...imageSlides, { type: "video", src: videoUrl }] : imageSlides

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
            {gallery.map((slide, i) => (
              <CarouselItem key={i} className="pl-0">
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-card boty-shadow">
                  {slide.type === "video" ? (
                    <video
                      src={slide.src}
                      controls
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={slide.src}
                      alt={`${alt} ${i + 1}`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                      priority={i === 0}
                    />
                  )}
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
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 text-foreground" />
            </button>
            <button
              type="button"
              onClick={() => api?.scrollNext()}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm flex items-center justify-center boty-shadow"
              aria-label="Next slide"
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
                  aria-label={`Go to slide ${i + 1}`}
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
          {gallery.map((slide, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`relative aspect-square rounded-xl overflow-hidden bg-card boty-shadow boty-transition border-2 ${
                i === selectedIndex ? "border-primary" : "border-transparent"
              }`}
            >
              {slide.type === "video" ? (
                <>
                  <video src={slide.src} className="absolute inset-0 w-full h-full object-cover" muted />
                  <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white fill-white" />
                  </div>
                </>
              ) : (
                <Image src={slide.src} alt={`${alt} thumbnail ${i + 1}`} fill sizes="12vw" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
