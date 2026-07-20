"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Package, Users, ShoppingBag, LogOut, Menu, X, Star, Mail, Video, Tag, Layers, ListChecks, XCircle, BadgePercent } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories & Types", icon: Layers },
  { href: "/admin/attributes", label: "Attributes", icon: ListChecks },
  { href: "/admin/offers", label: "Offers", icon: Tag },
  { href: "/admin/coupons", label: "Coupons", icon: BadgePercent },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/cancellations", label: "Cancellations", icon: XCircle },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/leads", label: "Leads", icon: Mail },
  { href: "/admin/virtual-shopping", label: "Virtual Shopping", icon: Video },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [checked, setChecked] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) {
        router.replace("/admin/login")
        setChecked(true)
        return
      }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()
      if (profile?.is_admin) {
        setAuthorized(true)
      } else {
        router.replace("/admin/login")
      }
      setChecked(true)
    })
  }, [router])

  useEffect(() => {
    setMobileNavOpen(false)
  }, [pathname])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  if (!checked || !authorized) {
    return <div className="min-h-screen bg-background" />
  }

  const NavLinks = () => (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium boty-transition ${
              isActive ? "bg-primary text-primary-foreground" : "text-foreground/70 hover:bg-card"
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border/50 p-6 gap-2 flex-shrink-0">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Image src="/logo.png" alt="Bindu Vastram" width={36} height={36} className="rounded-full w-9 h-9" />
          <div>
            <p className="font-serif text-lg text-foreground leading-none">Bindu Vastram</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
        <NavLinks />
        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 boty-transition w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-background border-b border-border/50 flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="Bindu Vastram" width={28} height={28} className="rounded-full w-7 h-7" />
          <span className="font-serif text-base text-foreground">Admin</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen((open) => !open)}
          className="p-2 text-foreground"
          aria-label="Toggle menu"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-background pt-16 px-4 pb-6 flex flex-col gap-2 overflow-y-auto">
          <NavLinks />
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-destructive hover:bg-destructive/10 boty-transition mt-4"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-16 lg:pt-0 p-4 sm:p-6 lg:p-10">{children}</main>
    </div>
  )
}
