import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useCartService } from '~/services/api/CartService'
import type { CartItem, CartSummary, EscrowCoupon, Product } from '@barterborsa/shared-types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    guestItems: [] as CartItem[],
    summary: {
      totalItems: 0,
      totalPrice: 0,
      subtotal: 0,
      shipping: 0,
      discount: 0
    } as CartSummary,
    loading: false,
    error: null as string | null,
    availableEscrowCoupons: [] as EscrowCoupon[],
    appliedEscrowCoupon: null as EscrowCoupon | null
  }),

  getters: {
    itemCount: (state): number => {
      const authStore = useAuthStore()
      const items = authStore.isLoggedIn ? state.items : state.guestItems
      if (!Array.isArray(items)) return 0
      return items.reduce((total, item) => total + (item.quantity || 0), 0)
    },
    isEmpty: (state): boolean => {
      const authStore = useAuthStore()
      const items = authStore.isLoggedIn ? state.items : state.guestItems
      return !Array.isArray(items) || items.length === 0
    },
    totalPrice: (state): number => {
      const authStore = useAuthStore()
      const items = authStore.isLoggedIn ? state.items : state.guestItems
      if (!Array.isArray(items)) return 0
      return items.reduce((total, item) =>
        total + (Number(item.Product?.price || 0) * (item.quantity || 0)), 0
      )
    }
  },

  actions: {
    async initialize() {
      if (process.client) {
        const saved = localStorage.getItem('guest_cart')
        if (saved) {
          try {
            this.guestItems = JSON.parse(saved)
            await this.refreshGuestCart()
          } catch (e) {
            console.error('Failed to parse guest cart', e)
          }
        }
      }
      await this.fetchCart()
    },

    async refreshGuestCart() {
      if (this.guestItems.length === 0) return
      const cartService = useCartService()
      try {
        const ids = this.guestItems.map(item => String(item.productId))
        const response = await cartService.bulkFetchProducts(ids)

        if (response.success && response.data) {
          const latestProducts = response.data
          const updatedItems: CartItem[] = []
          for (const guestItem of this.guestItems) {
            const latest = latestProducts.find(p => p.id === guestItem.productId)
            if (latest && latest.isActive && (latest.stock ?? 0) > 0) {
              updatedItems.push({
                ...guestItem,
                Product: {
                  ...guestItem.Product,
                  price: latest.price,
                  stock: latest.stock ?? 0,
                  name: latest.name,
                  image: latest.image ?? ''
                },
                quantity: Math.min(guestItem.quantity, latest.stock ?? 0)
              })
            }
          }
          this.guestItems = updatedItems
          this.saveGuestCart()
        }
      } catch (err) {
        console.error('Failed to refresh guest cart:', err)
      }
    },

    async fetchCart() {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        this.items = []
        this.calculateGuestSummary()
        return
      }

      this.loading = true
      this.error = null
      const cartService = useCartService()

      try {
        const data = await cartService.getCart()
        if (data.success && data.data) {
          const cartResult = data.data
          if (Array.isArray(cartResult.items)) {
            this.items = cartResult.items
          } else {
            this.items = []
          }

          this.summary = cartResult.summary || {
            totalItems: this.itemCount,
            totalPrice: this.totalPrice,
            subtotal: this.totalPrice,
            shipping: this.totalPrice > 500 ? 0 : 50,
            discount: 0
          }
          return { success: true }
        }
        throw new Error(data.error || 'Sepet yüklenemedi')
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Sepet yüklenirken hata oluştu'
        this.error = error
        return { success: false, error }
      } finally {
        this.loading = false
      }
    },

    calculateGuestSummary() {
      const total = this.totalPrice
      this.summary = {
        totalItems: this.itemCount,
        totalPrice: total,
        subtotal: total,
        shipping: total > 500 || total === 0 ? 0 : 50,
        discount: 0
      }
    },

    saveGuestCart() {
      if (process.client) {
        localStorage.setItem('guest_cart', JSON.stringify(this.guestItems))
      }
      this.calculateGuestSummary()
    },

    async addToCart(productId: string, quantity: number = 1, productVariantId?: string, productData?: CartItem['Product']) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        const existing = this.guestItems.find(item => item.productId === productId)
        if (existing) {
          existing.quantity += quantity
        } else {
          this.guestItems.push({ 
            productId, 
            quantity, 
            productVariantId, 
            Product: productData || ({
              id: productId,
              name: '',
              slug: '',
              price: 0,
              image: '',
              stock: 0
            } as Product)
          })
        }
        this.saveGuestCart()
        return { success: true, guest: true }
      }

      const cartService = useCartService()
      try {
        const data = await cartService.addToCart(productId, quantity, productVariantId)
        if (data.success) {
          await this.fetchCart()
          return { success: true, message: data.message }
        }
        throw new Error(data.error)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : 'Ürün sepete eklenemedi'
        return { success: false, error }
      }
    },

    async mergeCart() {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn || this.guestItems.length === 0) return

      const cartService = useCartService()
      try {
        const data = await cartService.mergeCart(this.guestItems.map(item => ({
          productId: String(item.productId),
          quantity: item.quantity
        })))

        if (data.success) {
          this.guestItems = []
          this.saveGuestCart()
          await this.fetchCart()
          return { success: true, warnings: data.data?.warnings }
        }
      } catch (err) {
        console.error('Failed to merge cart', err)
        return { success: false }
      }
    },

    async updateQuantity(itemId: string, quantity: number) {
      const authStore = useAuthStore()
      if (quantity < 0) return

      if (!authStore.isLoggedIn) {
        const item = this.guestItems.find(i => i.productId === itemId || i.id === itemId)
        if (item) {
          if (quantity === 0) {
            this.guestItems = this.guestItems.filter(i => i !== item)
          } else {
            item.quantity = quantity
          }
          this.saveGuestCart()
          return { success: true }
        }
      }

      const cartService = useCartService()
      try {
        if (quantity === 0) return await this.removeItem(itemId)
        const data = await cartService.updateQuantity(itemId, quantity)
        if (data.success) {
          await this.fetchCart()
          return { success: true }
        }
        throw new Error(data.error)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err)
        return { success: false, error }
      }
    },

    async removeItem(itemId: string) {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        this.guestItems = this.guestItems.filter(i => i.productId !== itemId && i.id !== itemId)
        this.saveGuestCart()
        return { success: true }
      }

      const cartService = useCartService()
      try {
        const data = await cartService.removeItem(itemId)
        if (data.success) {
          await this.fetchCart()
          return { success: true, message: data.data?.message }
        }
        throw new Error(data.error)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err)
        return { success: false, error }
      }
    },

    async clearCart() {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) {
        this.guestItems = []
        this.saveGuestCart()
        return { success: true }
      }

      const cartService = useCartService()
      try {
        const data = await cartService.clearCart()
        if (data.success) {
          this.items = []
          this.summary = { totalItems: 0, totalPrice: 0, subtotal: 0, shipping: 0, discount: 0 }
          return { success: true, message: data.data?.message }
        }
        throw new Error(data.error)
      } catch (err: unknown) {
        const error = err instanceof Error ? err.message : String(err)
        return { success: false, error }
      }
    },

    async fetchEscrowCoupons() {
      const authStore = useAuthStore()
      if (!authStore.isLoggedIn) return

      const { useLoyaltyService } = await import('~/services/api/LoyaltyService')
      const loyaltyService = useLoyaltyService()
      
      try {
        const response = await loyaltyService.getEscrowCoupons()
        if (response.success && response.data) {
          this.availableEscrowCoupons = response.data
          return { success: true }
        }
        throw new Error(response.error || 'Kuponlar yüklenemedi')
      } catch (err: unknown) {
        const error = err as Error
        console.error('Fetch escrow coupons error:', error)
        return { success: false, error: error.message }
      }
    },

    applyEscrowCoupon(coupon: EscrowCoupon) {
      this.appliedEscrowCoupon = coupon
    },

    removeEscrowCoupon() {
      this.appliedEscrowCoupon = null
    }
  }
})