"use client"

import { useState, type FormEvent } from "react"
import type { AccountAddress } from "./account-context"

export function ProfileField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  textarea,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  textarea?: boolean
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground mb-2 block">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          rows={3}
          className="w-full bg-background border border-border/50 rounded-2xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 boty-transition resize-none"
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="w-full bg-background border border-border/50 rounded-full px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 boty-transition"
        />
      )}
    </div>
  )
}

const emptyAddress: AccountAddress = { line1: "", line2: "", city: "", pincode: "", state: "" }

export function SignUpForm({
  onSubmit,
  submitLabel = "Create Account",
}: {
  onSubmit: (input: {
    email: string
    password: string
    name: string
    phone: string
    address: AccountAddress
  }) => Promise<string | null>
  submitLabel?: string
}) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "" })
  const [address, setAddress] = useState<AccountAddress>(emptyAddress)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await onSubmit({ ...form, address })
    setSubmitting(false)
    if (result) setError(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProfileField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" required />
      <ProfileField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="10-digit mobile number" type="tel" required />
      <ProfileField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="you@example.com" type="email" required />
      <ProfileField label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} placeholder="At least 6 characters" type="password" required />

      <div className="pt-2 border-t border-border/50">
        <p className="text-sm font-medium text-foreground mb-3 mt-4">Delivery Address</p>
        <div className="space-y-4">
          <ProfileField label="Colony / Street" value={address.line1} onChange={(v) => setAddress({ ...address, line1: v })} placeholder="House no, street, colony" textarea required />
          <ProfileField label="Landmark" value={address.line2} onChange={(v) => setAddress({ ...address, line2: v })} placeholder="Nearby landmark" />
          <ProfileField label="District / City" value={address.city} onChange={(v) => setAddress({ ...address, city: v })} placeholder="District or city" required />
          <div className="grid grid-cols-2 gap-4">
            <ProfileField label="State" value={address.state} onChange={(v) => setAddress({ ...address, state: v })} placeholder="State" required />
            <ProfileField label="Pincode" value={address.pincode} onChange={(v) => setAddress({ ...address, pincode: v })} placeholder="6-digit pincode" required />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? "Creating account..." : submitLabel}
      </button>
    </form>
  )
}

export function LogInForm({
  onSubmit,
  submitLabel = "Log In",
}: {
  onSubmit: (input: { phone: string; password: string }) => Promise<string | null>
  submitLabel?: string
}) {
  const [form, setForm] = useState({ phone: "", password: "" })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const result = await onSubmit(form)
    setSubmitting(false)
    if (result) setError(result)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProfileField label="Mobile Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="10-digit mobile number" type="tel" required />
      <ProfileField label="Password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} type="password" required />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90 disabled:opacity-60"
      >
        {submitting ? "Logging in..." : submitLabel}
      </button>
    </form>
  )
}

export function AddressForm({
  onSubmit,
  submitLabel = "Save Address",
  initial,
}: {
  onSubmit: (address: AccountAddress) => void
  submitLabel?: string
  initial?: Partial<AccountAddress>
}) {
  const [form, setForm] = useState<AccountAddress>({ ...emptyAddress, ...initial })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProfileField label="Colony / Street" value={form.line1} onChange={(v) => setForm({ ...form, line1: v })} placeholder="House no, street, colony" textarea required />
      <ProfileField label="Landmark" value={form.line2} onChange={(v) => setForm({ ...form, line2: v })} placeholder="Nearby landmark" />
      <ProfileField label="District / City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="District or city" required />
      <div className="grid grid-cols-2 gap-4">
        <ProfileField label="State" value={form.state} onChange={(v) => setForm({ ...form, state: v })} placeholder="State" required />
        <ProfileField label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} placeholder="6-digit pincode" required />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90"
      >
        {submitLabel}
      </button>
    </form>
  )
}
