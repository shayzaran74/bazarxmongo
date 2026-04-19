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
              💳 Kredi Kartı ile Ödeme
            </h1>
            <p class="text-gray-600 mt-1">
              Güvenli ve anında ödeme
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
          <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            Kredi Kartı
          </span>
        </div>

        <!-- Amount Display -->
        <div class="bg-green-50 rounded-lg p-4 mb-6">
          <div class="text-center">
            <p class="text-sm text-gray-600 mb-1">
              Ödenecek Tutar
            </p>
            <div class="space-y-1">
              <p class="text-2xl font-bold text-green-600">
                {{ formatPrice(amount) }}
              </p>
              <p class="text-sm text-orange-600 font-medium">
                + {{ formatPrice(cardFee) }} İşlem Ücreti (%3 + 1₺)
              </p>
              <div class="border-t border-green-200 pt-2 mt-2">
                <p class="text-3xl font-bold text-green-800">
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

        <!-- Credit Card Form -->
        <form
          class="space-y-6"
          @submit.prevent="processPayment"
        >
          <!-- Card Number -->
          <div>
            <label
              for="cardNumber"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Kart Numarası
            </label>
            <div class="relative">
              <input
                id="cardNumber"
                v-model="cardForm.number"
                type="text"
                maxlength="19"
                placeholder="1234 5678 9012 3456"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono"
                required
                @input="formatCardNumber"
              >
              <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                <img
                  v-if="cardBrand"
                  :src="getCardBrandImage(cardBrand)"
                  :alt="cardBrand"
                  class="h-8"
                >
                <CreditCardIcon
                  v-else
                  class="h-6 w-6 text-gray-400"
                />
              </div>
            </div>
          </div>

          <!-- Card Holder Name -->
          <div>
            <label
              for="cardName"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              Kart Sahibi Adı
            </label>
            <input
              id="cardName"
              v-model="cardForm.name"
              type="text"
              placeholder="AD SOYAD"
              class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg uppercase"
              required
            >
          </div>

          <!-- Expiry and CVV -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label
                for="cardExpiry"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                Son Kullanma Tarihi
              </label>
              <input
                id="cardExpiry"
                v-model="cardForm.expiry"
                type="text"
                maxlength="5"
                placeholder="MM/YY"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono text-center"
                required
                @input="formatExpiry"
              >
            </div>
            <div>
              <label
                for="cardCvv"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                CVV
              </label>
              <input
                id="cardCvv"
                v-model="cardForm.cvv"
                type="text"
                maxlength="4"
                placeholder="123"
                class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-mono text-center"
                required
              >
            </div>
          </div>

          <!-- Installment Options -->
          <div v-if="totalAmount >= 100">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Taksit Seçenekleri
            </label>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                v-for="installment in installmentOptions"
                :key="installment.count"
                type="button"
                class="p-3 border rounded-lg text-center transition-colors"
                :class="{
                  'border-green-500 bg-green-50 text-green-700': selectedInstallment.count === installment.count,
                  'border-gray-300 hover:border-gray-400': selectedInstallment.count !== installment.count
                }"
                @click="selectedInstallment = installment"
              >
                <div class="font-medium">
                  {{ installment.count }}x
                </div>
                <div class="text-sm text-gray-600">
                  {{ formatPrice(installment.amount) }}
                </div>
              </button>
            </div>
            <p
              v-if="selectedInstallment.count > 1"
              class="text-sm text-gray-600 mt-2"
            >
              {{ selectedInstallment.count }} taksit ile toplam {{ formatPrice(selectedInstallment.total) }}
            </p>
          </div>

          <!-- Security Information -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 class="text-sm font-semibold text-blue-800 mb-2 flex items-center">
              <ShieldCheckIcon class="h-4 w-4 text-blue-600 mr-2" />
              Güvenlik Bilgileri
            </h3>
            <ul class="text-sm text-blue-700 space-y-1">
              <li>• 256-bit SSL şifreleme ile korumalı</li>
              <li>• 3D Secure doğrulama</li>
              <li>• PCI DSS sertifikalı</li>
              <li>• Kart bilgileriniz saklanmaz</li>
            </ul>
          </div>

          <!-- Terms and Conditions -->
          <div class="flex items-center">
            <input
              id="terms"
              v-model="acceptTerms"
              type="checkbox"
              class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              required
            >
            <label
              for="terms"
              class="ml-2 block text-sm text-gray-700"
            >
              <span class="text-blue-600">Kullanım Koşulları</span>
              ve
              <span class="text-blue-600">Gizlilik Politikası</span>
              'nı kabul ediyorum
            </label>
          </div>

          <!-- Payment Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="w-full bg-green-600 text-white font-bold py-4 px-6 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center text-lg"
          >
            <CreditCardIcon
              v-if="!loading"
              class="h-6 w-6 mr-2"
            />
            <svg
              v-else
              class="animate-spin h-6 w-6 mr-2"
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
            {{ loading ? 'İşleniyor...' : `${formatPrice(selectedInstallment.total)} Öde` }}
          </button>
        </form>
      </div>

      <!-- Support Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <PhoneIcon class="h-5 w-5 text-green-600 mr-2" />
          Yardıma mı ihtiyacınız var?
        </h3>
        <div class="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p class="font-medium mb-2">
              📞 Telefon Desteği
            </p>
            <p>0850 XXX XX XX</p>
            <p class="text-xs text-gray-500">
              7/24 destek
            </p>
          </div>
          <div>
            <p class="font-medium mb-2">
              📧 E-posta Desteği
            </p>
            <p>destek@ecommerce.com</p>
            <p class="text-xs text-gray-500">
              Anında yanıt
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
  ShieldCheckIcon,
  PhoneIcon
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Kredi Kartı ile Ödeme - E-Commerce Platform',
  meta: [
    { name: 'description', content: 'Kredi kartı ile güvenli ödeme yapın' }
  ]
})

// Route params
const route = useRoute()
const paymentConfirmService = usePaymentConfirmService()
const router = useRouter()

// State
const loading = ref(false)
const amount = ref(parseFloat(route.query.amount) || 0)
const cardFee = computed(() => Math.ceil(amount.value * 0.03) + 1) // 3% + 1₺
const totalAmount = computed(() => amount.value + cardFee.value)
const orderNumber = ref(route.query.orderNumber || '')
const acceptTerms = ref(false)

const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvv: ''
})

const cardBrand = ref('')

const selectedInstallment = ref({
  count: 1,
  amount: 0,
  total: 0
})

// Composables
const toast = useNuxtApp().$toast

// Computed
const installmentOptions = computed(() => {
  const options = [
    { count: 1, amount: totalAmount.value, total: totalAmount.value }
  ]

  if (totalAmount.value >= 100) {
    options.push(
      { count: 3, amount: totalAmount.value / 3, total: totalAmount.value },
      { count: 6, amount: totalAmount.value / 6, total: totalAmount.value },
      { count: 12, amount: totalAmount.value / 12, total: totalAmount.value }
    )
  }

  return options
})

const isFormValid = computed(() => {
  return cardForm.value.number.replace(/\s/g, '').length >= 16 &&
    cardForm.value.name.length >= 3 &&
    cardForm.value.expiry.length === 5 &&
    cardForm.value.cvv.length >= 3 &&
    acceptTerms.value
})

// Methods
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const formatCardNumber = () => {
  let value = cardForm.value.number.replace(/\s/g, '')
  value = value.replace(/[^0-9]/g, '')
  value = value.substring(0, 16)
  value = value.replace(/(.{4})/g, '$1 ')
  cardForm.value.number = value.trim()

  // Detect card brand
  const firstDigit = value.charAt(0)
  if (firstDigit === '4') {
    cardBrand.value = 'visa'
  } else if (firstDigit === '5') {
    cardBrand.value = 'mastercard'
  } else if (firstDigit === '3') {
    cardBrand.value = 'amex'
  } else {
    cardBrand.value = ''
  }
}

const formatExpiry = () => {
  let value = cardForm.value.expiry.replace(/[^0-9]/g, '')
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  cardForm.value.expiry = value
}

const getCardBrandImage = (brand) => {
  const images = {
    visa: '/images/cards/visa.png',
    mastercard: '/images/cards/mastercard.png',
    amex: '/images/cards/amex.png'
  }
  return images[brand] || '/images/cards/generic.png'
}

const processPayment = async () => {
  loading.value = true

  try {
    const paymentData = {
      amount: amount.value,
      cardFee: cardFee.value,
      totalAmount: selectedInstallment.value.total,
      orderNumber: orderNumber.value,
      installments: selectedInstallment.value.count,
      card: {
        number: cardForm.value.number.replace(/\s/g, ''),
        name: cardForm.value.name,
        expiry: cardForm.value.expiry,
        cvv: cardForm.value.cvv,
        brand: cardBrand.value
      }
    }

    const response = await paymentConfirmService.processCreditCard(paymentData)

    if (response.success) {
      if (response.requires3DS) {
        // Redirect to 3D Secure
        window.location.href = response.redirectUrl
      } else {
        toast.success('Ödeme başarıyla tamamlandı!')

        // Redirect based on context
        if (orderNumber.value) {
          await router.push(`/orders/${orderNumber.value}?success=true`)
        } else {
          await router.push('/wallet?success=true')
        }
      }
    } else {
      throw new Error(response.error || 'Ödeme işlemi başarısız')
    }

  } catch (error) {
    toast.error(error.message || 'Ödeme işlemi sırasında bir hata oluştu')
  } finally {
    loading.value = false
  }
}

// Initialize
onMounted(() => {
  if (!amount.value || amount.value <= 0) {
    toast.error('Geçersiz ödeme tutarı')
    router.back()
    return
  }

  selectedInstallment.value = installmentOptions.value[0]
})

// Watch for installment changes
watch(totalAmount, () => {
  selectedInstallment.value = installmentOptions.value[0]
})
</script>