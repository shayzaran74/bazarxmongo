<template>
  <div class="min-h-screen bg-mesh flex flex-col justify-center py-12 px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <div
        class="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl p-10 border border-white/50 relative overflow-hidden"
      >
        <!-- Decoration -->
        <div class="absolute -top-12 -right-12 w-24 h-24 bg-primary-100 rounded-full blur-2xl" />
        <div class="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-100 rounded-full blur-2xl" />

        <div class="relative z-10">
          <div class="flex justify-center mb-8">
            <div
              class="w-16 h-16 bg-primary-600 rounded-3xl flex items-center justify-center rotate-6 shadow-xl shadow-primary-500/30"
            >
              <ShoppingCartIcon class="h-8 w-8 text-white -rotate-6" />
            </div>
          </div>

          <h2 class="text-center text-3xl font-black text-gray-900 mb-2 tracking-tight">
            {{ $t('auth.welcome') }}
          </h2>
          <p class="text-center text-sm font-bold text-gray-400 uppercase tracking-widest mb-10">
            {{ $t('auth.loginTitle') }}
          </p>

          <form
            class="space-y-6"
            @submit.prevent="handleLogin"
          >
            <!-- Email -->
            <div class="space-y-1">
              <label
                for="email"
                class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
              >{{
                $t('auth.email') }}</label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                autocomplete="email"
                required
                class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all"
                placeholder="name@example.com"
              >
            </div>

            <!-- Password -->
            <div class="space-y-1">
              <div class="flex items-center justify-between px-1">
                <label
                  for="password"
                  class="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1"
                >{{
                  $t('auth.password') }}</label>
                <NuxtLink
                  to="/forgot-password"
                  class="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700"
                >
                  {{ $t('auth.forgotPassword') }}
                </NuxtLink>
              </div>
              <div class="relative">
                <input
                  id="password"
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="current-password"
                  required
                  class="w-full bg-gray-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all pr-12"
                  placeholder="••••••••"
                >
                <button
                  type="button"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400"
                  @click="showPassword = !showPassword"
                >
                  <EyeIcon
                    v-if="showPassword"
                    class="h-5 w-5"
                  />
                  <EyeSlashIcon
                    v-else
                    class="h-5 w-5"
                  />
                </button>
              </div>
            </div>

            <!-- Terms -->
            <div class="flex items-start px-1 py-1">
              <input
                id="acceptTerms"
                v-model="form.acceptTerms"
                type="checkbox"
                required
                class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-0.5"
              >
              <label
                for="acceptTerms"
                class="ml-2 block text-[10px] font-bold text-gray-500 uppercase tracking-tight"
              >
                <i18n-t
                  keypath="auth.acceptTermsTemplate"
                  scope="global"
                >
                  <template #terms>
                    <NuxtLink
                      to="/legal/kullanim-kosullari"
                      target="_blank"
                      class="text-primary-600 hover:underline"
                    >
                      {{ $t('auth.terms') }}
                    </NuxtLink>
                  </template>
                  <template #privacy>
                    <NuxtLink
                      to="/legal/gizlilik-politikasi"
                      target="_blank"
                      class="text-primary-600 hover:underline"
                    >
                      {{ $t('auth.privacy') }}
                    </NuxtLink>
                  </template>
                </i18n-t>
              </label>
            </div>

            <!-- Error Message -->
            <Transition name="fade">
              <div
                v-if="authStore.error"
                class="bg-red-50 text-red-600 rounded-2xl p-4 text-xs font-bold border border-red-100 text-center animate-shake"
              >
                {{ authStore.error }}
              </div>
            </Transition>

            <!-- Submit Button -->
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full btn-primary h-14 !rounded-2xl uppercase tracking-widest text-xs font-black shadow-xl shadow-primary-500/30 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <div
                v-if="authStore.loading"
                class="spinner h-4 w-4 border-white/30 border-t-white"
              />
              <span>{{ authStore.loading ? $t('auth.loggingIn') : $t('auth.login') }}</span>
            </button>

            <!-- Google Login -->
            <div class="relative my-8">
              <div class="absolute inset-0 flex items-center">
                <div class="w-full border-t border-gray-100" />
              </div>
              <div
                class="relative flex justify-center text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] bg-white px-4"
              >
                {{ $t('auth.or') }}
              </div>
            </div>

            <button
              type="button"
              class="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-50 h-14 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-colors shadow-sm"
              @click="handleGoogleLogin"
            >
              <svg
                class="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {{ $t('auth.continueWithGoogle') }}
            </button>

            <!-- Register Link -->
            <p class="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-8">
              {{ $t('auth.noAccount') }}
              <NuxtLink
                to="/register"
                class="text-primary-600 hover:text-primary-700"
              >
                {{ $t('auth.registerNow') }}
              </NuxtLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ShoppingCartIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

useHead({
  title: t('auth.login'),
  meta: [
    { name: 'description', content: t('auth.loginTitle') }
  ]
})

const showPassword = ref(false)
const form = reactive({
  email: '',
  password: '',
  acceptTerms: false,
  rememberMe: false
})

onMounted(async () => {
  if (route.query.error) {
    const errorMap = {
      'oauth_failed': 'Google ile giriş yapılamadı.',
      'missing_token': 'Token bulunamadı. Lütfen tekrar deneyin.',
      'auth_failed': 'Giriş işlemi tamamlanamadı. Lütfen tekrar deneyin.',
      'session_expired': 'Oturum süresi doldu.',
      'security_violation': 'Güvenlik ihlali tespit edildi. Lütfen tekrar giriş yapın.'
    }
    
    authStore.error = errorMap[route.query.error] || 'Bilinmeyen bir hata oluştu.'
    
    // Clean up url
    router.replace({ query: {} })
  }

  await authStore.init()
  if (authStore.isLoggedIn) {
    await router.push('/')
  }
})

const handleLogin = async () => {
  if (!form.acceptTerms) {
    const toast = useNuxtApp().$toast
    toast.error(t('auth.acceptTermsError'))
    return
  }

  authStore.clearError()
  try {
    await authStore.login({
      email: form.email,
      password: form.password,
      rememberMe: form.rememberMe
    })

    if (authStore.isLoggedIn) {
      const toast = useNuxtApp().$toast
      toast.success(t('auth.loginSuccess'))
      window.location.href = '/'
    }
  } catch (error) {
    console.error('Login error:', error)
  }
}

const handleGoogleLogin = () => {
  const googleUrl = `${useRuntimeConfig().public.apiBase}/api/auth/google`
  console.log('🔗 Redirecting to backend Google auth:', googleUrl)
  window.location.href = googleUrl
}
</script>