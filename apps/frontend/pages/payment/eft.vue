<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
              💳 EFT ile Ödeme
            </h1>
            <p class="text-gray-600 mt-1">
              Elektronik fon transferi ile hızlı ödeme
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
          <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
            EFT ile Ödeme
          </span>
        </div>

        <!-- Amount Display -->
        <div class="bg-purple-50 rounded-lg p-4 mb-6">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">
              Ödenecek Tutar
            </p>
            <div class="space-y-1">
              <p class="text-2xl font-bold text-purple-600">
                {{ formatPrice(amount) }}
              </p>
              <p class="text-sm text-orange-600 font-medium">
                + {{ formatPrice(eftFee) }} EFT Ücreti
              </p>
              <div class="border-t border-purple-200 pt-2 mt-2">
                <p class="text-3xl font-bold text-purple-800">
                  {{ formatPrice(totalAmount) }}
                </p>
                <p class="text-xs text-gray-500">
                  Toplam Ödenecek Tutar
                </p>
              </div>
            </div>
            <p
              v-if="orderNumber"
              class="text-sm text-gray-500 mt-2"
            >
              Sipariş No: {{ orderNumber }}
            </p>
          </div>
        </div>

        <!-- EFT Information -->
        <div class="border border-gray-200 rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CreditCardIcon class="h-5 w-5 text-purple-600 mr-2" />
            EFT Bilgileri
          </h3>

          <div class="grid md:grid-cols-2 gap-4">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Banka Adı</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-medium">Türkiye İş Bankası</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('Türkiye İş Bankası')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Alıcı Adı</label>
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
                <label class="block text-sm font-medium text-gray-700 mb-1">Hesap Numarası</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-mono font-medium">1234567890</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('1234567890')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Şube Kodu</label>
                <div class="bg-gray-50 p-3 rounded border flex items-center justify-between">
                  <span class="font-mono font-medium">640</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('640')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">IBAN</label>
                <div class="bg-yellow-50 p-3 rounded border border-yellow-300 flex items-center justify-between">
                  <span class="font-mono font-bold text-sm">TR98 0006 4000 0011 2345 6789 01</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard('TR98 0006 4000 0011 2345 6789 01')"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gönderilecek Tutar</label>
                <div class="bg-green-50 p-3 rounded border border-green-300 flex items-center justify-between">
                  <span class="font-bold text-lg text-green-800">{{ formatPrice(totalAmount) }}</span>
                  <button
                    class="text-blue-600 hover:text-blue-800"
                    @click="copyToClipboard(totalAmount.toString())"
                  >
                    <ClipboardIcon class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Description Field -->
          <div class="mt-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">EFT Açıklaması (Zorunlu)</label>
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
              ⚠️ EFT açıklaması kısmına yukarıdaki referans kodunu mutlaka yazınız.
            </p>
          </div>
        </div>

        <!-- EFT Fee Notice -->
        <div class="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-orange-800 mb-2 flex items-center">
            <CurrencyDollarIcon class="h-5 w-5 text-orange-600 mr-2" />
            EFT Ücreti Bildirimi
          </h3>
          <p class="text-sm text-orange-700">
            EFT işlemi için <strong>{{ formatPrice(eftFee) }}</strong> işlem ücreti uygulanmaktadır.
            Bu ücret toplam ödeme tutarına dahil edilmiştir.
          </p>
        </div>

        <!-- Instructions -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 class="text-lg font-semibold text-blue-800 mb-3 flex items-center">
            <InformationCircleIcon class="h-5 w-5 text-blue-600 mr-2" />
            EFT Talimatları
          </h3>
          <ol class="list-decimal list-inside space-y-2 text-sm text-blue-700">
            <li>Yukarıdaki hesap bilgilerine <strong>{{ formatPrice(totalAmount) }}</strong> EFT yapın</li>
            <li>EFT açıklaması kısmına <strong>mutlaka</strong> referans kodunu yazın</li>
            <li>EFT işlemini tamamladıktan sonra dekont/makbuzunu saklayın</li>
            <li>Ödeme onayı genellikle birkaç saat içinde gerçekleşir</li>
            <li>Onay aldıktan sonra siparişiniz/işleminiz tamamlanacaktır</li>
          </ol>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-4">
          <button
            :disabled="loading"
            class="flex-1 bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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
            {{ loading ? 'İşleniyor...' : 'EFT\'yi Yaptım' }}
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
          <PhoneIcon class="h-5 w-5 text-purple-600 mr-2" />
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
import { usePaymentConfirmService } from '~/services/api/PaymentService'
import {
  ArrowLeftIcon,
  CreditCardIcon,
  ClipboardIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowDownTrayIcon,
  PhoneIcon,
  CurrencyDollarIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'EFT ile Ödeme - E-Commerce Platform',
  meta: [
    { name: 'description', content: 'EFT ile hızlı ve güvenli ödeme yapın' }
  ]
})

// Route params
const route = useRoute()
const paymentConfirmService = usePaymentConfirmService()
const router = useRouter()

// State
const loading = ref(false)
const amount = ref(parseFloat(route.query.amount) || 0)
const eftFee = ref(2) // 2₺ EFT fee
const totalAmount = computed(() => amount.value + eftFee.value)
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
  return `EFT-${orderNumber.value || 'WAL'}-${timestamp}-${random}`
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
    const response = await paymentConfirmService.confirmEft({ amount: amount.value, eftFee: eftFee.value, totalAmount: totalAmount.value, orderNumber: orderNumber.value, reference: paymentReference.value })

    if (response.success) {
      toast.success('EFT bildirimi alındı! Ödemeniz onaylandıktan sonra bilgilendirileceksiniz.')

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
  const instructions = `
EFT ÖDEMESİ TALİMATLARI
======================

Ödenecek Tutar: ${formatPrice(amount.value)}
EFT Ücreti: ${formatPrice(eftFee.value)}
Toplam Tutar: ${formatPrice(totalAmount.value)}
${orderNumber.value ? `Sipariş No: ${orderNumber.value}` : ''}

HESAP BİLGİLERİ:
Banka: Türkiye İş Bankası
Alıcı: E-Commerce Platform Ltd. Şti.
Hesap No: 1234567890
Şube Kodu: 640
IBAN: TR98 0006 4000 0011 2345 6789 01

EFT AÇIKLAMASI:
${paymentReference.value}

ÖNEMLI NOTLAR:
1. EFT açıklaması kısmına yukarıdaki referans kodunu mutlaka yazınız
2. ${formatPrice(eftFee.value)} EFT ücreti toplam tutara dahildir
3. EFT işlemini tamamladıktan sonra dekont/makbuzunu saklayın
4. Ödeme onayı genellikle birkaç saat içinde gerçekleşir

Destek: 0850 XXX XX XX | destek@ecommerce.com
  `

  const blob = new Blob([instructions], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `eft-talimatlari-${paymentReference.value}.txt`
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