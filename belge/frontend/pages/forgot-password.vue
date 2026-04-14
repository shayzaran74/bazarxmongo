<template>
  <div class="card-body">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-2xl font-bold text-gray-900 mb-2">
        Şifremi Unuttum
      </h2>
      <p class="text-center text-sm text-gray-600">
        E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
      </p>
    </div>

    <form
      class="mt-8 space-y-6"
      @submit.prevent="handleForgotPassword"
    >
      <!-- Email -->
      <div>
        <label
          for="email"
          class="form-label"
        >
          E-posta Adresi
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          :class="['form-input', { 'form-input-error': errors.email }]"
          placeholder="ornek@email.com"
        >
        <p
          v-if="errors.email"
          class="form-error"
        >
          {{ errors.email }}
        </p>
      </div>

      <!-- Success Message -->
      <div
        v-if="successMessage"
        class="bg-green-50 border border-green-200 rounded-md p-4"
      >
        <div class="flex">
          <CheckCircleIcon class="h-5 w-5 text-green-400" />
          <div class="ml-3">
            <p class="text-sm text-green-800">
              {{ successMessage }}
            </p>
          </div>
        </div>
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
          :disabled="authStore.loading || !!successMessage"
          class="w-full btn-primary btn-lg"
        >
          <div
            v-if="authStore.loading"
            class="flex items-center"
          >
            <div class="spinner h-4 w-4 mr-2" />
            Gönderiliyor...
          </div>
          <span v-else-if="successMessage">Gönderildi ✓</span>
          <span v-else>Şifre Sıfırlama Bağlantısı Gönder</span>
        </button>
      </div>

      <!-- Instructions -->
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Bilgi
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <ul class="list-disc list-inside space-y-1">
                <li>Şifre sıfırlama bağlantısı e-posta adresinize gönderilecektir</li>
                <li>Bağlantı 1 saat süreyle geçerlidir</li>
                <li>Spam klasörünü kontrol etmeyi unutmayın</li>
                <li>E-posta gelmezse birkaç dakika bekleyip tekrar deneyin</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Login -->
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Şifrenizi hatırladınız mı?
          <NuxtLink
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            Giriş yapın
          </NuxtLink>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'auth'
})

// Page meta
useHead({
  title: 'Şifremi Unuttum - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Şifrenizi mi unuttunuz? E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.'
    }
  ]
})

// Store
const authStore = useAuthStore()
const router = useRouter()

// Reactive data
const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const successMessage = ref('')

// Check if already logged in
onMounted(async () => {
  await authStore.init()
  if (authStore.isLoggedIn) {
    await router.push('/')
  }
})

// Validation
const validateForm = () => {
  let isValid = true
  
  // Reset errors
  errors.email = ''
  
  // Email validation
  if (!form.email) {
    errors.email = 'E-posta adresi gereklidir'
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = 'Geçerli bir e-posta adresi girin'
    isValid = false
  }
  
  return isValid
}

// Forgot password handler
const handleForgotPassword = async () => {
  if (!validateForm()) return
  
  authStore.clearError()
  successMessage.value = ''
  
  try {
    const response = await authStore.forgotPassword(form.email)
    
    if (response && response.success) {
      successMessage.value = response.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.'
      
      // Show success message with toast
      const toast = useNuxtApp().$toast
      toast.success('Şifre sıfırlama e-postası gönderildi!')
      
      // Clear form
      form.email = ''
    }
    
  } catch (error) {
    console.error('Forgot password error:', error)
    // Error is handled by the store and displayed in the template
  }
}

// Watch for errors and clear them when user types
watch(() => form.email, () => {
  if (errors.email) errors.email = ''
  authStore.clearError()
  successMessage.value = ''
})
</script>