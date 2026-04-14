export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize the store if needed to get the latest user state
  if (!authStore.user) {
    await authStore.init()
  }

  // 1. Authentication Check
  if (!authStore.isAuthenticated) {
    console.warn('🔐 Access Denied: Authentication required for', to.path)
    return navigateTo('/login')
  }

  // 2. Admin Role Check
  // Note: Super admins are also admins
  if (!authStore.user?.isAdmin) {
    console.warn('🔐 Access Denied: Admin role required for', to.path)
    return navigateTo('/')
  }

  return true
})