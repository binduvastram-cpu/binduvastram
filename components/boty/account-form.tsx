"use client"

import { useState, type FormEvent } from "react"
import type { AccountProfile } from "./account-context"

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

const emptyForm: AccountProfile = { name: "", phone: "", address: "", pincode: "" }

export function AccountDetailsForm({
  onSubmit,
  submitLabel = "Create Account",
  initial,
}: {
  onSubmit: (profile: AccountProfile) => void
  submitLabel?: string
  initial?: Partial<AccountProfile>
}) {
  const [form, setForm] = useState<AccountProfile>({ ...emptyForm, ...initial })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ProfileField label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="Your name" required />
      <ProfileField label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="10-digit mobile number" type="tel" required />
      <ProfileField label="Delivery Address" value={form.address} onChange={(v) => setForm({ ...form, address: v })} placeholder="House no, street, area, city" textarea required />
      <ProfileField label="Pincode" value={form.pincode} onChange={(v) => setForm({ ...form, pincode: v })} placeholder="6-digit pincode" required />

      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground py-4 rounded-full font-medium boty-transition hover:bg-primary/90"
      >
        {submitLabel}
      </button>
    </form>
  )
}
