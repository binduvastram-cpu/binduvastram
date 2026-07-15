import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"

export const metadata = {
  title: "Return & Refund Policy — Bindu Vastram",
}

const sections = [
  {
    title: "Return Window",
    body: "Returns are accepted within 7 days of delivery, provided the product is unused, unwashed, and returned with its original tags and packaging intact.",
  },
  {
    title: "Non-Returnable Items",
    body: "Petticoats, blouses altered or stitched to custom measurements, and jewellery are not eligible for return due to hygiene and customization reasons, unless the item arrives damaged or defective.",
  },
  {
    title: "How to Initiate a Return",
    body: "Message us on WhatsApp with your order ID and reason for return. Our team will guide you through pickup or drop-off, whichever is available in your area.",
  },
  {
    title: "Refunds",
    body: "Once the returned item is received and inspected, refunds are processed to the original payment method within 5-7 business days. For Cash on Delivery orders, refunds are issued via bank transfer or UPI.",
  },
  {
    title: "Damaged or Incorrect Items",
    body: "If you receive a damaged, defective, or incorrect item, please contact us within 48 hours of delivery with photos of the product and packaging for a quick resolution.",
  },
]

export default function ReturnsPage() {
  return (
    <main className="min-h-screen">
      <Header />

      <div className="pt-28 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Support
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">
              Return & Refund Policy
            </h1>
          </div>

          <div className="space-y-10">
            {sections.map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-2xl text-foreground mb-3">{section.title}</h2>
                <p className="text-foreground/80 leading-relaxed">{section.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
