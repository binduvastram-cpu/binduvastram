import { Header } from "@/components/boty/header"
import { Hero } from "@/components/boty/hero"
import { ShopByPrice } from "@/components/boty/shop-by-price"
import { OffersTicker } from "@/components/boty/offers-ticker"
import { CategoryGrid } from "@/components/boty/category-grid"
import { CategorySpotlight } from "@/components/boty/category-spotlight"
import { TrustBadges } from "@/components/boty/trust-badges"
import { FeatureSection } from "@/components/boty/feature-section"
import { ProductGrid } from "@/components/boty/product-grid"
import { VirtualShoppingBanner } from "@/components/boty/virtual-shopping-banner"
import { Testimonials } from "@/components/boty/testimonials"
import { CTABanner } from "@/components/boty/cta-banner"
import { Newsletter } from "@/components/boty/newsletter"
import { Footer } from "@/components/boty/footer"

export default function HomePage() {
  return (
    <main>
      <Header />
      <Hero />
      <ShopByPrice />
      <OffersTicker />
      <ProductGrid />
      <CategorySpotlight />
      <CategoryGrid />
      <VirtualShoppingBanner />
      <FeatureSection />
      <TrustBadges />
      <Testimonials />
      <CTABanner />
      <Newsletter />
      <Footer />
    </main>
  )
}
