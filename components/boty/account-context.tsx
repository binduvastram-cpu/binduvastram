"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

const CART_KEY = "bindu-vastram-cart"

// Cart stays guest-first in localStorage (see cart-context.tsx) — this backs
// it up to the account the moment identity is known, so it isn't lost once a
// device-only guest signs in. (Wishlist has its own equivalent sync built
// directly into wishlist-context.tsx, since it needs to merge in both
// directions on every session restore, not just at sign-in.)
async function mergeGuestCartToAccount(supabase: ReturnType<typeof createClient>, uid: string) {
  try {
    const cartRaw = window.localStorage.getItem(CART_KEY)
    if (cartRaw) {
      const items: { id: string; quantity: number }[] = JSON.parse(cartRaw)
      if (items.length > 0) {
        await supabase
          .from("cart_items")
          .upsert(
            items.map((i) => ({ profile_id: uid, product_id: i.id, size: "", quantity: i.quantity })),
            { onConflict: "profile_id,product_id,size" }
          )
      }
    }
  } catch {
    // best-effort — a failed merge shouldn't block sign-in
  }
}

export interface AccountProfile {
  name: string
  phone: string
  email: string
}

export interface AccountAddress {
  line1: string
  line2: string
  city: string
  pincode: string
  state: string
}

interface AccountContextType {
  profile: AccountProfile | null
  address: AccountAddress | null
  isLoggedIn: boolean
  hydrated: boolean
  signUp: (input: { email: string; password: string; name: string; phone: string; address: AccountAddress }) => Promise<string | null>
  logIn: (input: { email: string; password: string }) => Promise<string | null>
  logInWithPhone: (input: { phone: string; password: string }) => Promise<string | null>
  checkPhoneExists: (phone: string) => Promise<boolean>
  logout: () => Promise<void>
  updateProfile: (input: { name: string; phone: string }) => Promise<void>
  saveAddress: (input: AccountAddress) => Promise<void>
  deleteAccount: () => Promise<void>
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [userId, setUserId] = useState<string | null>(null)
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [address, setAddress] = useState<AccountAddress | null>(null)
  const [hydrated, setHydrated] = useState(false)

  const loadAccountData = async (uid: string) => {
    const [{ data: p }, { data: a }] = await Promise.all([
      supabase.from("profiles").select("name, phone, email").eq("id", uid).single(),
      supabase.from("addresses").select("line1, line2, city, pincode, state").eq("profile_id", uid).maybeSingle(),
    ])
    setProfile(p ? { name: p.name ?? "", phone: p.phone ?? "", email: p.email ?? "" } : null)
    setAddress(
      a ? { line1: a.line1, line2: a.line2 ?? "", city: a.city ?? "", pincode: a.pincode, state: a.state ?? "" } : null
    )
  }

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      if (session?.user) {
        setUserId(session.user.id)
        await loadAccountData(session.user.id)
      }
      setHydrated(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUserId(session.user.id)
        await loadAccountData(session.user.id)
      } else {
        setUserId(null)
        setProfile(null)
        setAddress(null)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signUp: AccountContextType["signUp"] = async ({ email, password, name, phone, address }) => {
    const phoneCheck = await fetch("/api/auth/phone-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
    if (phoneCheck.ok) {
      return "An account already exists for this number — please log in instead."
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    })
    if (error) return error.message
    if (data.user) {
      // The handle_new_user trigger already stamps name/phone from the signup
      // metadata above — this update just covers the (rare) race where the
      // trigger's row isn't committed yet yet by the time this runs.
      await supabase.from("profiles").update({ name, phone }).eq("id", data.user.id)
      await supabase.from("addresses").upsert({ profile_id: data.user.id, ...address }, { onConflict: "profile_id" })
      setUserId(data.user.id)
      setProfile({ name, phone, email })
      setAddress(address)
      await mergeGuestCartToAccount(supabase, data.user.id)
    }
    return null
  }

  const logIn: AccountContextType["logIn"] = async ({ email, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return error.message
    if (data.user) await mergeGuestCartToAccount(supabase, data.user.id)
    return null
  }

  // Phone isn't a Supabase Auth identifier, so this resolves phone -> email
  // via the service-role-backed lookup route first, then signs in as usual.
  const logInWithPhone: AccountContextType["logInWithPhone"] = async ({ phone, password }) => {
    const res = await fetch("/api/auth/phone-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return body.error ?? "No account found for this number"
    }
    const { email } = await res.json()
    return logIn({ email, password })
  }

  const checkPhoneExists = async (phone: string): Promise<boolean> => {
    const res = await fetch("/api/auth/phone-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })
    return res.ok
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile: AccountContextType["updateProfile"] = async ({ name, phone }) => {
    if (!userId) return
    await supabase.from("profiles").update({ name, phone }).eq("id", userId)
    setProfile((p) => (p ? { ...p, name, phone } : p))
  }

  const saveAddress: AccountContextType["saveAddress"] = async (input) => {
    if (!userId) return
    await supabase.from("addresses").upsert({ profile_id: userId, ...input }, { onConflict: "profile_id" })
    setAddress(input)
  }

  const deleteAccount = async () => {
    if (!userId) return
    await fetch("/api/account/delete", { method: "POST" })
    await supabase.auth.signOut()
    setUserId(null)
    setProfile(null)
    setAddress(null)
  }

  return (
    <AccountContext.Provider
      value={{
        profile,
        address,
        isLoggedIn: !!userId,
        hydrated,
        signUp,
        logIn,
        logInWithPhone,
        checkPhoneExists,
        logout,
        updateProfile,
        saveAddress,
        deleteAccount,
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}
