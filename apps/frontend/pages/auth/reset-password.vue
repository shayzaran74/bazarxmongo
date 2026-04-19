<template>
  <div class="card-body">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-2xl font-bold text-gray-900 mb-2">
        Yeni Şifre Belirleyin
      </h2>
      <p class="text-center text-sm text-gray-600">
        Hesabınız için yeni bir şifre oluşturun.
      </p>
    </div>

    <!-- Token validation error -->
    <div
      v-if="tokenError"
      class="mt-8"
    >
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Geçersiz Bağlantı
            </h3>
            <p class="text-sm text-red-700 mt-1">
              {{ tokenError }}
            </p>
          </div>
        </div>
      </div>
      
      <div class="text-center mt-6">
        <NuxtLink
          to="/auth/forgot-password"
          class="btn-primary"
        >
          Yeni Şifre Sıfırlama Talebi
        </NuxtLink>
      </div>
    </div>

    <!-- Reset password form -->
    <form
      v-else
      class="mt-8 space-y-6"
      @submit.prevent="handleResetPassword"
    >
      <!-- New Password -->
      <div>
        <label
          for="password"
          class="form-label"
        >
          Yeni Şifre *
        </label>
        <div class="relative">
          <input
            id="password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            :class="['form-input pr-10', { 'form-input-error': errors.password }]"
            placeholder="En az 8 karakter, büyük-küçük harf ve rakam"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
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
        <p
          v-if="errors.password"
          class="form-error"
        >
          {{ errors.password }}
        </p>
        <div class="mt-1 text-xs text-gray-500">
          Şifreniz en az 8 karakter, büyük harf, küçük harf ve rakam içermelidir.
        </div>
      </div>

      <!-- Confirm Password -->
      <div>
        <label
          for="confirmPassword"
          class="form-label"
        >
          Şifre Tekrarı *
        </label>
        <div class="relative">
          <input
            id="confirmPassword"
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            autocomplete="new-password"
            required
            :class="['form-input pr-10', { 'form-input-error': errors.confirmPassword }]"
            placeholder="Şifrenizi tekrar girin"
          >
          <button
            type="button"
            class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <EyeIcon
              v-if="showConfirmPassword"
              class="h-5 w-5"
            />
            <EyeSlashIcon
              v-else
              class="h-5 w-5"
            />
          </button>
        </div>
        <p
          v-if="errors.confirmPassword"
          class="form-error"
        >
          {{ errors.confirmPassword }}
        </p>
      </div>

      <!-- Error Message -->
      <div
        v-if="authStore.error"
        class="bg-red-50 border border-red-200 rounded-md p-4"
      >
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <p class="text-sm text-red-800">
              {{ authStore.error }}
            </p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <div>
        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full btn-primary btn-lg"
        >
          <div
            v-if="authStore.loading"
            class="flex items-center"
          >
            <div class="spinner h-4 w-4 mr-2" />
            Şifre sıfırlanıyor...
          </div>
          <span v-else>Şifremi Sıfırla</span>
        </button>
      </div>

      <!-- Security Info -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Güvenlik Bilgisi
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li>Şifrenizi sıfırladıktan sonra otomatik olarak giriş yapılacaktır</li>
                <li>Güvenliğiniz için güçlü bir şifre seçin</li>
                <li>Şifrenizi başkalarıyla paylaşmayın</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Login -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Giriş sayfasına dönmek mi istiyorsunuz?
          <NuxtLink
            to="/auth/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Giriş yap
          </NuxtLink>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { EyeIcon, EyeSlashIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'auth'
})

// Page meta
useHead({
  title: 'Şifre Sıfırla - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Yeni şifrenizi belirleyin ve hesabınıza güvenli bir şekilde giriş yapın.'
    }
  ]
})

// Store
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Reactive data
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const tokenError = ref('')

const form = reactive({
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  password: '',
  confirmPassword: ''
})

// Check token validity and user login status
onMounted(async () => {
  await authStore.init()
  
  if (authStore.isLoggedIn) {
    await router.push('/')
    return
  }

  // Validate reset token and email
  const token = route.query.token
  const email = route.query.email

  if (!token || !email) {
    tokenError.value = 'Şifre sıfırlama bağlantısı geçersiz. Token veya e-posta adresi eksik.'
    return
  }

  // You could add a backend endpoint to validate token before showing the form
  // For now, we'll validate it when the form is submitted
})

// Validation
const validateForm = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
  // Password validation
  if (!form.password) {
    errors.password = 'Yeni şifre gereklidir'
    isValid = false
  } else if (form.password.length < 8) {
    errors.password = 'Şifre en az 8 karakter olmalıdır'
    isValid = false
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
    errors.password = 'Şifre büyük harf, küçük harf ve rakam içermelidir'
    isValid = false
  }
  
  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Şifre tekrarı gereklidir'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Şifreler eşleşmiyor'
    isValid = false
  }
  
  return isValid
}

// Reset password handler
const handleResetPassword = async () => {
  if (!validateForm()) return
  
  const token = route.query.token
  const email = route.query.email
  
  if (!token || !email) {
    tokenError.value = 'Şifre sıfırlama bilgileri eksik.'
    return
  }
  
  authStore.clearError()
  
  try {
    await authStore.resetPassword({
      token: token,
      email: email,
      password: form.password
    })
    
    // Show success message
    const toast = useNuxtApp().$toast
    toast.success('Şifreniz başarıyla sıfırlandı! Hoş geldiniz.')
    
    // Redirect to home (user will be automatically logged in)
    await router.push('/')
    
  } catch (error) {
    console.error('Reset password error:', error)
    
    // Handle specific token errors
    if (error.message.includes('token') || error.message.includes('expired')) {
      tokenError.value = 'Şifre sıfırlama bağlantısının süresi dolmuş veya geçersiz. Lütfen yeni bir tane talep edin.'
    }
    // Error is handled by the store and displayed in the template
  }
}

// Watch for errors and clear them when user types
Object.keys(form).forEach(key => {
  watch(() => form[key], () => {
    if (errors[key]) errors[key] = ''
    authStore.clearError()
  })
})
</script>