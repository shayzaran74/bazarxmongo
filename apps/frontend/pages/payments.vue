<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">
          💳 Ödeme Sistemi
        </h1>
        <p class="text-gray-600 mt-1">
          Stripe entegrasyonu ile güvenli ödeme işlemleri
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Payment Form -->
        <div>
          <StripePayment 
            :initial-amount="100"
            @payment-success="handlePaymentSuccess"
            @payment-error="handlePaymentError"
          />
        </div>

        <!-- Payment Info -->
        <div class="space-y-6">
          <!-- Configuration Status -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">
              ⚙️ Konfigürasyon Durumu
            </h3>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Stripe Secret Key</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Yapılandırıldı</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Stripe Publishable Key</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Yapılandırıldı</span>  
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Webhook Secret</span>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">✅ Yapılandırıldı</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Test Modu</span>
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">🧪 Aktif</span>
              </div>
            </div>
          </div>

          <!-- Recent Payments -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">
              📋 Son Ödemeler
            </h3>
            <div
              v-if="recentPayments.length > 0"
              class="space-y-3"
            >
              <div 
                v-for="payment in recentPayments" 
                :key="payment.id"
                class="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div>
                  <p class="text-sm font-medium">
                    {{ formatPrice(payment.amount) }}
                  </p>
                  <p class="text-xs text-gray-500">
                    {{ payment.date }}
                  </p>
                </div>
                <span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Başarılı
                </span>
              </div>
            </div>
            <div
              v-else
              class="text-center py-4"
            >
              <p class="text-gray-500 text-sm">
                Henüz ödeme yapılmadı
              </p>
            </div>
          </div>

          <!-- Environment Variables -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">
              🔧 Environment Variables
            </h3>
            <div class="space-y-2 text-sm">
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-xs">STRIPE_SECRET_KEY=sk_test_51RXSv8***</code>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-xs">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RXSv8***</code>
              </div>
              <div class="bg-gray-50 p-3 rounded">
                <code class="text-xs">STRIPE_WEBHOOK_SECRET=whsec_Hh7ECy0HH0VpoyA3NRXLUZSrvNQzIPbL</code>
              </div>
            </div>
          </div>

          <!-- Test Cards -->
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold mb-4">
              🧪 Test Kartları
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between items-center py-2 border-b">
                <span>Başarılı ödeme:</span>
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">4242 4242 4242 4242</code>
              </div>
              <div class="flex justify-between items-center py-2 border-b">
                <span>Başarısız ödeme:</span>
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">4000 0000 0000 0002</code>
              </div>
              <div class="flex justify-between items-center py-2">
                <span>3D Secure gerekli:</span>
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">4000 0025 0000 3155</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import StripePayment from '~/components/forms/StripePayment.vue'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Ödeme Sistemi - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Stripe entegrasyonu ile güvenli ödeme işlemleri yapın.'
    }
  ]
})

// Composables
const authStore = useAuthStore()

// State
const recentPayments = ref([])

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const handlePaymentSuccess = (paymentData) => {
  // Add to recent payments
  const newPayment = {
    id: Date.now(),
    amount: paymentData.amount,
    date: new Date().toLocaleString('tr-TR'),
    status: 'success'
  }
  
  recentPayments.value.unshift(newPayment)
  
  // Keep only last 5 payments
  if (recentPayments.value.length > 5) {
    recentPayments.value = recentPayments.value.slice(0, 5)
  }
  
  console.log('Payment successful:', paymentData)
}

const handlePaymentError = (error) => {
  console.error('Payment failed:', error)
}

// Initialize
onMounted(async () => {
  await authStore.init()
  if (!authStore.isLoggedIn) {
    await navigateTo('/login')
    return
  }
})
</script>