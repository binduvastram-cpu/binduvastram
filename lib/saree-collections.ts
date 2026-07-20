// Encodes the client's saree fabric/collection nav taxonomy (see info.md).
// SILK is the only family with a middle "group" level (Kanjivaram Silk /
// Banaras / Other Silks) — everything else is a flat family -> leaf list.
// LINENS has no sub-items at all (it's a single leaf/link in the nav).
//
// This module exports the DEFAULT/seed taxonomy plus a pure `buildTaxonomyIndex`
// factory. The admin-editable version (components/boty/collections-store.tsx)
// runs the same factory over its own live `families` state, so both the static
// seed data and anything an admin adds later share identical slug/ancestor logic.

export function slugify(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export interface CollectionGroup {
  label: string
  items: string[]
}

export interface CollectionFamily {
  label: string
  groups?: Record<string, CollectionGroup>
  items?: string[]
}

export const SAREE_FAMILIES: Record<string, CollectionFamily> = {
  silk: {
    label: "Silk",
    groups: {
      "kanjivaram-silk": {
        label: "Kanjivaram Silk",
        items: ["Festive Kanjivarams", "Subham Collection", "Maharani Collection", "Soft Silk"],
      },
      banaras: {
        label: "Banaras",
        items: ["Banaras Silks", "Banarasi Raw Silks", "Tissue Paithani Sarees", "Chiniya Silks", "Semi Banarasi Sarees"],
      },
      "other-silks": {
        label: "Other Silks",
        items: ["Venkatagiri", "Gadwal Silk", "Katan Silks", "Mangalgiri", "Mysore Silks", "Art Silk"],
      },
    },
  },
  cotton: {
    label: "Cotton",
    items: [
      "Chettinad Cottons", "Khadi Cotton", "Narayanpet Cotton", "Bengal Cottons",
      "Kanchi Cotton", "Jaipur Cotton", "Chanderi Cotton", "Munga Cotton",
    ],
  },
  "silk-cotton": {
    label: "Silk Cotton",
    items: [
      "Raagam - Silk Cottons", "Kanchi Silk Cotton", "Ikat Silk Cotton", "Kuppadam Silk Cotton",
      "Mangalgiri Silk Cotton", "Kora Silk Cotton", "Silk Cotton",
    ],
  },
  tussars: {
    label: "Tussars",
    items: [
      "Pure Tussars", "Semi Tussars", "Munga Tussars", "Madhubani Tussars",
      "Tussar with Floral Prints", "Tussar Embroidery Sarees", "Tussar with Classic Designs", "Contemporary Style Tussars",
    ],
  },
  linens: {
    label: "Linens",
  },
  fancy: {
    label: "Fancy",
    items: [
      "Organza Sarees", "Semi Raw Silks", "Semi Soft Silk", "Modal Silks",
      "Bamboo Silks", "Kota Sarees", "Jute Sarees", "Dola Silk", "Ikat Silk",
    ],
  },
}

export interface CollectionNode {
  slug: string
  label: string
  family: string
  group?: string
  /** [leaf, group?, family] — the slug itself plus every ancestor, used for filter matching. */
  ancestors: string[]
}

export interface TaxonomyIndex {
  nodesBySlug: Record<string, CollectionNode>
  collectionLabel: (slug: string) => string
  ancestorsOf: (slug: string) => string[]
  familyOf: (slug: string) => string | undefined
  allSlugs: () => string[]
}

/** Pure function over a families map — used both for the static seed data
 * below and for the admin-editable live data in collections-store.tsx. */
export function buildTaxonomyIndex(families: Record<string, CollectionFamily>): TaxonomyIndex {
  const nodesBySlug: Record<string, CollectionNode> = {}

  for (const [familySlug, family] of Object.entries(families)) {
    nodesBySlug[familySlug] = { slug: familySlug, label: family.label, family: familySlug, ancestors: [familySlug] }

    if (family.groups) {
      for (const [groupSlug, group] of Object.entries(family.groups)) {
        nodesBySlug[groupSlug] = {
          slug: groupSlug,
          label: group.label,
          family: familySlug,
          group: groupSlug,
          ancestors: [groupSlug, familySlug],
        }
        for (const item of group.items) {
          const leafSlug = slugify(item)
          nodesBySlug[leafSlug] = {
            slug: leafSlug,
            label: item,
            family: familySlug,
            group: groupSlug,
            ancestors: [leafSlug, groupSlug, familySlug],
          }
        }
      }
    }

    if (family.items) {
      for (const item of family.items) {
        const leafSlug = slugify(item)
        nodesBySlug[leafSlug] = {
          slug: leafSlug,
          label: item,
          family: familySlug,
          ancestors: [leafSlug, familySlug],
        }
      }
    }
  }

  return {
    nodesBySlug,
    collectionLabel: (slug: string) => nodesBySlug[slug]?.label ?? slug,
    ancestorsOf: (slug: string) => nodesBySlug[slug]?.ancestors ?? [slug],
    familyOf: (slug: string) => nodesBySlug[slug]?.family,
    allSlugs: () => Object.keys(nodesBySlug),
  }
}

const DEFAULT_INDEX = buildTaxonomyIndex(SAREE_FAMILIES)

export function collectionLabel(slug: string): string {
  return DEFAULT_INDEX.collectionLabel(slug)
}

/** The slug itself plus every ancestor slug up to its family — used to match
 * a product's single stored `collection` value against a broader nav link
 * (e.g. a product tagged "festive-kanjivarams" also matches "kanjivaram-silk"
 * and "silk"). Unknown slugs just return themselves. */
export function ancestorsOf(slug: string): string[] {
  return DEFAULT_INDEX.ancestorsOf(slug)
}

export function familyOf(slug: string): string | undefined {
  return DEFAULT_INDEX.familyOf(slug)
}

export function allCollectionSlugs(): string[] {
  return DEFAULT_INDEX.allSlugs()
}
