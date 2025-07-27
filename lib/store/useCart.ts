import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Product {
  id: string
  name: string
  price: number
  image_url?: string
}

interface CartItem extends Product {
  quantity: number
}

interface CartState {
  items: CartItem[]
  addToCart: (product: Product, quantity: number) => void
  increase: (id: string) => void
  decrease: (id: string) => void
  removeFromCart: (id: string) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addToCart: (product, quantity) => {
        const items = get().items
        const existing = items.find((item) => item.id === product.id)
        if (existing) {
          set({
            items: items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          })
        } else {
          set({ items: [...items, { ...product, quantity }] })
        }
      },
      increase: (id) =>
        set({
          items: get().items.map((item) =>
            item.id === id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        }),
      decrease: (id) =>
        set({
          items: get().items
            .map((item) =>
              item.id === id
                ? { ...item, quantity: Math.max(1, item.quantity - 1) }
                : item
            )
            .filter((item) => item.quantity > 0),
        }),
      removeFromCart: (id) =>
        set({ items: get().items.filter((item) => item.id !== id) }),
      clearCart: () => set({ items: [] }),
      getTotal: () =>
        get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'cart-storage', // nombre de la key en localStorage
    }
  )
)
