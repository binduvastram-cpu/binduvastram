"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { User, PackageOpen, LogOut, Trash2, Pencil } from "lucide-react"
import { useAccount, type AccountProfile, type AccountAddress } from "@/components/boty/account-context"
import { useOrders } from "@/components/boty/orders-store"
import { useCancellationRequests } from "@/components/boty/cancellation-requests-store"
import { ProfileField, SignUpForm, LogInForm, AddressForm } from "@/components/boty/account-form"
import { formatPrice } from "@/lib/format"

const NON_CANCELLABLE_STATUSES = new Set(["Delivered", "Cancelled"])

export default function AccountPage() {
  const { profile, address, isLoggedIn, hydrated, signUp, logInWithPhone, logout, updateProfile, saveAddress, deleteAccount } = useAccount()

  if (!hydrated) {
    return (
      <main className="min-h-screen">
        <div className="pt-28 lg:pt-36 pb-20" />
      </main>
    )
  }

  return (
    <main className="min-h-screen">
      <div className="pt-28 lg:pt-36 pb-20">
        <div className="max-w-xl mx-auto px-6 lg:px-8">
          {!isLoggedIn ? (
            <AuthCard onSignUp={signUp} onLogIn={logInWithPhone} />
          ) : (
            <AccountDashboard
              profile={profile!}
              address={address}
              onSaveProfile={updateProfile}
              onSaveAddress={saveAddress}
              onLogout={logout}
              onDelete={deleteAccount}
            />
          )}
        </div>
      </div>
    </main>
  )
}

function AuthCard({
  onSignUp,
  onLogIn,
}: {
  onSignUp: (input: { email: string; password: string; name: string; phone: string; address: AccountAddress }) => Promise<string | null>
  onLogIn: (input: { phone: string; password: string }) => Promise<string | null>
}) {
  const [mode, setMode] = useState<"login" | "signup">("signup")

  return (
    <div className="bg-card rounded-3xl boty-shadow p-8">
      <div className="flex flex-col items-center text-center mb-8">
        <div className="w-14 h-14 rounded-full bg-background flex items-center justify-center mb-4">
          <User className="w-6 h-6 text-primary" />
        </div>
        <h1 className="font-serif text-3xl text-foreground mb-2">
          {mode === "login" ? "Welcome Back" : "Create Your Account"}
        </h1>
        <p className="text-sm text-muted-foreground max-w-sm">
          {mode === "login"
            ? "Log in to view your profile and order history."
            : "Save your details once — the next time you visit, you can go straight to checkout."}
        </p>
      </div>

      {mode === "login" ? <LogInForm onSubmit={onLogIn} /> : <SignUpForm onSubmit={onSignUp} />}

      <button
        type="button"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
        className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground text-center boty-transition"
      >
        {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
      </button>
    </div>
  )
}

function AccountDashboard({
  profile,
  address,
  onSaveProfile,
  onSaveAddress,
  onLogout,
  onDelete,
}: {
  profile: AccountProfile
  address: AccountAddress | null
  onSaveProfile: (input: { name: string; phone: string }) => Promise<void>
  onSaveAddress: (address: AccountAddress) => Promise<void>
  onLogout: () => Promise<void>
  onDelete: () => Promise<void>
}) {
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(!address)
  const [form, setForm] = useState({ name: profile.name, phone: profile.phone })
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const { orders } = useOrders()
  const { requests, requestCancellation } = useCancellationRequests()
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null)
  const [cancelReason, setCancelReason] = useState("")

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault()
    await onSaveProfile(form)
    setIsEditingProfile(false)
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
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          {!isEditingProfile && (
            <button
              type="button"
              onClick={() => {
                setForm({ name: profile.name, phone: profile.phone })
                setIsEditingProfile(true)
              }}
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <ProfileField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
            <ProfileField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} type="tel" required />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-primary text-primary-foreground py-3 rounded-full font-medium boty-transition hover:bg-primary/90">
                Save
              </button>
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="flex-1 border border-border text-foreground py-3 rounded-full font-medium boty-transition hover:bg-muted"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="text-foreground">{profile.phone || "—"}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card rounded-3xl boty-shadow p-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-foreground">Delivery Address</h2>
          {address && !isEditingAddress && (
            <button type="button" onClick={() => setIsEditingAddress(true)} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
        {isEditingAddress ? (
          <AddressForm
            initial={address ?? undefined}
            onSubmit={async (a) => {
              await onSaveAddress(a)
              setIsEditingAddress(false)
            }}
          />
        ) : (
          <div className="text-sm text-foreground">
            <p>{address!.line1}</p>
            {address!.line2 && <p>{address!.line2}</p>}
            <p>{address!.city}, {address!.state} - {address!.pincode}</p>
          </div>
        )}
      </div>

      <div className="bg-card rounded-3xl boty-shadow p-8">
        <h2 className="font-serif text-xl text-foreground mb-4">Order History</h2>
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <PackageOpen className="w-10 h-10 text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Link href="/shop" className="text-sm text-primary hover:underline">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="border border-border/50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Order #{order.orderCode}</span>
                  <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary">{order.orderStatus}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  {" • "}
                  {order.items.length} {order.items.length === 1 ? "item" : "items"}
                </p>
                <p className="text-sm font-medium text-foreground">{formatPrice(order.total)} • Cash on Delivery</p>

                {(() => {
                  const existingRequest = requests.find((r) => r.orderId === order.id)
                  if (existingRequest) {
                    return (
                      <p className="text-xs text-muted-foreground mt-3">
                        Cancellation request: <span className="font-medium">{existingRequest.status}</span>
                      </p>
                    )
                  }
                  if (NON_CANCELLABLE_STATUSES.has(order.orderStatus)) return null
                  if (cancelingOrderId === order.id) {
                    return (
                      <div className="mt-3 space-y-2">
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Reason (optional)"
                          rows={2}
                          className="w-full bg-background border border-border/50 rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 boty-transition resize-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={async () => {
                              await requestCancellation(order.id, cancelReason)
                              setCancelingOrderId(null)
                              setCancelReason("")
                            }}
                            className="flex-1 bg-destructive text-destructive-foreground py-2 rounded-full text-xs font-medium boty-transition hover:bg-destructive/90"
                          >
                            Submit Cancellation Request
                          </button>
                          <button
                            type="button"
                            onClick={() => setCancelingOrderId(null)}
                            className="flex-1 border border-border text-foreground py-2 rounded-full text-xs font-medium boty-transition hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => setCancelingOrderId(order.id)}
                      className="text-xs text-destructive hover:underline mt-3"
                    >
                      Request Cancellation
                    </button>
                  )
                })()}
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
