'use client'
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

export interface CartItem {
  id: string; slug: string; name: string; brand: string
  price: number; img: string; quantity: number
}
interface CartCtx {
  items: CartItem[]; count: number; total: number
  addItem: (item: Omit<CartItem,'quantity'>) => void
  removeItem: (id: string) => void
  updateQty: (id: string, qty: number) => void
  clearCart: () => void
}
const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) setItems(JSON.parse(saved))
    } catch {}
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) localStorage.setItem('cart', JSON.stringify(items))
  }, [items, mounted])

  const count = items.reduce((s,i) => s + i.quantity, 0)
  const total = items.reduce((s,i) => s + i.price * i.quantity, 0)

  const addItem = useCallback((item: Omit<CartItem,'quantity'>) => {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id)
      if (exists) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity+1 } : i)
      return [...prev, { ...item, quantity: 1 }]
    })
  }, [])
  const removeItem = useCallback((id: string) => setItems(p => p.filter(i => i.id !== id)), [])
  const updateQty  = useCallback((id: string, qty: number) => {
    if (qty < 1) return removeItem(id)
    setItems(p => p.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }, [removeItem])
  const clearCart  = useCallback(() => setItems([]), [])

  return <Ctx.Provider value={{ items, count, total, addItem, removeItem, updateQty, clearCart }}>{children}</Ctx.Provider>
}
export const useCart = () => { const c = useContext(Ctx); if (!c) throw new Error('useCart outside CartProvider'); return c }
