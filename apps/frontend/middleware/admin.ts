export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize the store if needed to get the latest user state
  if (!authStore.user) {
    await authStore.init()
  }

  // 1. Authentication Check
  if (!authStore.isAuthenticated) {
    console.warn('🔐 Access Denied: User is not authenticated', { token: !!authStore.token })
    return navigateTo('/auth/login')
  }

  // 2. Admin Role Check


  // Eğer veritabanı güncelse ama Store hala eski rolü tutuyorsa, me endpoint'ini zorla çağırabiliriz
  if (authStore.isAuthenticated && !authStore.isAdmin) {
    await authStore.fetchUser(true)
  }

  if (!authStore.isAdmin) {
    console.warn('🚫 ACCESS DENIED: Required ADMIN role but found:', authStore.user?.role)
    // Sadece logları görmek için navigasyonu şimdilik kapatabiliriz veya ana sayfaya atabiliriz
    return navigateTo('/')
  }

  return true
})