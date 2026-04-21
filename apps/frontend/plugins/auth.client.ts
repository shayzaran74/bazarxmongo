import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Initialize auth state from cookie
  // Initialize cart state
  const cartStore = useCartStore()
  try {
    await authStore.init()


    // Initialize cart (loads guest cart from localStorage if needed)
    await cartStore.initialize()
  } catch (error) {
    console.error('❌ Auth/Cart init error:', error)
  }
})
