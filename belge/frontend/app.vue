<template>
  <div id="__nuxt">
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useRoute, useRouter, useNuxtApp, useCookie } from '#app'

// Initialize auth store when app starts
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

onMounted(async () => {
  // Check for Google OAuth token first
  if (route.query.token) {
    const token = route.query.token

    // Set cookie with token
    const tokenCookie = useCookie('token', {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false,
      secure: false, // Development için false
      sameSite: 'lax'
    })
    tokenCookie.value = token

    // Set token in auth store
    authStore.token = token
    authStore.isAuthenticated = true

    try {
      // Fetch user data with the token we just got
      await authStore.fetchUser()

      // Clean up URL query parameters
      const url = new URL(window.location.href)
      url.searchParams.delete('token')
      window.history.replaceState({}, '', url.pathname)

      // Show success message
      const toast = useNuxtApp().$toast
      toast.success('Google ile giriş başarılı!')

      // Navigate to home to ensure clean state
      router.replace('/')
    } catch (error) {
      console.error('OAuth user fetch error:', error)
      const toast = useNuxtApp().$toast
      toast.error('Giriş doğrulanırken bir hata oluştu.')
      await router.replace({ path: '/login', query: { error: 'auth_failed' } })
    }
  }
  // Check for OAuth error
  else if (route.query.error === 'oauth_failed') {
    const toast = useNuxtApp().$toast
    toast.error('Google ile giriş başarısız oldu. Lütfen tekrar deneyin.')
    await router.replace({ path: '/login', query: {} })
  }
  // Normal initialization
  else {
    await authStore.init()
  }

  // Marketing Analytics
  const { track, captureUtmParams } = useAnalytics()

  // Capture UTM parameters on initial load
  if (Object.keys(route.query).some(k => k.startsWith('utm_') || k === 'source' || k === 'campaign' || k === 'medium')) {
    captureUtmParams()
  }

  // Track initial page view
  track('PAGE_VIEW')

  // Track route changes
  watch(() => route.path, () => {
    track('PAGE_VIEW')
    // Capture UTMs again if they change (rare but possible in SPA navigation)
    if (Object.keys(route.query).some(k => k.startsWith('utm_'))) {
      captureUtmParams()
    }
  })
})
</script>