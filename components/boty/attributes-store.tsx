"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

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

const STORAGE_KEY = "bindu-vastram-attributes"
const SEED_VERSION_KEY = "bindu-vastram-attributes-seed-version"
const SEED_VERSION = "1"

// Seeded from every distinct value already used across the seed catalog, so
// the dropdowns aren't empty on first load — admin can add/rename/remove
// freely from /admin/attributes from here on.
const DEFAULT_ATTRIBUTES: Attributes = {
  fabric: [
    "Pure Silk", "Kanjivaram Silk", "Handloom Cotton Silk", "Silk", "Banarasi Silk", "Chiffon",
    "Georgette", "Satin Georgette", "Silk Blend", "Raw Silk", "Jacquard", "Cotton", "Cotton Silk",
  ],
  work: [
    "Zari Weaving", "Temple Border Zari", "Zari Border", "Woven Zari", "Lace Border", "Embroidery",
    "Sequin Embroidery", "Embroidered Yoke", "Hand Embroidery", "Kundan & Pearl", "Temple Jewellery",
    "Stone Embellishment", "Thread Embroidery", "Block Print",
  ],
  color: [
    "Royal Blue", "Magenta & Gold", "Cream & Gold", "Magenta", "Red & Pink", "Maroon", "Yellow & Red",
    "Green", "Green & Gold", "Red & Multicolour", "Emerald Green", "Wine Red", "Gold", "Cream",
    "Off-White", "Black", "Teal", "Indigo",
  ],
  occasion: [
    "Wedding & Festive", "Wedding", "Festive", "Daywear", "Party & Reception", "Wedding & Religious",
    "Festive & Wedding", "Party & Festive", "Festive & Daily Wear",
  ],
  material: ["Silk Brocade", "Satin"],
  size: ["S", "M", "L", "XL", "XXL", "32", "34", "36", "38", "40"],
}

function cloneDefaults(): Attributes {
  return JSON.parse(JSON.stringify(DEFAULT_ATTRIBUTES))
}

interface AttributesContextType {
  attributes: Attributes
  hydrated: boolean
  addValue: (kind: AttributeKind, value: string) => void
  renameValue: (kind: AttributeKind, oldValue: string, newValue: string) => void
  deleteValue: (kind: AttributeKind, value: string) => void
}

const AttributesContext = createContext<AttributesContextType | undefined>(undefined)

export function AttributesProvider({ children }: { children: ReactNode }) {
  const [attributes, setAttributes] = useState<Attributes>(cloneDefaults())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY)
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && storedVersion === SEED_VERSION) {
        setAttributes(JSON.parse(stored))
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneDefaults()))
        window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
      }
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Attributes) => {
    setAttributes(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addValue = (kind: AttributeKind, value: string) => {
    if (attributes[kind].includes(value)) return
    persist({ ...attributes, [kind]: [...attributes[kind], value] })
  }

  const renameValue = (kind: AttributeKind, oldValue: string, newValue: string) => {
    if (oldValue === newValue || attributes[kind].includes(newValue)) return
    persist({ ...attributes, [kind]: attributes[kind].map((v) => (v === oldValue ? newValue : v)) })
  }

  const deleteValue = (kind: AttributeKind, value: string) => {
    persist({ ...attributes, [kind]: attributes[kind].filter((v) => v !== value) })
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
