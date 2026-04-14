<template>
  <div class="min-h-screen flex items-center justify-center bg-mesh">
    <div class="text-center bg-white/80 backdrop-blur-xl p-12 rounded-[3rem] shadow-2xl border border-white/50">
      <div class="spinner h-12 w-12 border-4 border-primary-600 border-t-transparent border-solid rounded-full animate-spin mx-auto mb-6" />
      <h2 class="text-gray-900 font-black uppercase tracking-widest text-sm mb-2">
        Giriş Yapılıyor
      </h2>
      <p class="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
        Lütfen bekleyin...
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: false
})

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

onMounted(async () => {
    const error = route.query.error
    if (error) {
      await navigateTo(`/login?error=${error}`)
      return
    }

    const token = route.query.token
    if (!token) {
      await navigateTo('/login?error=missing_token')
      return
    }

    // Set cookie
    const tokenCookie = useCookie('token', {
      path: '/',
      maxAge: 15 * 60, // 15 minutes
      sameSite: 'lax'
    })
    tokenCookie.value = token
    
    // Set token in store
    authStore.token = token
    
    try {
      // Initialize auth store to fetch user data
      await authStore.init()
      
      const toast = useNuxtApp().$toast
      if (toast) {
        toast.success('Giriş başarılı')
      }
      
      // Redirect to homepage
      setTimeout(() => {
          navigateTo('/')
      }, 500)
    } catch (error) {
      console.error('Auth initialization failed during callback:', error)
      router.push('/login?error=auth_failed')
    }
})
</script>

<style scoped>
.bg-mesh {
  background-color: #f8fafc;
  background-image: 
    radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.05) 0px, transparent 50%),
    radial-gradient(at 100% 0%, rgba(147, 51, 234, 0.05) 0px, transparent 50%);
}
</style>
