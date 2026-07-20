"use client"

import { useState, useEffect, useMemo, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, Search, User, Heart, ChevronRight, ChevronDown, Home, Info, Video } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"
import { useCategories } from "./categories-store"
import { useCollections } from "./collections-store"
import { slugify } from "@/lib/saree-collections"
import { LEFT_TEXT_START, HERO_INTRO_SEEN_KEY } from "@/lib/hero-timing"
import { Drawer, DrawerContent, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

type NavLeaf = { label: string; href: string }
type NavItem =
  | { type: "link"; label: string; href: string }
  | { type: "dropdown"; label: string; href: string; items: NavLeaf[] }
  | { type: "mega"; label: string; href: string; columns: { label: string; href: string; items: NavLeaf[] }[] }

function collectionHref(slug: string) {
  return `/shop?category=sarees&collection=${slug}`
}

// Silk/Cotton/etc. are shown in this order when present; any brand-new family
// an admin adds from /admin/categories (a fabric type outside this known set)
// is appended at the end automatically, so it gets a nav slot with no code change.
const FAMILY_ORDER = ["silk", "cotton", "silk-cotton", "tussars", "linens", "fancy"]

// Categories that already get their own explicit top-level link/section
// below — everything else (built-in or admin-added) still gets its own
// top-level link, just appended after these.
const CATEGORIES_WITH_OWN_SLOT = new Set(["sarees", "designer", "salwar-suits"])

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null)
  const { setIsOpen, itemCount } = useCart()
  const { categories } = useCategories()
  const { families } = useCollections()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [headerVisible, setHeaderVisible] = useState(!isHome)

  const NAV_ITEMS: NavItem[] = useMemo(() => {
    const familySlugs = [
      ...FAMILY_ORDER.filter((slug) => families[slug]),
      ...Object.keys(families).filter((slug) => !FAMILY_ORDER.includes(slug)),
    ]

    const familyItems: NavItem[] = familySlugs.map((slug) => {
      const family = families[slug]
      if (family.groups && Object.keys(family.groups).length > 0) {
        return {
          type: "mega",
          label: family.label,
          href: collectionHref(slug),
          columns: Object.entries(family.groups).map(([groupSlug, group]) => ({
            label: group.label,
            href: collectionHref(groupSlug),
            items: group.items.map((item) => ({ label: item, href: collectionHref(slugify(item)) })),
          })),
        }
      }
      if (family.items && family.items.length > 0) {
        return {
          type: "dropdown",
          label: family.label,
          href: collectionHref(slug),
          items: family.items.map((item) => ({ label: item, href: collectionHref(slugify(item)) })),
        }
      }
      return { type: "link", label: family.label, href: collectionHref(slug) }
    })

    // Everything without its own top-level slot goes in one "More" dropdown
    // so the bar stays a single line — Women's Wear/Men's Wear/Hand Bags/
    // Petticoats first (preferred order), then any other leftover category
    // (Blouses, Jewellery, admin-added ones) appended after.
    const otherCategories = categories.filter((c) => !CATEGORIES_WITH_OWN_SLOT.has(c.value))
    const preferredOrder = ["womens-wear", "mens-wear", "handbags", "petticoats"]
    const orderedOtherCategories = [
      ...preferredOrder.map((value) => otherCategories.find((c) => c.value === value)).filter(Boolean),
      ...otherCategories.filter((c) => !preferredOrder.includes(c.value)),
    ] as typeof otherCategories

    return [
      { type: "link", label: "Just Arrived", href: "/shop?filter=new-arrivals" },
      ...familyItems,
      { type: "link", label: "Designer", href: "/shop?category=designer" },
      { type: "link", label: "Salwar Suits", href: "/shop?category=salwar-suits" },
      {
        type: "dropdown",
        label: "More",
        href: "/shop",
        items: [
          ...orderedOtherCategories.map((c) => ({ label: c.label, href: `/shop?category=${c.value}` })),
          { label: "Offers", href: "/offers" },
          { label: "Shop All", href: "/shop" },
        ],
      },
      { type: "link", label: "Virtual Shopping", href: "/virtual-shopping" },
    ]
  }, [families, categories])

  // On the homepage, the header pops in right after the hero's center
  // dialogue fades out — everywhere else it appears immediately as before.
  // If the intro already played this session, skip the wait entirely. This
  // runs once, at the header's initial mount, and never again — the header
  // now persists across client-side navigation (see site-chrome.tsx), so
  // re-running this on every pathname change used to replay the reveal
  // animation on every single navigation away from "/".
  useEffect(() => {
    if (!isHome) {
      setHeaderVisible(true)
      return
    }
    if (window.sessionStorage.getItem(HERO_INTRO_SEEN_KEY) === "1") {
      setHeaderVisible(true)
      return
    }
    const timer = setTimeout(() => setHeaderVisible(true), LEFT_TEXT_START)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return
    router.push(`/shop?search=${encodeURIComponent(searchValue.trim())}`)
    setIsSearchOpen(false)
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border/50 transition-all duration-700 ease-out ${
        headerVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      {/* Row 1 — utility bar: search / centered logo+wordmark (wordmark desktop-only) / account icons */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-[68px]">
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden lg:flex items-center">
            {isSearchOpen ? (
              <form onSubmit={submitSearch}>
                <input
                  type="text"
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => !searchValue && setIsSearchOpen(false)}
                  placeholder="Search sarees..."
                  className="w-56 bg-card border border-border/50 rounded-full px-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none boty-transition"
                />
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="p-2 text-foreground/70 hover:text-foreground boty-transition"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Logo + brand wordmark — hidden on the smallest screens while the mobile search field is open */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 ${isSearchOpen ? "hidden sm:flex" : ""}`}
          >
            <Image src="/logo.png" alt="Bindu Vastram" width={44} height={44} className="rounded-full w-11 h-11" priority />
            <span className="hidden lg:block font-serif text-xl tracking-wide text-foreground">Bindu Vastram</span>
          </Link>

          {/* Mobile search toggle (the desktop one lives in the left slot above) */}
          <div className="lg:hidden flex items-center">
            {isSearchOpen && (
              <form onSubmit={submitSearch} className="mr-1">
                <input
                  type="text"
                  autoFocus
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onBlur={() => !searchValue && setIsSearchOpen(false)}
                  placeholder="Search sarees..."
                  className="w-32 sm:w-48 bg-card border border-border/50 rounded-full px-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none boty-transition"
                />
              </form>
            )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setIsSearchOpen((open) => !open)}
              className="lg:hidden p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Search"
              suppressHydrationWarning
            >
              <Search className="w-5 h-5" />
            </button>
            <Link
              href="/wishlist"
              className="hidden sm:block p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
            </Link>
            <Link
              href="/account"
              className="hidden sm:block p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/70 hover:text-foreground boty-transition"
              aria-label="Cart"
              suppressHydrationWarning
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0 -right-0 w-4 h-4 bg-primary text-primary-foreground text-[10px] flex items-center justify-center rounded-full">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — full nav bar, desktop only */}
      <div className="hidden lg:block bg-primary border-t border-accent/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <nav className="flex flex-wrap items-center justify-center gap-x-1 gap-y-1 py-2.5">
            {NAV_ITEMS.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.type !== "link" && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 px-3 py-2 text-sm tracking-wide text-primary-foreground/85 hover:text-primary-foreground boty-transition"
                >
                  {item.label}
                  {item.type !== "link" && <ChevronDown className="w-3.5 h-3.5" />}
                </Link>

                {item.type === "dropdown" && openMenu === item.label && (
                  <div
                    className={`absolute top-full ${item.label === "More" ? "right-0" : "left-0"} pt-2 z-50`}
                  >
                    <ul className="min-w-[240px] bg-background rounded-2xl boty-shadow p-2">
                      {item.items.map((leaf) => (
                        <li key={leaf.href}>
                          <Link
                            href={leaf.href}
                            className="block rounded-xl px-4 py-2.5 text-sm text-foreground/80 hover:bg-card hover:text-foreground boty-transition"
                          >
                            {leaf.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {item.type === "mega" && openMenu === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50">
                    <div className="flex gap-8 bg-background rounded-2xl boty-shadow p-6">
                      {item.columns.map((column) => (
                        <div key={column.label} className="min-w-[180px]">
                          <Link
                            href={column.href}
                            className="block font-serif text-base text-foreground mb-2 hover:text-primary boty-transition"
                          >
                            {column.label}
                          </Link>
                          <ul className="space-y-1.5">
                            {column.items.map((leaf) => (
                              <li key={leaf.href}>
                                <Link
                                  href={leaf.href}
                                  className="block text-sm text-foreground/70 hover:text-foreground boty-transition"
                                >
                                  {leaf.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      <CartDrawer />

      {/* Mobile Navigation — slide-in drawer with nested accordions for Silk/Cotton/etc */}
      <Drawer open={isMenuOpen} onOpenChange={setIsMenuOpen} direction="left">
        <DrawerContent className="h-full !w-[80%] max-w-xs">
          <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
          <DrawerDescription className="sr-only">Site navigation and shop categories</DrawerDescription>
          <div className="flex items-center justify-between p-6 pb-4">
            <Image src="/logo.png" alt="Bindu Vastram" width={36} height={36} className="rounded-full w-9 h-9" />
            <DrawerClose asChild>
              <button type="button" className="p-2 text-foreground/70" aria-label="Close menu" suppressHydrationWarning>
                <X className="w-5 h-5" />
              </button>
            </DrawerClose>
          </div>

          <div className="flex flex-col px-6 pb-8 overflow-y-auto">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 mt-2">Shop</p>
            {NAV_ITEMS.map((item) => {
              if (item.type === "link") {
                return (
                  <DrawerClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between py-3.5 font-serif text-lg text-foreground border-b border-border/30 boty-transition"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </Link>
                  </DrawerClose>
                )
              }

              const isExpanded = expandedSection === item.label
              return (
                <div key={item.label} className="border-b border-border/30">
                  <button
                    type="button"
                    onClick={() => setExpandedSection(isExpanded ? null : item.label)}
                    className="w-full flex items-center justify-between py-3.5 font-serif text-lg text-foreground"
                  >
                    {item.label}
                    <ChevronRight className={`w-4 h-4 text-muted-foreground boty-transition ${isExpanded ? "rotate-90" : ""}`} />
                  </button>
                  {isExpanded && (
                    <div className="pb-3 pl-2 flex flex-col gap-0.5">
                      {item.type === "dropdown"
                        ? item.items.map((leaf) => (
                            <DrawerClose asChild key={leaf.href}>
                              <Link href={leaf.href} className="py-2 text-sm text-foreground/80">
                                {leaf.label}
                              </Link>
                            </DrawerClose>
                          ))
                        : item.columns.map((column) => {
                            const groupExpanded = expandedGroup === column.label
                            return (
                              <div key={column.label}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedGroup(groupExpanded ? null : column.label)}
                                  className="w-full flex items-center justify-between py-2 text-sm font-medium text-foreground"
                                >
                                  {column.label}
                                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground boty-transition ${groupExpanded ? "rotate-90" : ""}`} />
                                </button>
                                {groupExpanded && (
                                  <div className="pl-3 flex flex-col gap-0.5">
                                    {column.items.map((leaf) => (
                                      <DrawerClose asChild key={leaf.href}>
                                        <Link href={leaf.href} className="py-1.5 text-sm text-foreground/70">
                                          {leaf.label}
                                        </Link>
                                      </DrawerClose>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Secondary utility links — smaller visual weight, grouped at the bottom */}
            <div className="mt-6 pt-6 border-t border-border/50 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Account</p>
              <DrawerClose asChild>
                <Link href="/" className="flex items-center gap-3 py-2.5 text-sm text-foreground/70 hover:text-foreground boty-transition">
                  <Home className="w-4 h-4" />
                  Home
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/about" className="flex items-center gap-3 py-2.5 text-sm text-foreground/70 hover:text-foreground boty-transition">
                  <Info className="w-4 h-4" />
                  About
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/virtual-shopping" className="flex items-center gap-3 py-2.5 text-sm text-foreground/70 hover:text-foreground boty-transition">
                  <Video className="w-4 h-4" />
                  Virtual Shopping
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/wishlist" className="flex items-center gap-3 py-2.5 text-sm text-foreground/70 hover:text-foreground boty-transition">
                  <Heart className="w-4 h-4" />
                  Wishlist
                </Link>
              </DrawerClose>
              <DrawerClose asChild>
                <Link href="/account" className="flex items-center gap-3 py-2.5 text-sm text-foreground/70 hover:text-foreground boty-transition">
                  <User className="w-4 h-4" />
                  Account
                </Link>
              </DrawerClose>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </header>
  )
}
