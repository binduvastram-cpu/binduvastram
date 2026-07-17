"use client"

import { useRef, useState } from "react"
import Image from "next/image"

const SWIPE_THRESHOLD = 40

// Lightweight per-card image cycler for grid/listing cards — swipe on touch,
// hover-to-preview-second-image on desktop (Section 7). Renders one <Image>
// at a time (not all images stacked) so cards don't multiply their network
// payload across a full grid.
export function SwipeableCardImage({
  images,
  alt,
  sizes,
  className,
  onLoad,
}: {
  images: string[]
  alt: string
  sizes: string
  className?: string
  onLoad?: () => void
}) {
  const [index, setIndex] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const gallery = images.length > 0 ? images : ["/placeholder.svg"]

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || gallery.length <= 1) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > SWIPE_THRESHOLD) {
      setIndex((i) => (delta < 0 ? (i + 1) % gallery.length : (i - 1 + gallery.length) % gallery.length))
    }
    touchStartX.current = null
  }

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onMouseEnter={() => gallery.length > 1 && setIndex(1)}
      onMouseLeave={() => setIndex(0)}
    >
      <Image
        src={gallery[index]}
        alt={`${alt} ${index + 1}`}
        fill
        sizes={sizes}
        className={className}
        onLoad={onLoad}
      />
      {gallery.length > 1 && (
        <div className="absolute bottom-1.5 sm:bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10 pointer-events-none">
          {gallery.map((_, i) => (
            <span
              key={i}
              className={`h-1 rounded-full boty-transition ${i === index ? "w-3 bg-white" : "w-1 bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
