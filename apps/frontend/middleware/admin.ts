export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize the store if needed to get the latest user state
  if (!authStore.user) {
    await authStore.init()
  }

  // 1. Authentication Check
  if (!authStore.isAuthenticated) {
        return navigateTo('/auth/login')
  }

  // 2. Admin Role Check


  // Eğer veritabanı güncelse ama Store hala eski rolü tutuyorsa, me endpoint'ini zorla çağırabiliriz
  if (authStore.isAuthenticated && !authStore.isAdmin) {
    await authStore.fetchUser(true)
  }

  if (!authStore.isAdmin) {
        // Sadece logları görmek için navigasyonu şimdilik kapatabiliriz veya ana sayfaya atabiliriz
    return navigateTo('/')
  }

  return true
})