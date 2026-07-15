"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { User, PackageOpen, LogOut, Trash2, Pencil } from "lucide-react"
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { useAccount, type AccountProfile } from "@/components/boty/account-context"
import { useOrders } from "@/components/boty/orders-store"
import { ProfileField, AccountDetailsForm } from "@/components/boty/account-form"

export default function AccountPage() {
  const { profile, isLoggedIn, hydrated, createAccount, updateProfile, login, logout, deleteAccount } = useAccount()

  if (!hydrated) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="pt-28 pb-20" />
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <Header />
      <div className="pt-28 pb-20">
        <div className="max-w-xl mx-auto px-6 lg:px-8">
          {!profile ? (
            <div className="bg-card rounded-3xl boty-shadow p-8">
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h1 className="font-serif text-3xl text-foreground mb-2">Create Your Account</h1>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Save your details once — the next time you visit, you can go straight to checkout.
                </p>
              </div>
              <AccountDetailsForm onSubmit={createAccount} />
            </div>
          ) : !isLoggedIn ? (
            <WelcomeBack name={profile.name} onLogin={login} />
          ) : (
            <AccountDashboard profile={profile} onSave={updateProfile} onLogout={logout} onDelete={deleteAccount} />
          )}
        </div>
      </div>
      <Footer />
    </main>
  )
}

function WelcomeBack({ name, onLogin }: { name: string; onLogin: () => void }) {
  return (
    <div className="bg-card rounded-3xl boty-shadow p-8 text-center">
      <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-4 mx-auto">
        <User className="w-6 h-6 text-primary" />
      </div>
      <h1 className="font-serif text-3xl text-foreground mb-2">Welcome back, {name.split(" ")[0]}</h1>
      <p className="text-sm text-muted-foreground mb-8">Log in to view your profile and place an order.</p>
      <button
        type="button"
        onClick={onLogin}
        className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-medium boty-transition hover:bg-primary/90"
      >
        Log In
      </button>
    </div>
  )
}

function AccountDashboard({
  profile,
  onSave,
  onLogout,
  onDelete,
}: {
  profile: AccountProfile
  onSave: (profile: AccountProfile) => void
  onLogout: () => void
  onDelete: () => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState<AccountProfile>(profile)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { orders } = useOrders()

  const myOrders = orders.filter((o) => o.customerPhone === profile.phone)

  const handleSave = (e: FormEvent) => {
    e.preventDefault()
    onSave(form)
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-card rounded-3xl boty-shadow p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-serif text-2xl text-foreground">{profile.name}</h1>
              <p className="text-sm text-muted-foreground">{profile.phone}</p>
            </div>
          </div>
          {!isEditing && (
            <button
              type="button"
              onClick={() => {
                setForm(profile)
                setIsEditing(true)
              }}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <ProfileField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <ProfileField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" required />
            <ProfileField label="Delivery Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} textarea required />
            <ProfileField label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} required />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 border border-border text-foreground py-3 rounded-full font-medium boty-transition hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Delivery Address</span>
              <p className="text-foreground">{profile.address}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pincode</span>
              <p className="text-foreground">{profile.pincode}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-3xl boty-shadow p-8">
        <h2 className="font-serif text-xl text-foreground mb-4">Order History</h2>
        {myOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <PackageOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/shop" className="text-sm text-primary hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <div key={order.id} className="border border-border/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Order #{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{order.orderStatus}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" • "}
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
                <p className="text-sm font-medium text-foreground">₹{order.total.toLocaleString("en-IN")} • Cash on Delivery</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground py-3 rounded-full font-medium boty-transition hover:bg-muted"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
        {confirmingDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-destructive text-destructive-foreground py-3 rounded-full font-medium boty-transition hover:bg-destructive/90"
          >
            <Trash2 className="w-4 h-4" />
            Confirm Delete Account
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 text-destructive py-3 rounded-full font-medium boty-transition hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </button>
        )}
      </div>
    </div>
  )
}
