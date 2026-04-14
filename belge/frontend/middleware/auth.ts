import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware(async (to) => {
  // Public sayfalar - giriş yapmadan erişilebilir
  const publicPages = [
    '/login', 
    '/register', 
    '/', 
    '/products', 
    '/auctions', 
    '/lotteries', 
    '/forgot-password', 
    '/reset-password', 
    '/become-vendor',
    '/categories',
    '/cart',
    '/favorites',
    '/wishlist',
    '/privacy',
    '/terms',
    '/support',
    '/auth/callback'
  ]
  
  // Public path patterns
  const isPublicPage = 
    publicPages.includes(to.path) || 
    to.path.startsWith('/products') || 
    to.path.startsWith('/auctions') || 
    to.path.startsWith('/lotteries') || 
    to.path.startsWith('/item') ||
    to.path.startsWith('/categories') ||
    to.path.startsWith('/payment-success') ||
    to.path.startsWith('/privacy') ||
    to.path.startsWith('/terms') ||
    to.path.startsWith('/support')
  
  // Eğer zaten public sayfadaysa, auth kontrolü yapma
  if (isPublicPage) {
    return
  }
  
  const authStore = useAuthStore()
  
  // Auth store'u init et (async)
  try {
    await authStore.init()
  } catch (error) {
    console.error('Auth init error in middleware:', error)
    // Hata durumunda public sayfalara izin ver
    return
  }
  
  // Auth store'u init ettikten sonra kontrol et
  // Sadece gerçekten private sayfalar için login'e yönlendir
  if (!authStore.isLoggedIn && !isPublicPage) {
    // Özel sayfalar için login'e yönlendir, ama redirect parametresi ekle
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})