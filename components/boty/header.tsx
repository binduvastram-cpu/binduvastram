"use client"

import { useState, useEffect, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Menu, X, ShoppingBag, Search, User, Heart, ChevronRight, Home, Info, Video } from "lucide-react"
import { CartDrawer } from "./cart-drawer"
import { useCart } from "./cart-context"
import { categories } from "@/lib/products"
import { LEFT_TEXT_START, HERO_INTRO_SEEN_KEY } from "@/lib/hero-timing"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Drawer, DrawerContent, DrawerClose, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const { setIsOpen, itemCount } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [headerVisible, setHeaderVisible] = useState(!isHome)

  // On the homepage, the header pops in right after the hero's center
  // dialogue fades out — everywhere else it appears immediately as before.
  // If the intro already played this session, skip the wait entirely.
  useEffect(() => {
    if (!isHome) return
    if (window.sessionStorage.getItem(HERO_INTRO_SEEN_KEY) === "1") {
      setHeaderVisible(true)
      return
    }
    const timer = setTimeout(() => setHeaderVisible(true), LEFT_TEXT_START)
    return () => clearTimeout(timer)
  }, [isHome])

  const submitSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchValue.trim()) return
    router.push(`/shop?search=${encodeURIComponent(searchValue.trim())}`)
    setIsSearchOpen(false)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
      <nav
        className={`max-w-7xl mx-auto px-6 lg:px-8 backdrop-blur-md rounded-lg py-0 my-0 bg-[rgba(255,255,255,0.4)] border border-[rgba(255,255,255,0.32)] ${
          isHome
            ? `transition-all duration-700 ease-out ${
                headerVisible ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              }`
            : "animate-scale-fade-in"
        }`}
        style={{ boxShadow: 'rgba(0, 0, 0, 0.1) 0px 10px 50px' }}
      >
        <div className="flex items-center justify-between h-[68px]">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-foreground/80 hover:text-foreground boty-transition"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            suppressHydrationWarning
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Desktop Navigation - Left */}
          <div className="hidden lg:flex items-center gap-2">
            <Link
              href="/"
              className="px-4 py-2 text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              Home
            </Link>
            <NavigationMenu viewport={false}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-sm tracking-wide font-normal text-foreground/70 hover:text-foreground boty-transition">
                    Shop
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[280px] gap-1 p-2 bg-card rounded-2xl boty-shadow">
                      {categories.map((category) => (
                        <li key={category.value}>
                          <NavigationMenuLink asChild>
                            <Link
                              href={`/shop?category=${category.value}`}
                              className="block rounded-xl px-4 py-2.5 text-sm text-foreground/80 hover:bg-background hover:text-foreground boty-transition"
                            >
                              {category.label}
                            </Link>
                          </NavigationMenuLink>
                        </li>
                      ))}
                      <li>
                        <NavigationMenuLink asChild>
                          <Link
                            href="/shop"
                            className="block rounded-xl px-4 py-2.5 text-sm font-medium text-primary hover:bg-background boty-transition"
                          >
                            Shop All
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            <Link
              href="/virtual-shopping"
              className="px-4 py-2 text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              Virtual Shopping
            </Link>
            <Link
              href="/about"
              className="px-4 py-2 text-sm tracking-wide text-foreground/70 hover:text-foreground boty-transition"
            >
              About
            </Link>
          </div>

          {/* Logo — hidden on the smallest screens while the search field is open, to avoid crowding */}
          <Link
            href="/"
            className={`absolute left-1/2 -translate-x-1/2 ${isSearchOpen ? "hidden sm:block" : ""}`}
          >
            <Image src="/logo.png" alt="Bindu Vastram" width={44} height={44} className="rounded-full w-11 h-11" priority />
          </Link>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              {isSearchOpen && (
                <form onSubmit={submitSearch} className="mr-1">
                  <input
                    type="text"
                    autoFocus
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={() => !searchValue && setIsSearchOpen(false)}
                    placeholder="Search sarees..."
                    className="w-32 sm:w-48 bg-background/70 border border-border/50 rounded-full px-4 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none boty-transition"
                  />
                </form>
              )}
              <button
                type="button"
                onClick={() => setIsSearchOpen((open) => !open)}
                className="p-2 text-foreground/70 hover:text-foreground boty-transition"
                aria-label="Search"
                suppressHydrationWarning
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
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

        <CartDrawer />
      </nav>

      {/* Mobile Navigation — slide-in drawer instead of a long in-page list */}
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
            {/* Categories lead the menu — primary, tappable, one tap from real products */}
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1 mt-2">
              Shop by Category
            </p>
            {categories.map((category) => (
              <DrawerClose asChild key={category.value}>
                <Link
                  href={`/shop?category=${category.value}`}
                  className="flex items-center justify-between py-3.5 font-serif text-lg text-foreground border-b border-border/30 boty-transition"
                >
                  {category.label}
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </Link>
              </DrawerClose>
            ))}
            <DrawerClose asChild>
              <Link href="/shop" className="py-3.5 text-sm font-medium text-primary">
                Shop All Products
              </Link>
            </DrawerClose>

            {/* Secondary utility links — smaller visual weight, grouped at the bottom */}
            <div className="mt-6 pt-6 border-t border-border/50 flex flex-col gap-1">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">More</p>
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
