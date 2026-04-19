<template>
  <div class="card-body">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="text-center text-2xl font-bold text-gray-900 mb-2">
        E-posta Doğrulama
      </h2>
      <p class="text-center text-sm text-gray-600">
        Hesabınızı aktifleştirmek için e-posta adresinizi doğrulayın.
      </p>
    </div>

    <!-- Verification Progress -->
    <div
      v-if="verificationStatus === 'verifying'"
      class="mt-8"
    >
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <div class="spinner h-5 w-5 text-blue-600 mr-3" />
          <div>
            <h3 class="text-sm font-medium text-blue-800">
              E-posta doğrulanıyor...
            </h3>
            <p class="text-sm text-blue-700 mt-1">
              Lütfen bekleyiniz, işleminiz gerçekleştiriliyor.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Verification Success -->
    <div
      v-else-if="verificationStatus === 'success'"
      class="mt-8"
    >
      <div class="bg-green-50 border border-green-200 rounded-md p-4">
        <div class="flex">
          <CheckCircleIcon class="h-5 w-5 text-green-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-green-800">
              E-posta Başarıyla Doğrulandı!
            </h3>
            <p class="text-sm text-green-700 mt-1">
              Hesabınız artık aktif. Tüm platform özelliklerini kullanabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6">
        <NuxtLink
          to="/"
          class="btn-primary"
        >
          Ana Sayfaya Git
        </NuxtLink>
      </div>
    </div>

    <!-- Verification Error -->
    <div
      v-else-if="verificationStatus === 'error'"
      class="mt-8"
    >
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Doğrulama Başarısız
            </h3>
            <p class="text-sm text-red-700 mt-1">
              {{ errorMessage }}
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6 space-y-4">
        <button
          :disabled="authStore.loading"
          class="btn-primary"
          @click="resendVerificationEmail"
        >
          <div
            v-if="authStore.loading"
            class="flex items-center"
          >
            <div class="spinner h-4 w-4 mr-2" />
            Gönderiliyor...
          </div>
          <span v-else>Yeni Doğrulama E-postası Gönder</span>
        </button>

        <div>
          <NuxtLink
            to="/login"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Giriş sayfasına dön
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Already Verified -->
    <div
      v-else-if="verificationStatus === 'already-verified'"
      class="mt-8"
    >
      <div class="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div class="flex">
          <InformationCircleIcon class="h-5 w-5 text-blue-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              E-posta Zaten Doğrulandı
            </h3>
            <p class="text-sm text-blue-700 mt-1">
              Bu e-posta adresi daha önce doğrulandı. Giriş yapabilirsiniz.
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6">
        <NuxtLink
          to="/"
          class="btn-primary"
        >
          Ana Sayfaya Git
        </NuxtLink>
      </div>
    </div>

    <!-- Invalid Token -->
    <div
      v-else-if="verificationStatus === 'invalid'"
      class="mt-8"
    >
      <div class="bg-red-50 border border-red-200 rounded-md p-4">
        <div class="flex">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-400" />
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">
              Geçersiz Doğrulama Bağlantısı
            </h3>
            <p class="text-sm text-red-700 mt-1">
              Doğrulama bağlantısı geçersiz veya süresinin dolmuş. Token veya e-posta adresi eksik.
            </p>
          </div>
        </div>
      </div>

      <div class="text-center mt-6 space-y-4">
        <div class="text-sm text-gray-600">
          <p>Hesabınız var mı? Giriş yapın ve yeni doğrulama e-postası talep edin:</p>
        </div>

        <NuxtLink
          to="/login"
          class="btn-primary"
        >
          Giriş Yap
        </NuxtLink>
      </div>
    </div>

    <!-- Default/Loading State -->
    <div
      v-else
      class="mt-8"
    >
      <div class="bg-gray-50 border border-gray-200 rounded-md p-4">
        <div class="flex">
          <div class="spinner h-5 w-5 text-gray-600 mr-3" />
          <div>
            <p class="text-sm text-gray-800">
              Doğrulama bilgileri kontrol ediliyor...
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Security Info -->
    <div class="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
      <div class="flex">
        <InformationCircleIcon class="h-5 w-5 text-blue-400" />
        <div class="ml-3">
          <h3 class="text-sm font-medium text-blue-800">
            Güvenlik Bilgisi
          </h3>
          <div class="mt-2 text-sm text-blue-700">
            <ul class="list-disc list-inside space-y-1">
              <li>E-posta doğrulama bağlantıları 24 saat geçerlidir</li>
              <li>Her bağlantı sadece bir kez kullanılabilir</li>
              <li>Doğrulama sonrası tüm platform özelliklerini kullanabilirsiniz</li>
              <li>E-posta gelmezse spam klasörünü kontrol edin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
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
  title: 'E-posta Doğrulama - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'E-posta adresinizi doğrulayın ve hesabınızı aktifleştirin.'
    }
  ]
})

// Store
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

// Reactive data
const verificationStatus = ref('') // 'verifying', 'success', 'error', 'already-verified', 'invalid'
const errorMessage = ref('')

// Verify email on mount
onMounted(async () => {
  await authStore.init()

  const token = route.query.token
  const email = route.query.email

  if (!token || !email) {
    verificationStatus.value = 'invalid'
    return
  }

  // Set status to verifying
  verificationStatus.value = 'verifying'

  try {
    const result = await authStore.verifyEmail(token, email)

    if (result && result.success) {
      verificationStatus.value = 'success'

      // Show success toast
      const toast = useNuxtApp().$toast
      toast.success('E-posta adresiniz başarıyla doğrulandı!')

      // If user is logged in, update their profile
      if (authStore.isLoggedIn) {
        await authStore.fetchUser()
      }

    } else if (result && result.message && result.message.includes('already')) {
      verificationStatus.value = 'already-verified'
    } else {
      verificationStatus.value = 'error'
      errorMessage.value = result?.message || 'E-posta doğrulama başarısız oldu.'
    }

  } catch (error) {
    console.error('Email verification error:', error)
    verificationStatus.value = 'error'

    if (error.message.includes('already')) {
      verificationStatus.value = 'already-verified'
    } else if (error.message.includes('invalid') || error.message.includes('expired')) {
      errorMessage.value = 'Doğrulama bağlantısının süresi dolmuş veya geçersiz. Lütfen yeni bir doğrulama e-postası talep edin.'
    } else {
      errorMessage.value = error.message || 'E-posta doğrulama sırasında hata oluştu.'
    }
  }
})

// Resend verification email
const resendVerificationEmail = async () => {
  if (!authStore.isLoggedIn) {
    const toast = useNuxtApp().$toast
    toast.error('Yeni doğrulama e-postası göndermek için giriş yapmanız gerekiyor.')
    await router.push('/login')
    return
  }

  try {
    const { $api } = useApi()
    await $api('/auth/resend-verification', {
      method: 'POST'
    })

    const toast = useNuxtApp().$toast
    toast.success('Yeni doğrulama e-postası gönderildi!')

  } catch (error) {
    console.error('Resend verification error:', error)
    const toast = useNuxtApp().$toast
    toast.error('Doğrulama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.')
  }
}
</script>