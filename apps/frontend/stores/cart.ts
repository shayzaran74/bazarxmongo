import { defineStore } from 'pinia'
import { useApi } from '~/composables/useApi'
import { useAuthStore } from './auth'
import type { CartItem, CartSummary } from '@barterborsa/shared-types'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    summary: null as CartSummary | null,
    loading: false,
    availableEscrowCoupons: [] as any[],
    appliedEscrowCoupon: null as any | null,
    error: null as string | null,
  }),
  getters: {
    count: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
    total: (state): number => {
      const s = state.summary
      if (s) {
        const val = s.total ?? s.totalPrice ?? s.subtotal
        return typeof val === 'number' ? val : Number(val || 0)
      }
      return state.items.reduce((acc, item) => {
        const p = Number(item.Product?.price || item.price || 0)
        return acc + (p * item.quantity)
      }, 0)
    },
    totalPrice(): number { return this.total },
    itemCount(): number { return this.count },
  },
  actions: {
    async initialize() {
      await this.fetchCart()
    },
    async fetchCart() {
      const { $api } = useApi()
      const authStore = useAuthStore()
      this.loading = true
      try {
        if (authStore.isLoggedIn) {
          const res = await $api<{ items: CartItem[], summary: CartSummary }>('/api/cart')
          if (res.success && res.data) {
            this.items = res.data.items || []
            this.summary = res.data.summary
          }
        } else {
          if (process.client) {
            const localCart = localStorage.getItem('guest_cart')
            if (localCart) this.items = JSON.parse(localCart)
          }
        }
      } catch (err) {
        console.error('Fetch cart error:', err)
      } finally { this.loading = false }
    },
    async addToCart(productId: string | number, quantity = 1, variantId?: string, product?: any, listingId?: string, campaignId?: string) {
       return await this.addItem(productId.toString(), quantity, variantId, product, listingId, campaignId)
    },
    async addItem(productId: string, quantity = 1, variantId?: string, product?: any, listingId?: string, campaignId?: string) {
      const authStore = useAuthStore()
      const { $api } = useApi()
      this.loading = true
      try {
        if (authStore.isLoggedIn) {
          const body: any = { productId, quantity, variantId }
          if (listingId) body.listingId = listingId
          if (campaignId) body.campaignId = campaignId

          const res = await $api<any>('/api/cart', { method: 'POST', body })
          if (res.success) {
            await this.fetchCart()
            return res
          }
          return { success: false }
        } else {
          // Guest logic
          const existing = this.items.find(i => i.productId === productId && i.productVariantId === variantId)
          if (existing) {
            existing.quantity += quantity
          } else {
            // We need product info for guest cart, but usually we pass it in 'product' arg
            this.items.push({
              id: Math.random().toString(36).substring(7),
              productId,
              productVariantId: variantId,
              quantity,
              price: product?.price || 0,
              Product: product || {},
              addedAt: new Date().toISOString(),
              campaignId,
            } as any)
          }
          this.saveLocal()
          return { success: true }
        }
      } finally { this.loading = false }
    },
    async removeItem(itemId: string) {
      const authStore = useAuthStore()
      const { $api } = useApi()
      if (authStore.isLoggedIn) {
        const res = await $api<any>(`/api/cart/${itemId}`, { method: 'DELETE' })
        if (res.success) await this.fetchCart()
      } else {
        this.items = this.items.filter(i => i.id !== itemId)
        this.saveLocal()
      }
    },
    async updateQuantity(itemId: string, quantity: number) {
      const authStore = useAuthStore()
      const { $api } = useApi()
      
      if (authStore.isLoggedIn) {
        const res = await $api<any>(`/api/cart/${itemId}`, { method: 'PATCH', body: { quantity } })
        if (res.success) await this.fetchCart()
        return res
      } else {
        const item = this.items.find(i => i.id === itemId)
        if (item) {
          item.quantity = quantity
          this.saveLocal()
          return { success: true }
        }
        return { success: false, error: 'Item not found' }
      }
    },
    async fetchEscrowCoupons() {
      const { $api } = useApi()
      try {
        const res = await $api<any[]>('/api/cart/escrow-coupons')
        this.availableEscrowCoupons = res.data || []
        return this.availableEscrowCoupons
      } catch {
        return []
      }
    },
    async applyEscrowCoupon(couponId: string) {
      const { $api } = useApi()
      const res = await $api<any>('/api/cart/escrow-coupons', { method: 'POST', body: { couponId } })
      if (res.success) await this.fetchCart()
      return res
    },
    async removeEscrowCoupon() {
      const { $api } = useApi()
      const res = await $api<any>('/api/cart/escrow-coupons', { method: 'DELETE' })
      if (res.success) await this.fetchCart()
      return res
    },
    async clearCart() {
      const { $api } = useApi()
      const authStore = useAuthStore()
      this.loading = true
      try {
        if (authStore.isLoggedIn) {
          await $api('/api/cart', { method: 'DELETE' })
          await this.fetchCart()
        } else {
          this.items = []
          this.saveLocal()
        }
      } finally {
        this.loading = false
      }
    },
    saveLocal() { 
      if (process.client) {
        localStorage.setItem('guest_cart', JSON.stringify(this.items)) 
      }
    }
  }
})