// apps/frontend/middleware/00.maintenance.global.ts
export default defineNuxtRouteMiddleware((to) => {
  // Bakım sayfasının kendisindeysek sonsuz döngüye girmeyelim
  if (to.path === '/maintenance') return

  // Cookie kontrolü (Shayzaran74 şifresi girilmiş mi?)
  const accessCookie = useCookie('maintenance_bypass')

  if (accessCookie.value !== 'authorized') {
    // Eğer şifre girilmemişse bakım sayfasına yönlendir
    return navigateTo('/maintenance')
  }
})
