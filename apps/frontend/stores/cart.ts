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
    total: (state) => state.summary?.total || 0,
    totalPrice: (state) => state.summary?.total || 0,
    itemCount: (state) => state.items.reduce((acc, item) => acc + item.quantity, 0),
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
    async addToCart(productId: string | number, quantity = 1, variantId?: string, product?: any) {
       return await this.addItem(productId.toString(), quantity, variantId)
    },
    async addItem(productId: string, quantity = 1, variantId?: string) {
      const authStore = useAuthStore()
      const { $api } = useApi()
      this.loading = true
      try {
        if (authStore.isLoggedIn) {
          const res = await $api<any>('/api/cart', { method: 'POST', body: { productId, quantity, variantId } })
          if (res.success) {
            await this.fetchCart()
            return res
          }
          return { success: false }
        } else {
          // Guest logic
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
      const { $api } = useApi()
      const res = await $api<any>(`/api/cart/${itemId}`, { method: 'PATCH', body: { quantity } })
      if (res.success) await this.fetchCart()
      return res
    },
    async fetchEscrowCoupons() {
      const { $api } = useApi()
      const res = await $api<any[]>('/api/cart/escrow-coupons')
      return res.data || []
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
    saveLocal() { 
      if (process.client) {
        localStorage.setItem('guest_cart', JSON.stringify(this.items)) 
      }
    }
  }
})