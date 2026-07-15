"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { ADMIN_SESSION_KEY } from "@/lib/admin-auth"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    // Placeholder gate — any non-empty credentials are accepted until real
    // admin auth is wired up in the backend phase.
    window.sessionStorage.setItem(ADMIN_SESSION_KEY, "1")
    router.push("/admin")
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm bg-card rounded-3xl boty-shadow p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Image src="/logo.png" alt="Bindu Vastram" width={48} height={48} className="rounded-full mb-4 w-12 h-12" />
          <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-3">
            <ShieldCheck className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-serif text-2xl text-foreground mb-1">Admin Login</h1>
          <p className="text-xs text-muted-foreground max-w-xs">
            Temporary access gate — any email/password works until real admin auth is wired up.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@binduvastram.com"
              required
              className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 boty-transition"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 boty-transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90"
          >
            Log In
          </button>
        </form>
      </div>
    </main>
  )
}
