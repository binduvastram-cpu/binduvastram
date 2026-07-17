const GUEST_ID_KEY = "bv-guest-id"

// A short id persisted per-device so an unauthenticated reviewer still gets
// a stable, distinguishable label ("Guest 4F2A") instead of every anonymous
// review looking identical.
export function getGuestId(): string {
  const existing = window.localStorage.getItem(GUEST_ID_KEY)
  if (existing) return existing
  const id = Math.random().toString(36).slice(2, 6).toUpperCase()
  window.localStorage.setItem(GUEST_ID_KEY, id)
  return id
}
