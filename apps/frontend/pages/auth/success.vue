<!-- apps/frontend/pages/auth/success.vue -->

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center space-y-4">
      <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto" />
      <p class="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
        Oturum Açılıyor...
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * Google Login sonrası token'ları yakalayan ve saklayan sayfa.
 */
definePageMeta({
  layout: false
});

const route = useRoute();
const authStore = useAuthStore();

onMounted(async () => {
  try {
    const { accessToken, refreshToken, userId, email, role } = route.query;

    if (accessToken && refreshToken) {
      // Token'ları çerezlere kaydet
      const accessCookie = useCookie('access_token', { maxAge: 60 * 15 });
      const refreshCookie = useCookie('refresh_token', { maxAge: 60 * 60 * 24 * 7 });
      const userCookie = useCookie<{ id: string; email: string; role: string }>('user', { maxAge: 60 * 60 * 24 * 7 });
      
      accessCookie.value = accessToken as string;
      refreshCookie.value = refreshToken as string;

      const userData = {
        id: userId as string,
        email: email as string,
        role: role as string,
      };
      userCookie.value = userData;

      // State'i güncelle
      authStore.user = userData;
      authStore.isAuthenticated = true;
      
      // Ana sayfaya uçur
      await navigateTo('/', { replace: true });
    } else {
      await navigateTo('/auth/login');
    }
  } catch (err) {
    console.error('Login success processing failed:', err);
    await navigateTo('/auth/login');
  }
});
</script>
