"use client"

import Link from "next/link"
import { Instagram, MessageCircle } from "lucide-react"
import { categories } from "@/lib/products"

const footerLinks = {
  shop: categories.map((category) => ({
    name: category.label,
    href: `/shop?category=${category.value}`,
  })),
  about: [
    { name: "Our Story", href: "/about" },
    { name: "Size Guide", href: "/size-guide" },
    { name: "Return & Refund Policy", href: "/returns" },
    { name: "Virtual Shopping", href: "/virtual-shopping" },
  ],
  support: [
    { name: "WhatsApp Us", href: "https://wa.me/919141718191" },
    { name: "Instagram", href: "https://instagram.com/binduvastram" },
    { name: "Wishlist", href: "/wishlist" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-card pt-20 pb-10 relative overflow-hidden">
      {/* Giant Background Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none select-none z-0">
        <span className="font-serif text-[120px] sm:text-[160px] md:text-[280px] lg:text-[320px] xl:text-[320px] font-bold text-white/20 whitespace-nowrap leading-none">
          Bindu Vastram
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="sm:col-span-2 md:col-span-1">
            <h2 className="font-serif text-3xl text-foreground mb-4">Bindu Vastram</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-2">
              Tradition in every thread, elegance in every drape. Premium handpicked sarees & ethnic wear.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Adiprala Sunrise Apartment, Flat C323, Block C, Opp. Dmart, Siddapura, Whitefield - 560066, Bangalore
            </p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/binduvastram"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://wa.me/919141718191"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground/60 hover:text-foreground boty-transition boty-shadow"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="font-medium text-foreground mb-4">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground">Phone: 7795092349</li>
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-foreground boty-transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Bindu Vastram. All rights reserved. GSTIN: 29ACZPH1916M1ZV
            </p>
            <div className="flex gap-6">
              <Link href="/returns" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Return Policy
              </Link>
              <Link href="/size-guide" className="text-sm text-muted-foreground hover:text-foreground boty-transition">
                Size Guide
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
