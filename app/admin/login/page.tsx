"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ShieldCheck } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    const supabase = createClient()
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError(signInError.message)
      setSubmitting(false)
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", data.user.id).single()
    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      setError("This account doesn't have admin access.")
      setSubmitting(false)
      return
    }

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
          {error && <p className="text-sm text-destructive">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90 disabled:opacity-60"
          >
            {submitting ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </main>
  )
}
