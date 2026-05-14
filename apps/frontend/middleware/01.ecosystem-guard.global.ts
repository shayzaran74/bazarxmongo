// apps/frontend/middleware/01.ecosystem-guard.global.ts
import { useAuthStore } from '~/stores/auth'

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  const isBarterBorsa = to.path.startsWith('/barterborsa')
  const isTicariTakas = to.path.startsWith('/ticaritakas')

  // Eğer ekosistem sayfalarından biri değilse karışma
  if (!isBarterBorsa && !isTicariTakas) return

  // 1. Giriş Kontrolü
  if (!authStore.isLoggedIn) {
    return navigateTo('/auth/login?redirect=' + to.fullPath)
  }

  // 2. Satıcı Kontrolü (Ticari Takas ve Barter Borsa için ortak)
  if (!authStore.isVendor || authStore.vendorStatus !== 'APPROVED') {
    // Adminler testi yapabilsin diye buraya bypass eklemiyorum (isteğiniz üzerine)
    // Ancak normalde adminler her yeri görebilir.
    return
  }

  // 3. APEX Kontrolü (Sadece Barter Borsa için)
  if (isBarterBorsa) {
    const tier = (authStore.user?.vendor as any)?.tier
    const isApex = tier === 'APEX' || tier === 'APEX_PLUS'
    
    // Admin bypass'ını bileşen seviyesinde kaldırdık, middleware'de de katı davranıyoruz
    // Eğer APEX değilse, index sayfasındaki AccessGuard uyarısını görecektir.
    // Middleware'de redirect yaparsak ekranı göremez, o yüzden sadece kontrolü geçiyoruz.
  }
})
