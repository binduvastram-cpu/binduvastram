"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"

export type AttributeKind = "fabric" | "work" | "color" | "occasion" | "material" | "size"

export const ATTRIBUTE_KINDS: { kind: AttributeKind; label: string }[] = [
  { kind: "fabric", label: "Fabric" },
  { kind: "work", label: "Work" },
  { kind: "color", label: "Color" },
  { kind: "occasion", label: "Occasion" },
  { kind: "material", label: "Material (bags)" },
  { kind: "size", label: "Size" },
]

type Attributes = Record<AttributeKind, string[]>

function emptyAttributes(): Attributes {
  return { fabric: [], work: [], color: [], occasion: [], material: [], size: [] }
}

interface AttributesContextType {
  attributes: Attributes
  hydrated: boolean
  addValue: (kind: AttributeKind, value: string) => Promise<void>
  renameValue: (kind: AttributeKind, oldValue: string, newValue: string) => Promise<void>
  deleteValue: (kind: AttributeKind, value: string) => Promise<void>
}

const AttributesContext = createContext<AttributesContextType | undefined>(undefined)

export function AttributesProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [attributes, setAttributes] = useState<Attributes>(emptyAttributes())
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const { data } = await supabase.from("attributes").select("kind, value").order("value")
    const next = emptyAttributes()
    for (const row of data ?? []) {
      next[row.kind as AttributeKind].push(row.value)
    }
    setAttributes(next)
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addValue = async (kind: AttributeKind, value: string) => {
    if (attributes[kind].includes(value)) return
    await supabase.from("attributes").insert({ kind, value })
    await fetchAll()
  }

  const renameValue = async (kind: AttributeKind, oldValue: string, newValue: string) => {
    if (oldValue === newValue || attributes[kind].includes(newValue)) return
    await supabase.from("attributes").update({ value: newValue }).eq("kind", kind).eq("value", oldValue)
    await fetchAll()
  }

  const deleteValue = async (kind: AttributeKind, value: string) => {
    await supabase.from("attributes").delete().eq("kind", kind).eq("value", value)
    await fetchAll()
  }

  return (
    <AttributesContext.Provider value={{ attributes, hydrated, addValue, renameValue, deleteValue }}>
      {children}
    </AttributesContext.Provider>
  )
}

export function useAttributes() {
  const context = useContext(AttributesContext)
  if (context === undefined) {
    throw new Error("useAttributes must be used within an AttributesProvider")
  }
  return context
}
