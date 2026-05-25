<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="mb-8">
        <div class="flex items-center gap-4 mb-4">
          <button
            class="p-2 hover:bg-gray-200 rounded-full transition-colors"
            @click="$router.back()"
          >
            <ArrowLeftIcon class="h-6 w-6 text-gray-600" />
          </button>
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              🏦 Banka Havalesi
            </h1>
            <p class="text-gray-600 mt-1">
              Güvenli havale ile ödeme yapın
            </p>
          </div>
        </div>
      </div>

      <!-- Payment Information Card -->
      <div class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">
            Ödeme Bilgileri
          </h2>
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            Havale ile Ödeme
          </span>
        </div>

        <!-- Amount Display -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">
              Ödenecek Tutar
            </p>
            <p class="text-3xl font-bold text-blue-600">
              {{ formatPrice(amount) }}
            </p>
            <p
              v-if="orderNumber"
              class="text-sm text-gray-500 mt-2"
            >
              Sipariş No: {{ orderNumber }}
            </p>
          </div>
        </div>

        <!-- Bank Account Information -->
        <div class="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BanknotesIcon class="h-5 w-5 text-green-600 mr-2" />
            Havale Bilgileri
          </h3>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Banka Adı</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-medium">Türkiye İş Bankası A.Ş.</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('Türkiye İş Bankası A.Ş.')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şube Adı</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-medium">Levent Merkez Şubesi</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('Levent Merkez Şubesi')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şube Kodu</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-medium">640</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('640')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hesap Sahibi</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-medium">E-Commerce Platform Ltd. Şti.</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('E-Commerce Platform Ltd. Şti.')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <div class="bg-yellow-50 p-3 rounded border flex items-center justify-between border-yellow-300">
                  <span class="font-mono font-bold text-lg">TR98 0006 4000 0011 2345 6789 01</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('TR98 0006 4000 0011 2345 6789 01')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Tutar</label>
                <div class="bg-green-50 p-3 rounded border border-green-300 flex items-center justify-between">
                  <span class="font-bold text-lg text-green-800">{{ formatPrice(amount) }}</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard(amount.toString())"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Field -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Havale Açıklaması (Zorunlu)</label>
            <div class="bg-red-50 p-3 rounded border border-red-300 flex items-center justify-between">
              <span class="font-medium text-red-800">{{ paymentReference }}</span>
              <button
                class="text-blue-600 hover:text-blue-800"
                @click="copyToClipboard(paymentReference)"
              >
                <ClipboardIcon class="h-4 w-4" />
              </button>
            </div>
            <p class="text-sm text-red-600 mt-1">
              ⚠️ Havale açıklaması kısmına yukarıdaki referans kodunu mutlaka yazınız.
            </p>
          </div>
        </div>

        <!-- Instructions -->
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-amber-800 mb-3 flex items-center">
            <InformationCircleIcon class="h-5 w-5 text-amber-600 mr-2" />
            Havale Talimatları
          </h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-amber-700">
            <li>Yukarıdaki IBAN numarasına belirtilen tutarı havale yapın</li>
            <li>Havale açıklaması kısmına <strong>mutlaka</strong> referans kodunu yazın</li>
            <li>Havale işlemini tamamladıktan sonra dekont/makbuzunu saklayın</li>
            <li>Ödeme onayı genellikle 1-2 iş günü içinde gerçekleşir</li>
            <li>Onay aldıktan sonra siparişiniz işleme alınacaktır</li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            :disabled="loading"
            class="flex-1 bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            @click="confirmPayment"
          >
            <CheckCircleIcon
              v-if="!loading"
              class="h-5 w-5 mr-2"
            />
            <svg
              v-else
              class="animate-spin h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {{ loading ? 'İşleniyor...' : 'Havaleyi Yaptım' }}
          </button>

          <button
            class="flex-1 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            @click="downloadInstructions"
          >
            <ArrowDownTrayIcon class="h-5 w-5 mr-2" />
            Talimatları İndir
          </button>
        </div>
      </div>

      <!-- Support Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhoneIcon class="h-5 w-5 text-blue-600 mr-2" />
          Yardıma mı ihtiyacınız var?
        </h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p class="font-medium mb-2">
              📞 Telefon Desteği
            </p>
            <p>0850 XXX XX XX</p>
            <p class="text-xs text-gray-500">
              Pazartesi - Cuma, 09:00 - 18:00
            </p>
          </div>
          <div>
            <p class="font-medium mb-2">
              📧 E-posta Desteği
            </p>
            <p>destek@ecommerce.com</p>
            <p class="text-xs text-gray-500">
              24 saat içinde yanıt
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter, useHead, useNuxtApp } from '#imports'
import { usePaymentConfirmService } from '~/services/api/PaymentService'
import {
  ArrowLeftIcon,
  BanknotesIcon,
  ClipboardIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth',
  hideSideAds: true
})

// Page meta
useHead({
  title: 'Banka Havalesi - E-Commerce Platform',
  meta: [
    { name: 'description', content: 'Banka havalesi ile güvenli ödeme yapın' }
  ]
})

// Route params
const route = useRoute()
const paymentConfirmService = usePaymentConfirmService()
const router = useRouter()

// State
const loading = ref(false)
const amount = ref(parseFloat(route.query.amount) || 0)
const orderNumber = ref(route.query.orderNumber || '')
const paymentReference = ref(route.query.reference || generateReference())

// Composables
const toast = useNuxtApp().$toast

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

function generateReference() {
  const timestamp = Date.now().toString().slice(-8)
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${orderNumber.value || 'WAL'}-${timestamp}-${random}`
}

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Panoya kopyalandı!')
  } catch (err) {
    toast.error('Kopyalama başarısız')
  }
}

const confirmPayment = async () => {
  loading.value = true

  try {
    const response = await paymentConfirmService.confirmBankTransfer({ amount: amount.value, orderNumber: orderNumber.value, reference: paymentReference.value })

    if (response.success) {
      toast.success('Havale bildirimi alındı! Ödemeniz onaylandıktan sonra bilgilendirileceksiniz.')

      // Redirect based on context
      if (orderNumber.value) {
        await router.push(`/orders/${orderNumber.value}`)
      } else {
        await router.push('/wallet')
      }
    } else {
      throw new Error(response.error || 'İşlem başarısız')
    }

  } catch (error) {
    toast.error(error.message || 'Bir hata oluştu')
  } finally {
    loading.value = false
  }
}

const downloadInstructions = () => {
  const orderInfo = orderNumber.value ? `Sipariş No: ${orderNumber.value}` : ''
  const instructions = `
BANKA HAVALESİ TALİMATLARI
========================

Ödenecek Tutar: ${formatPrice(amount.value)}
${orderInfo}

BANKA BİLGİLERİ:
Banka: Türkiye İş Bankası A.Ş.
Şube: Levent Merkez Şubesi
Şube Kodu: 640
Hesap Sahibi: E-Commerce Platform Ltd. Şti.
IBAN: TR98 0006 4000 0011 2345 6789 01

HAVALENİN AÇIKLAMASI:
${paymentReference.value}

ÖNEMLI NOTLAR:
1. Havale açıklaması kısmına yukarıdaki referans kodunu mutlaka yazınız
2. Havale işlemini tamamladıktan sonra dekont/makbuzunu saklayın
3. Ödeme onayı genellikle 1-2 iş günü içinde gerçekleşir

Destek: 0850 XXX XX XX | destek@ecommerce.com
  `

  const blob = new Blob([instructions], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `havale-talimatlari-${paymentReference.value}.txt`
  link.click()
  window.URL.revokeObjectURL(url)

  toast.success('Talimatlar indirildi!')
}

// Validation
onMounted(() => {
  if (!amount.value || amount.value <= 0) {
    toast.error('Geçersiz ödeme tutarı')
    router.back()
  }
})
</script>