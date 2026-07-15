import Image from "next/image"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

export const metadata = {
  title: "Our Story — Bindu Vastram",
}

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Our Story
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 text-balance">
              Bindu Vastram
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Tradition in every thread, elegance in every drape.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-24">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden boty-shadow">
              <Image
                src="/images/saree-portrait-pillar.jpg"
                alt="Bindu Vastram handpicked sarees"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-6 text-balance">
                Handpicked elegance, since day one.
              </h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                Bindu Vastram began with a simple belief — that every saree tells a story, and every
                customer deserves a piece that feels truly special. We handpick our sarees, ethnic wear,
                and jewellery with an eye for quality, craft, and timeless style.
              </p>
              <p className="text-foreground/80 leading-relaxed mb-8">
                From premium silk sarees to ready-made blouses and accessories, every product in our
                collection is chosen with passion, so you can drape tradition and elegance in equal measure.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  "Premium Handpicked Sarees",
                  "Quality You Can Trust",
                  "Timeless Elegance",
                  "Made With Passion",
                ].map((item) => (
                  <div key={item} className="bg-card rounded-2xl p-4 boty-shadow">
                    <p className="text-sm font-medium text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-10 md:p-14 text-center boty-shadow max-w-3xl mx-auto">
            <h3 className="font-serif text-2xl md:text-3xl text-foreground mb-4">Visit or Reach Us</h3>
            <p className="text-foreground/80 leading-relaxed mb-2">
              Adiprala Sunrise Apartment, Flat C323, Block C, Opp. Dmart, Siddapura, Whitefield - 560066, Bangalore
            </p>
            <p className="text-foreground/80 mb-1">Phone: 7795092349</p>
            <p className="text-foreground/80">Instagram: @binduvastram</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
