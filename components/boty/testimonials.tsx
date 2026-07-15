"use client"

import { useEffect, useRef, useState } from "react"
import { Star } from "lucide-react"

// Sample seed testimonials — replace with real customer reviews once available.
const testimonials = [
  {
    id: 1,
    name: "Priya S.",
    location: "Bangalore",
    rating: 5,
    text: "The Banarasi silk saree I ordered was even more beautiful in person. The zari work is stunning and the fall is perfect.",
    product: "Royal Banarasi Silk Saree"
  },
  {
    id: 2,
    name: "Ananya R.",
    location: "Chennai",
    rating: 5,
    text: "Wore the Kanjivaram for my sister's wedding and got so many compliments. Handpicked quality really shows.",
    product: "Heritage Kanjivaram Silk Saree"
  },
  {
    id: 3,
    name: "Meera K.",
    location: "Hyderabad",
    rating: 5,
    text: "Loved how easy the whole ordering process was, and COD made it so convenient. The blouse fit perfectly too.",
    product: "Designer Readymade Blouse"
  },
  {
    id: 4,
    name: "Divya N.",
    location: "Mumbai",
    rating: 5,
    text: "The packaging alone felt premium. The saree itself is even softer and richer than the photos showed.",
    product: "Cream & Gold Handloom Saree"
  },
  {
    id: 5,
    name: "Lakshmi V.",
    location: "Bangalore",
    rating: 5,
    text: "The jhumkas are lightweight and go with everything. Ordered a second pair as a gift for my mother.",
    product: "Temple Jhumka Earrings"
  },
  {
    id: 6,
    name: "Sneha P.",
    location: "Coimbatore",
    rating: 5,
    text: "Delivery was quick and the saree draped beautifully for our family function. Will definitely order again.",
    product: "Magenta Pillar Silk Saree"
  },
  {
    id: 7,
    name: "Kavya M.",
    location: "Pune",
    rating: 5,
    text: "The kurta set fit my husband perfectly and the fabric quality is exactly as described. Great for festive occasions.",
    product: "Men's Silk Kurta Set"
  },
  {
    id: 8,
    name: "Ritu D.",
    location: "Bangalore",
    rating: 5,
    text: "Such an elegant collection. The customer service on WhatsApp was quick to answer all my questions before I ordered.",
    product: "Garden Breeze Chiffon Saree"
  },
  {
    id: 9,
    name: "Anjali T.",
    location: "Delhi",
    rating: 5,
    text: "Bought the potli bag to match my saree and it arrived beautifully packaged. Perfect finishing touch.",
    product: "Embroidered Potli Bag"
  }
]

const TestimonialCard = ({ testimonial }: { testimonial: typeof testimonials[0] }) => (
  <div className="rounded-3xl p-6 bg-white mb-4 flex-shrink-0"
    style={{
      boxShadow: "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px"
    }}
  >
    {/* Stars */}
    

    {/* Quote */}
    <p className="text-foreground/80 leading-relaxed mb-4 text-pretty font-medium text-xl font-serif tracking-wide">
      &ldquo;{testimonial.text}&rdquo;
    </p>

    {/* Author */}
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-foreground text-sm font-bold">{testimonial.name}</p>
        <p className="text-xs text-muted-foreground">{testimonial.location}</p>
      </div>
      <span className="text-xs tracking-wide text-primary/70 bg-primary/5 px-2 py-1 rounded-full whitespace-nowrap">
        {testimonial.product}
      </span>
    </div>
  </div>
)

export function Testimonials() {
  const [headerVisible, setHeaderVisible] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  
  const column1 = [testimonials[0], testimonials[3], testimonials[6]]
  const column2 = [testimonials[1], testimonials[4], testimonials[7]]
  const column3 = [testimonials[2], testimonials[5], testimonials[8]]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeaderVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (headerRef.current) {
      observer.observe(headerRef.current)
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current)
      }
    }
  }, [])

  return (
    <section className="py-24 bg-background overflow-hidden pb-24 pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <span className={`text-sm tracking-[0.3em] uppercase text-primary mb-4 block ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.2s', animationFillMode: 'forwards' } : {}}>
            Kind Words
          </span>
          <h2 className={`font-serif text-4xl leading-tight text-foreground text-balance md:text-7xl ${headerVisible ? 'animate-blur-in opacity-0' : 'opacity-0'}`} style={headerVisible ? { animationDelay: '0.4s', animationFillMode: 'forwards' } : {}}>
            Loved across India
          </h2>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
          
          {/* Mobile - Single Column */}
          <div className="md:hidden h-[600px]">
            <div className="relative overflow-hidden h-full">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...testimonials, ...testimonials].map((testimonial, index) => (
                  <TestimonialCard key={`mobile-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop - Three Columns */}
          <div className="hidden md:grid md:grid-cols-3 gap-4 h-[600px]">
            {/* Column 1 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column1, ...column1].map((testimonial, index) => (
                  <TestimonialCard key={`col1-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 2 - Scrolling Up */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-up hover:animate-scroll-up-slow">
                {[...column2, ...column2].map((testimonial, index) => (
                  <TestimonialCard key={`col2-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>

            {/* Column 3 - Scrolling Down */}
            <div className="relative overflow-hidden">
              <div className="animate-scroll-down hover:animate-scroll-down-slow">
                {[...column3, ...column3].map((testimonial, index) => (
                  <TestimonialCard key={`col3-${testimonial.id}-${index}`} testimonial={testimonial} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }

        @keyframes scroll-up {
          0% {
            transform: translateY(-50%);
          }
          100% {
            transform: translateY(0);
          }
        }

        .animate-scroll-down {
          animation: scroll-down 30s linear infinite;
        }

        .animate-scroll-up {
          animation: scroll-up 30s linear infinite;
        }

        .animate-scroll-down-slow {
          animation: scroll-down 60s linear infinite;
        }

        .animate-scroll-up-slow {
          animation: scroll-up 60s linear infinite;
        }
      `}</style>
    </section>
  )
}
