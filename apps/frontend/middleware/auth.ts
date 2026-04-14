// apps/frontend/middleware/auth.ts

/**
 * Giriş yapılmamışsa kullanıcıyı login sayfasına yönlendiren middleware.
 * SSR-safe: Sunucu tarafında çerezleri kontrol eder.
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore();
  
  // Eğer kullanıcı giriş yapmamışsa
  if (!authStore.isAuthenticated) {
    // Özel durumlar ekleyebilirsiniz (örneğin ana sayfaya gitmek serbestse)
    if (to.path !== '/auth/login' && to.path !== '/auth/register') {
      return navigateTo('/auth/login');
    }
  }
});
