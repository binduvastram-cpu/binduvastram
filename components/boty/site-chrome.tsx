"use client"

import { usePathname } from "next/navigation"
import { Header } from "./header"
import { Footer } from "./footer"

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (pathname?.startsWith("/admin")) return <>{children}</>

  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
}
