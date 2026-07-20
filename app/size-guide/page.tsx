export const metadata = {
  title: "Size Guide — Bindu Vastram",
}

const blouseSizes = [
  { size: "32", bust: "32 in / 81 cm", waist: "27 in / 69 cm" },
  { size: "34", bust: "34 in / 86 cm", waist: "29 in / 74 cm" },
  { size: "36", bust: "36 in / 91 cm", waist: "31 in / 79 cm" },
  { size: "38", bust: "38 in / 97 cm", waist: "33 in / 84 cm" },
  { size: "40", bust: "40 in / 102 cm", waist: "35 in / 89 cm" },
]

const apparelSizes = [
  { size: "S", chest: "36 in / 91 cm" },
  { size: "M", chest: "38 in / 97 cm" },
  { size: "L", chest: "40 in / 102 cm" },
  { size: "XL", chest: "42 in / 107 cm" },
  { size: "XXL", chest: "44 in / 112 cm" },
]

export default function SizeGuidePage() {
  return (
    <main className="min-h-screen">
      <div className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-sm tracking-[0.3em] uppercase text-primary mb-4 block">
              Fit Guide
            </span>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4 text-balance">
              Size Guide
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Sarees come in free size unless noted. Use these charts for blouses, kurtas, and petticoats.
            </p>
          </div>

          <div className="mb-14">
            <h2 className="font-serif text-2xl text-foreground mb-4">Blouses & Petticoats</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 pr-4 text-sm text-muted-foreground font-medium">Size</th>
                    <th className="py-3 pr-4 text-sm text-muted-foreground font-medium">Bust / Hip</th>
                    <th className="py-3 text-sm text-muted-foreground font-medium">Waist</th>
                  </tr>
                </thead>
                <tbody>
                  {blouseSizes.map((row) => (
                    <tr key={row.size} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">{row.size}</td>
                      <td className="py-3 pr-4 text-foreground/80">{row.bust}</td>
                      <td className="py-3 text-foreground/80">{row.waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mb-14">
            <h2 className="font-serif text-2xl text-foreground mb-4">Men's Kurtas & Jackets</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="py-3 pr-4 text-sm text-muted-foreground font-medium">Size</th>
                    <th className="py-3 text-sm text-muted-foreground font-medium">Chest</th>
                  </tr>
                </thead>
                <tbody>
                  {apparelSizes.map((row) => (
                    <tr key={row.size} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">{row.size}</td>
                      <td className="py-3 text-foreground/80">{row.chest}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 boty-shadow">
            <h3 className="font-medium text-foreground mb-2">Need help choosing a size?</h3>
            <p className="text-sm text-muted-foreground">
              Message us on WhatsApp with your usual size and we&apos;ll help you pick the right fit before you order.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
