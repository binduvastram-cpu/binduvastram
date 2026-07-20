"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { SAREE_FAMILIES, buildTaxonomyIndex, slugify, type CollectionFamily } from "@/lib/saree-collections"

const STORAGE_KEY = "bindu-vastram-collections"
const SEED_VERSION_KEY = "bindu-vastram-collections-seed-version"
const SEED_VERSION = "1"

type Families = Record<string, CollectionFamily>

function cloneDefaults(): Families {
  return JSON.parse(JSON.stringify(SAREE_FAMILIES))
}

interface CollectionsContextType {
  families: Families
  hydrated: boolean
  collectionLabel: (slug: string) => string
  ancestorsOf: (slug: string) => string[]
  familyOf: (slug: string) => string | undefined
  allCollectionSlugs: () => string[]
  addFamily: (label: string) => string
  addItem: (familySlug: string, groupSlug: string | null, label: string) => string
  deleteItem: (slug: string) => void
  deleteFamily: (familySlug: string) => void
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined)

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [families, setFamilies] = useState<Families>(cloneDefaults())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY)
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored && storedVersion === SEED_VERSION) {
        setFamilies(JSON.parse(stored))
      } else {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cloneDefaults()))
        window.localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION)
      }
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (next: Families) => {
    setFamilies(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const index = useMemo(() => buildTaxonomyIndex(families), [families])

  const addFamily = (label: string): string => {
    const slug = slugify(label)
    if (families[slug]) return slug
    persist({ ...families, [slug]: { label, items: [] } })
    return slug
  }

  const addItem = (familySlug: string, groupSlug: string | null, label: string): string => {
    const leafSlug = slugify(label)
    const family = families[familySlug]
    if (!family) return leafSlug

    if (groupSlug && family.groups?.[groupSlug]) {
      const group = family.groups[groupSlug]
      if (group.items.includes(label)) return leafSlug
      persist({
        ...families,
        [familySlug]: {
          ...family,
          groups: { ...family.groups, [groupSlug]: { ...group, items: [...group.items, label] } },
        },
      })
    } else {
      const items = family.items ?? []
      if (items.includes(label)) return leafSlug
      persist({ ...families, [familySlug]: { ...family, items: [...items, label] } })
    }
    return leafSlug
  }

  const deleteItem = (slug: string) => {
    const node = index.nodesBySlug[slug]
    if (!node || node.slug === node.family) return // don't delete a whole family via this path
    const family = families[node.family]
    if (!family) return

    if (node.group && family.groups?.[node.group]) {
      const group = family.groups[node.group]
      persist({
        ...families,
        [node.family]: {
          ...family,
          groups: {
            ...family.groups,
            [node.group]: { ...group, items: group.items.filter((item) => slugify(item) !== slug) },
          },
        },
      })
    } else if (family.items) {
      persist({ ...families, [node.family]: { ...family, items: family.items.filter((item) => slugify(item) !== slug) } })
    }
  }

  const deleteFamily = (familySlug: string) => {
    const next = { ...families }
    delete next[familySlug]
    persist(next)
  }

  return (
    <CollectionsContext.Provider
      value={{
        families,
        hydrated,
        collectionLabel: index.collectionLabel,
        ancestorsOf: index.ancestorsOf,
        familyOf: index.familyOf,
        allCollectionSlugs: index.allSlugs,
        addFamily,
        addItem,
        deleteItem,
        deleteFamily,
      }}
    >
      {children}
    </CollectionsContext.Provider>
  )
}

export function useCollections() {
  const context = useContext(CollectionsContext)
  if (context === undefined) {
    throw new Error("useCollections must be used within a CollectionsProvider")
  }
  return context
}
