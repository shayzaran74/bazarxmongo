<template>
  <div class="min-h-screen flex items-center justify-center auth-background px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Content -->
      <div class="auth-card shadow-colored">
        <slot />
      </div>

      <!-- Logout button for logged in users on auth pages -->
      <div
        v-if="authStore.isLoggedIn"
        class="text-center"
      >
        <button
          class="text-white/70 hover:text-white text-sm transition-colors"
          @click="handleLogout"
        >
          Çıkış Yap
        </button>
      </div>

      <!-- Footer -->
      <div class="text-center">
        <p class="text-xs text-white/60">
          &copy; 2024 TicariTakas. Tüm hakları saklıdır.
        </p>
        <div class="mt-2 space-x-4 text-xs">
          <NuxtLink
            to="/legal/gizlilik-politikasi"
            class="text-white/70 hover:text-white"
          >
            Gizlilik Politikası
          </NuxtLink>
          <NuxtLink
            to="/legal/kullanim-kosullari"
            class="text-white/70 hover:text-white"
          >
            Kullanım Şartları
          </NuxtLink>
          <NuxtLink
            to="/help"
            class="text-white/70 hover:text-white"
          >
            Destek
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = async () => {
  try {
    await authStore.logout()
    // Show success message
    const toast = useNuxtApp().$toast
    toast.success('Çıkış yapıldı!')
    // Redirect to login
    await router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Show error message
    const toast = useNuxtApp().$toast
    toast.error('Çıkış yapılırken bir hata oluştu!')
  }
}
</script>

<style scoped>
.text-gradient {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
</style>