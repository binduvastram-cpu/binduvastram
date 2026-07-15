"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Italiana } from "next/font/google"
import { ArrowRight } from "lucide-react"
import { DIALOGUE_VISIBLE_UNTIL, LEFT_TEXT_START, HERO_INTRO_SEEN_KEY } from "@/lib/hero-timing"

const italiana = Italiana({ subsets: ["latin"], weight: "400" })

const HERO_IMAGES = [
  { src: "/images/herosec1.png", position: "center 20%" },
  { src: "/images/herosec2.png", position: "78% 12%" },
  { src: "/images/herosec4.png", position: "60% 18%" },
  { src: "/images/saree-studio-blue.jpg", position: "center 12%" },
]

const SLIDE_DURATION = 5000
const MOBILE_BREAKPOINT = 768
const MOBILE_VIDEO_MAX_SECONDS = 7

export function Hero() {
  // Starts unknown (not "desktop") so we never render the image carousel on a
  // phone for one frame and then swap to video — we just show nothing until
  // we actually know, which is a much less jarring flash than a media swap.
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [activeSlide, setActiveSlide] = useState(0)
  const [dialogueVisible, setDialogueVisible] = useState(false)
  const [showLeftText, setShowLeftText] = useState(false)

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    checkViewport()
    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((i) => (i + 1) % HERO_IMAGES.length)
    }, SLIDE_DURATION)

    const alreadySeen = window.sessionStorage.getItem(HERO_INTRO_SEEN_KEY) === "1"

    if (alreadySeen) {
      // Intro already played this session — skip straight to the static state.
      setShowLeftText(true)
      return () => clearInterval(interval)
    }

    // Fade the center dialogue in almost immediately, hold briefly, fade out —
    // then the left content takes over, once and for good (until the next session).
    const fadeInTimer = setTimeout(() => setDialogueVisible(true), 60)
    const fadeOutTimer = setTimeout(() => setDialogueVisible(false), DIALOGUE_VISIBLE_UNTIL)
    const leftTimer = setTimeout(() => {
      setShowLeftText(true)
      window.sessionStorage.setItem(HERO_INTRO_SEEN_KEY, "1")
    }, LEFT_TEXT_START)

    return () => {
      clearInterval(interval)
      clearTimeout(fadeInTimer)
      clearTimeout(fadeOutTimer)
      clearTimeout(leftTimer)
    }
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background — a looping video on mobile (no scrim — see below), the image carousel + soft gradient everywhere else */}
      <div className="absolute inset-0 bg-background">
        {isMobile === true && (
          <video
            autoPlay
            muted
            loop
            playsInline
            onTimeUpdate={(e) => {
              // The source clip is 10s but we only want the first 7s on loop.
              if (e.currentTarget.currentTime >= MOBILE_VIDEO_MAX_SECONDS) {
                e.currentTarget.currentTime = 0
              }
            }}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/videos/hero-mobile.mp4" type="video/mp4" />
          </video>
        )}
        {isMobile === false && (
          <>
            {HERO_IMAGES.map((image, index) => (
              <Image
                key={image.src}
                src={image.src}
                alt="Bindu Vastram premium sarees"
                fill
                sizes="100vw"
                priority={index === 0}
                style={{ objectPosition: image.position }}
                className={`object-cover transition-opacity duration-1000 ease-in-out ${
                  index === activeSlide ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div
              className={`absolute inset-0 bg-gradient-to-r from-background from-0% via-background/35 via-35% to-transparent to-65% transition-opacity duration-700 ease-in-out ${
                showLeftText ? "opacity-100" : "opacity-0"
              }`}
            />
            <div
              className={`absolute bottom-0 left-0 right-0 h-[30%] bg-gradient-to-t from-background/70 to-transparent transition-opacity duration-700 ease-in-out ${
                showLeftText ? "opacity-100" : "opacity-0"
              }`}
            />
          </>
        )}
      </div>

      {/* Center Dialogue — quick rise-and-fade reveal, positioned above face-height, gone before the left content appears */}
      <div className="absolute inset-0 z-20 flex items-start justify-center pt-24 sm:pt-32 md:pt-40 px-6 pointer-events-none">
        <div
          className={`text-center max-w-2xl transition-all ease-out ${
            dialogueVisible
              ? "opacity-100 translate-y-0 blur-none duration-[800ms]"
              : "opacity-0 -translate-y-3 blur-sm duration-[700ms]"
          }`}
        >
          <span
            className="text-xs sm:text-sm uppercase tracking-[0.5em] text-white/90 mb-3 sm:mb-4 block"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}
          >
            Bindu Vastram
          </span>
          <p
            className={`${italiana.className} text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white text-balance tracking-wide`}
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.45)" }}
          >
            Woven in Tradition,
            <br />
            Styled in Grace
          </p>
        </div>
      </div>

      {/* Left Content — fades in only after the center dialogue has fully faded out, then stays static */}
      <div className="relative z-10 w-full pt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div
            className={`w-full lg:max-w-lg transition-all duration-700 ease-out ${
              showLeftText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            }`}
          >
            <span
              className="text-sm uppercase mb-5 block tracking-[0.2em] text-white md:text-foreground"
              style={isMobile ? { textShadow: "0 2px 16px rgba(0,0,0,0.45)" } : undefined}
            >
              Premium Sarees
            </span>
            <h2
              className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 text-balance font-semibold text-white md:text-foreground"
              style={isMobile ? { textShadow: "0 4px 20px rgba(0,0,0,0.45)" } : undefined}
            >
              Elegance in Every Drape
            </h2>
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-3 bg-primary text-primary-foreground px-8 py-4 rounded-full text-sm tracking-wide boty-transition hover:bg-primary/90 boty-shadow"
            >
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 boty-transition" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
