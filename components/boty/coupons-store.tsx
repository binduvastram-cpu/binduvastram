"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Coupon } from "@/lib/types"

const SELECT = `
  id, code, discount_percent, scope, start_date, end_date, is_active, created_at,
  product_id,
  categories ( value )
`

type CouponRow = {
  id: string
  code: string
  discount_percent: number
  scope: "all" | "category" | "product"
  start_date: string | null
  end_date: string
  is_active: boolean
  created_at: string
  product_id: string | null
  categories: { value: string } | null
}

function rowToCoupon(row: CouponRow): Coupon {
  return {
    id: row.id,
    code: row.code,
    discountPercent: Number(row.discount_percent),
    scope: row.scope,
    targetId: row.scope === "product" ? row.product_id ?? undefined : row.scope === "category" ? row.categories?.value : undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date,
    isActive: row.is_active,
    createdAt: row.created_at,
  }
}

export interface CouponValidationResult {
  valid: boolean
  discountPercent: number
  scope: "all" | "category" | "product" | null
  categoryValue: string | null
  productId: string | null
  message: string
}

interface CouponsContextType {
  coupons: Coupon[]
  hydrated: boolean
  addCoupon: (coupon: Omit<Coupon, "id" | "createdAt">) => Promise<void>
  updateCoupon: (coupon: Coupon) => Promise<void>
  deleteCoupon: (id: string) => Promise<void>
  validateCoupon: (code: string) => Promise<CouponValidationResult>
}

const CouponsContext = createContext<CouponsContextType | undefined>(undefined)

export function CouponsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("coupons").select(SELECT).order("created_at", { ascending: false })
    setCoupons(((data as unknown as CouponRow[]) ?? []).map(rowToCoupon))
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const categoryIdFor = async (value: string) => {
    const { data } = await supabase.from("categories").select("id").eq("value", value).single()
    return data?.id as string | undefined
  }

  const addCoupon = async (coupon: Omit<Coupon, "id" | "createdAt">) => {
    const categoryId = coupon.scope === "category" && coupon.targetId ? await categoryIdFor(coupon.targetId) : null
    await supabase.from("coupons").insert({
      code: coupon.code.toUpperCase(),
      discount_percent: coupon.discountPercent,
      scope: coupon.scope,
      product_id: coupon.scope === "product" ? coupon.targetId : null,
      category_id: coupon.scope === "category" ? categoryId : null,
      start_date: coupon.startDate ?? null,
      end_date: coupon.endDate,
      is_active: coupon.isActive,
    })
    await fetchAll()
  }

  const updateCoupon = async (updated: Coupon) => {
    const categoryId = updated.scope === "category" && updated.targetId ? await categoryIdFor(updated.targetId) : null
    await supabase
      .from("coupons")
      .update({
        code: updated.code.toUpperCase(),
        discount_percent: updated.discountPercent,
        scope: updated.scope,
        product_id: updated.scope === "product" ? updated.targetId : null,
        category_id: updated.scope === "category" ? categoryId : null,
        start_date: updated.startDate ?? null,
        end_date: updated.endDate,
        is_active: updated.isActive,
      })
      .eq("id", updated.id)
    await fetchAll()
  }

  const deleteCoupon = async (id: string) => {
    await supabase.from("coupons").delete().eq("id", id)
    setCoupons((current) => current.filter((c) => c.id !== id))
  }

  const validateCoupon = async (code: string): Promise<CouponValidationResult> => {
    const { data, error } = await supabase.rpc("validate_coupon", { p_code: code })
    const row = data?.[0]
    if (error || !row) {
      return { valid: false, discountPercent: 0, scope: null, categoryValue: null, productId: null, message: "Could not validate this code" }
    }
    return {
      valid: row.valid,
      discountPercent: Number(row.discount_percent ?? 0),
      scope: (row.scope as CouponValidationResult["scope"]) ?? null,
      categoryValue: row.category_value,
      productId: row.product_id,
      message: row.message,
    }
  }

  return (
    <CouponsContext.Provider value={{ coupons, hydrated, addCoupon, updateCoupon, deleteCoupon, validateCoupon }}>
      {children}
    </CouponsContext.Provider>
  )
}

export function useCoupons() {
  const context = useContext(CouponsContext)
  if (context === undefined) {
    throw new Error("useCoupons must be used within a CouponsProvider")
  }
  return context
}
