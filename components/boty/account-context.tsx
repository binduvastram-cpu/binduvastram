"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useCustomers } from "./customers-store"

const STORAGE_KEY = "bindu-vastram-account"

export interface AccountProfile {
  name: string
  phone: string
  address: string
  pincode: string
}

interface StoredAccount {
  profile: AccountProfile
  isLoggedIn: boolean
}

interface AccountContextType {
  profile: AccountProfile | null
  isLoggedIn: boolean
  hydrated: boolean
  createAccount: (profile: AccountProfile) => void
  updateProfile: (profile: AccountProfile) => void
  login: () => void
  logout: () => void
  deleteAccount: () => void
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AccountProfile | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const { upsertCustomer } = useCustomers()

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed: StoredAccount = JSON.parse(stored)
        setProfile(parsed.profile)
        setIsLoggedIn(parsed.isLoggedIn)
      }
    } catch {
      // ignore malformed localStorage content
    }
    setHydrated(true)
  }, [])

  const persist = (nextProfile: AccountProfile | null, nextIsLoggedIn: boolean) => {
    if (nextProfile) {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ profile: nextProfile, isLoggedIn: nextIsLoggedIn })
      )
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  }

  const createAccount = (newProfile: AccountProfile) => {
    setProfile(newProfile)
    setIsLoggedIn(true)
    persist(newProfile, true)
    upsertCustomer(newProfile)
  }

  const updateProfile = (updated: AccountProfile) => {
    setProfile(updated)
    persist(updated, isLoggedIn)
    upsertCustomer(updated)
  }

  const login = () => {
    setIsLoggedIn(true)
    if (profile) persist(profile, true)
  }

  const logout = () => {
    setIsLoggedIn(false)
    if (profile) persist(profile, false)
  }

  const deleteAccount = () => {
    setProfile(null)
    setIsLoggedIn(false)
    persist(null, false)
  }

  return (
    <AccountContext.Provider
      value={{ profile, isLoggedIn, hydrated, createAccount, updateProfile, login, logout, deleteAccount }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}
