import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()

  // Initialize auth state from cookie
  console.log('🔐 Initializing auth plugin...')
  // Initialize cart state
  const cartStore = useCartStore()
  try {
    await authStore.init()
    console.log('✅ Auth initialized:', {
      isAuthenticated: authStore.isAuthenticated,
      hasUser: !!authStore.user,
      hasToken: !!authStore.token,
      isLoggedIn: authStore.isLoggedIn,
      userEmail: authStore.user?.email
    })

    // Initialize cart (loads guest cart from localStorage if needed)
    await cartStore.initialize()
  } catch (error) {
    console.error('❌ Auth/Cart init error:', error)
  }
})
