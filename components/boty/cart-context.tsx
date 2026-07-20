"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

const STORAGE_KEY = "bindu-vastram-cart"

export interface CartItem {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  image: string
}

interface CartContextType {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity">) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  itemCount: number
  subtotal: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Guest-first: the cart lives in localStorage so it survives a refresh
  // without requiring an account. Once logged in, it's also pushed to
  // Supabase (see account-context.tsx's sign-in handler) so it isn't lost.
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored) setItems(JSON.parse(stored))
    } catch {
      // ignore malformed localStorage content
    }
  }, [])

  const persist = (next: CartItem[]) => {
    setItems(next)
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  const addItem = (newItem: Omit<CartItem, "quantity">) => {
    const existingItem = items.find((item) => item.id === newItem.id)
    persist(
      existingItem
        ? items.map((item) => (item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item))
        : [...items, { ...newItem, quantity: 1 }]
    )
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    persist(items.filter((item) => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id)
      return
    }
    persist(items.map((item) => (item.id === id ? { ...item, quantity } : item)))
  }

  const clearCart = () => {
    persist([])
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isOpen,
        setIsOpen,
        itemCount,
        subtotal
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
