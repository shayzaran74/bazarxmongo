// apps/frontend/middleware/auth.ts

export default defineNuxtRouteMiddleware((to, from) => {
  const { isAuthenticated } = useAuth();

  /**
   * Eğer kullanıcı giriş yapmamışsa ve korumalı bir sayfaya (auth middleware içeren)
   * gitmeye çalışıyorsa, onu giriş sayfasına yönlendirir.
   */
  if (!isAuthenticated.value) {
    // Giriş yapıldıktan sonra dönülecek sayfayı query parametresi olarak ekleyebiliriz
    return navigateTo('/auth/login');
  }
});
