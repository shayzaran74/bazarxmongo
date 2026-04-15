<template>
  <div class="space-y-6">
    <!-- Error Alert -->
    <Transition name="fade">
      <div v-if="authStore.error" class="bg-red-50 border-2 border-red-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
        <Icon name="heroicons:exclamation-circle" class="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div class="text-xs font-bold text-red-600 uppercase tracking-tight">
          {{ authStore.error }}
        </div>
      </div>
    </Transition>

    <!-- Validation Errors -->
    <Transition name="fade">
      <div v-if="Object.values(errors).some(e => e)" class="bg-red-50 border-2 border-red-100 p-4 rounded-2xl space-y-1">
        <div v-for="(err, key) in errors" v-show="err" :key="key" class="text-xs font-bold text-red-600 uppercase tracking-tight flex items-center gap-2">
          <span class="w-1 h-1 rounded-full bg-red-500 shrink-0" />
          {{ err }}
        </div>
      </div>
    </Transition>

    <form class="space-y-4" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div class="space-y-2 group">
        <label for="name" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.fullName') }}
        </label>
        <div class="relative">
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            :placeholder="$t('auth.fullName')"
          />
        </div>
      </div>

      <!-- Email -->
      <div class="space-y-2 group">
        <label for="email" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.email') }}
        </label>
        <div class="relative">
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none"
            placeholder="merhaba@bazarx.com"
          />
        </div>
      </div>

      <!-- Password -->
      <div class="space-y-2 group">
        <label for="password" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.password') }}
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
            @click="showPassword = !showPassword"
          >
            <Icon v-if="showPassword" name="heroicons:eye-slash" class="w-5 h-5" />
            <Icon v-else name="heroicons:eye" class="w-5 h-5" />
          </button>
        </div>
        <p class="text-[10px] text-gray-400 font-medium ml-2">
          * {{ $t('auth.passwordHint') }}
        </p>
      </div>

      <!-- Confirm Password -->
      <div class="space-y-2 group">
        <label for="confirmPassword" class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 group-focus-within:text-primary-600 transition-colors">
          {{ $t('auth.confirmPassword') }}
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            class="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl px-5 py-4 text-sm font-bold focus:bg-white focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5 transition-all outline-none pr-12"
            placeholder="••••••••"
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary-600 transition-colors"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <Icon v-if="showConfirmPassword" name="heroicons:eye-slash" class="w-5 h-5" />
            <Icon v-else name="heroicons:eye" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Consents -->
      <div class="space-y-3 pt-2">
        <!-- Terms & Privacy -->
        <div class="flex items-start px-1">
          <input id="acceptTerms" v-model="form.acceptTerms" type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer">
          <label for="acceptTerms" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer hover:text-gray-700 transition-colors">
            <i18n-t keypath="auth.acceptTermsTemplate" scope="global">
              <template #terms>
                <NuxtLink to="/legal/kullanim-kosullari" target="_blank" class="text-primary-600 hover:underline">
                  {{ $t('auth.terms') }}
                </NuxtLink>
              </template>
              <template #privacy>
                <NuxtLink to="/legal/gizlilik-politikasi" target="_blank" class="text-primary-600 hover:underline">
                  {{ $t('auth.privacy') }}
                </NuxtLink>
              </template>
            </i18n-t>
          </label>
        </div>
        <!-- KVKK -->
        <div class="flex items-start px-1">
          <input id="kvkkConsent" v-model="form.kvkkConsent" type="checkbox" required class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer">
          <label for="kvkkConsent" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer hover:text-gray-700 transition-colors">
            <i18n-t keypath="auth.kvkkConsentTemplate" scope="global">
              <template #kvkk>
                <NuxtLink to="/legal/kvkk" target="_blank" class="text-primary-600 hover:underline">
                  {{ $t('auth.kvkk') }}
                </NuxtLink>
              </template>
            </i18n-t>
          </label>
        </div>
        <!-- Marketing (optional) -->
        <div class="flex items-start px-1">
          <input id="marketingConsent" v-model="form.marketingConsent" type="checkbox" class="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer">
          <label for="marketingConsent" class="ml-3 block text-[11px] font-bold text-gray-500 uppercase tracking-tight leading-relaxed cursor-pointer hover:text-gray-700 transition-colors">
            {{ $t('auth.marketingConsent') }}
          </label>
        </div>
      </div>

      <!-- Register Button -->
      <button
        type="submit"
        :disabled="authStore.loading"
        class="w-full h-14 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-2xl text-[13px] font-black uppercase tracking-[0.15em] shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-3 overflow-hidden group relative mt-6"
      >
        <div v-if="authStore.loading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        <span class="relative z-10 font-display">
          {{ authStore.loading ? $t('auth.creatingAccount') : $t('auth.registerBtn') }}
        </span>
        <!-- Shine effect -->
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </button>
    </form>

    <!-- Divider -->
    <div class="relative py-2">
      <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-gray-100"></div></div>
      <div class="relative flex justify-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
        <span class="bg-white/50 backdrop-blur px-4 py-1 rounded-full border border-gray-50">{{ $t('auth.or') }}</span>
      </div>
    </div>

    <!-- Google Register -->
    <button
      type="button"
      class="w-full flex items-center justify-center gap-4 bg-white/50 backdrop-blur-sm border-2 border-gray-100 h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest text-gray-600 hover:bg-white hover:border-gray-200 hover:shadow-lg transition-all duration-300"
      @click="handleGoogleRegister"
    >
      <svg class="h-5 w-5" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      {{ $t('auth.continueWithGoogle') }}
    </button>

    <!-- Login Link -->
    <div class="text-center mt-6">
      <p class="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
        {{ $t('auth.alreadyHaveAccount') }}
        <NuxtLink to="/auth/login" class="text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline ml-1">
          {{ $t('auth.loginNow') }}
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { t } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

useHead({
  title: `${t('auth.register')} | BazarX`,
  meta: [
    { name: 'description', content: t('auth.registerTitle') }
  ]
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
  kvkkConsent: false,
  marketingConsent: false
})

const errors = reactive({
  email: '',
  name: '',
  password: '',
  confirmPassword: ''
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await router.push('/')
  }
})

const validateForm = () => {
  let isValid = true
  Object.keys(errors).forEach(key => (errors as Record<string, string>)[key] = '')

  if (!form.email) {
    errors.email = t('auth.validation.emailRequired'); isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('auth.validation.emailInvalid'); isValid = false
  }

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])[A-Za-z\d@$!%*?&._-]{8,}$/
  if (!form.password) {
    errors.password = t('auth.validation.passwordRequired'); isValid = false
  } else if (!strongPasswordRegex.test(form.password)) {
    errors.password = t('auth.validation.passwordCriteria'); isValid = false
  }

  if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('auth.validation.passwordMismatch'); isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (authStore.loading) return
  if (!validateForm()) return
  authStore.error = null

  // Name alanını firstName ve lastName olarak parçala
  const nameParts = form.name.trim().split(' ')
  const firstName = nameParts[0]
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '-'

  const success = await authStore.register({
    email: form.email,
    firstName,
    lastName,
    password: form.password,
    kvkkConsent: form.kvkkConsent,
    marketingConsent: form.marketingConsent
  })

  if (success) {
    await router.push('/')
  }
}

const handleGoogleRegister = () => {
  const config = useRuntimeConfig()
  window.location.href = `${config.public.apiBase}/auth/google`
}
</script>
