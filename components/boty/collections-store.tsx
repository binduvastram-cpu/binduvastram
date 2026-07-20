"use client"

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { buildTaxonomyIndex, slugify, type CollectionFamily } from "@/lib/saree-collections"

type Families = Record<string, CollectionFamily>

interface CollectionsContextType {
  families: Families
  hydrated: boolean
  collectionLabel: (slug: string) => string
  ancestorsOf: (slug: string) => string[]
  familyOf: (slug: string) => string | undefined
  allCollectionSlugs: () => string[]
  addFamily: (label: string) => Promise<string>
  addItem: (familySlug: string, groupSlug: string | null, label: string) => Promise<string>
  deleteItem: (slug: string) => Promise<void>
  deleteFamily: (familySlug: string) => Promise<void>
}

const CollectionsContext = createContext<CollectionsContextType | undefined>(undefined)

export function CollectionsProvider({ children }: { children: ReactNode }) {
  const [supabase] = useState(() => createClient())
  const [families, setFamilies] = useState<Families>({})
  const [hydrated, setHydrated] = useState(false)

  const fetchAll = async () => {
    const [{ data: familyRows }, { data: groupRows }, { data: itemRows }] = await Promise.all([
      supabase.from("collection_families").select("id, slug, label"),
      supabase.from("collection_groups").select("id, slug, label, family_id"),
      supabase.from("collection_items").select("slug, label, family_id, group_id"),
    ])

    const tree: Families = {}
    for (const f of familyRows ?? []) tree[f.slug] = { label: f.label }

    const familyById = new Map((familyRows ?? []).map((f) => [f.id, f]))
    const groupById = new Map((groupRows ?? []).map((g) => [g.id, g]))

    for (const g of groupRows ?? []) {
      const family = familyById.get(g.family_id)
      if (!family) continue
      const node = tree[family.slug]
      node.groups = node.groups ?? {}
      node.groups[g.slug] = { label: g.label, items: [] }
    }

    for (const it of itemRows ?? []) {
      const family = familyById.get(it.family_id)
      if (!family) continue
      const node = tree[family.slug]
      if (it.group_id) {
        const group = groupById.get(it.group_id)
        if (group && node.groups?.[group.slug]) node.groups[group.slug].items.push(it.label)
      } else {
        node.items = node.items ?? []
        node.items.push(it.label)
      }
    }

    setFamilies(tree)
  }

  useEffect(() => {
    fetchAll().then(() => setHydrated(true))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const index = useMemo(() => buildTaxonomyIndex(families), [families])

  const addFamily = async (label: string): Promise<string> => {
    const slug = slugify(label)
    if (families[slug]) return slug
    await supabase.from("collection_families").insert({ slug, label })
    await fetchAll()
    return slug
  }

  const addItem = async (familySlug: string, groupSlug: string | null, label: string): Promise<string> => {
    const leafSlug = slugify(label)
    const { data: family } = await supabase.from("collection_families").select("id").eq("slug", familySlug).single()
    if (!family) return leafSlug

    let groupId: string | null = null
    if (groupSlug) {
      const { data: group } = await supabase.from("collection_groups").select("id").eq("slug", groupSlug).maybeSingle()
      groupId = group?.id ?? null
    }

    await supabase.from("collection_items").insert({ family_id: family.id, group_id: groupId, slug: leafSlug, label })
    await fetchAll()
    return leafSlug
  }

  const deleteItem = async (slug: string) => {
    await supabase.from("collection_items").delete().eq("slug", slug)
    await fetchAll()
  }

  const deleteFamily = async (familySlug: string) => {
    await supabase.from("collection_families").delete().eq("slug", familySlug)
    await fetchAll()
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
