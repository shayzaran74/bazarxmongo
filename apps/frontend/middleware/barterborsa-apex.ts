// middleware/barterborsa-apex.ts
// Barter Borsa alt sayfaları — sadece SUPER_ADMIN veya APEX/APEX_PLUS tier erişebilir
export default defineNuxtRouteMiddleware(async () => {
  const authStore = useAuthStore()

  if (!authStore.user) {
    await authStore.init()
  }

  if (!authStore.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  const tier = (authStore.user?.vendor as { tier?: string } | undefined)?.tier
  const hasApex = tier === 'APEX' || tier === 'APEX_PLUS'

  if (!authStore.isSuperAdmin && !hasApex) {
    // Erişim reddedildi — index sayfası APEX uyarısını gösterir
    return navigateTo('/barterborsa')
  }
})
