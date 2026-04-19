<template>
  <div class="bg-white p-6 rounded-lg shadow-md">
    <h3 class="text-lg font-semibold mb-4">
      💳 Stripe ile Ödeme
    </h3>
    
    <div
      v-if="!stripeLoaded"
      class="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center"
    >
      <div class="text-gray-600 mb-2">
        <CreditCardIcon class="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p class="text-sm">
          Stripe yükleniyor...
        </p>
      </div>
    </div>
    
    <!-- Stripe Payment Form -->
    <div
      v-else
      class="space-y-4"
    >
      <div class="p-4 border border-gray-200 rounded-lg">
        <div class="text-gray-600 mb-2">
          <CreditCardIcon class="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p class="text-sm">
            Stripe Ödeme Formu
          </p>
          <p class="text-xs text-gray-500 mt-1">
            Güvenli ödeme için kart bilgilerinizi giriniz
          </p>
        </div>
        
        <!-- Stripe Elements Container -->
        <div
          id="card-element"
          class="p-3 border border-gray-300 rounded-md bg-white"
        >
          <!-- Stripe Elements will be mounted here -->
        </div>
        
        <div
          v-if="cardError"
          class="mt-2 text-sm text-red-600"
        >
          {{ cardError }}
        </div>
      </div>
      
      <!-- Payment Amount -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Ödeme Tutarı
        </label>
        <div class="relative">
          <input
            v-model.number="amount"
            type="number"
            min="1"
            step="0.01"
            class="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="100.00"
          >
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span class="text-gray-500">₺</span>
          </div>
        </div>
      </div>
      
      <!-- Payment Button -->
      <button
        :disabled="loading || !amount || amount < 1 || !cardComplete"
        class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        @click="handlePayment"
      >
        <span
          v-if="loading"
          class="flex items-center justify-center"
        >
          <svg
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
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
          İşleniyor...
        </span>
        <span v-else>
          {{ formatPrice(amount) }} Öde
        </span>
      </button>
      
      <!-- Success/Error Messages -->
      <div
        v-if="message"
        class="p-4 rounded-lg"
        :class="messageClass"
      >
        <p class="text-sm">
          {{ message }}
        </p>
      </div>
      
      <!-- Environment Info -->
      <div class="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 class="text-sm font-semibold text-blue-900 mb-2">
          ℹ️ Test Modu
        </h4>
        <ul class="text-sm text-blue-800 space-y-1">
          <li>• Test kartı: 4242 4242 4242 4242</li>
          <li>• Herhangi bir gelecek tarih</li>
          <li>• Herhangi bir CVC kodu</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, useNuxtApp, useRuntimeConfig } from '#imports'
import CreditCardIcon from '@heroicons/vue/24/outline/CreditCardIcon'

// Props
const props = defineProps({
  initialAmount: {
    type: Number,
    default: 100
  }
})

// Emits
const emit = defineEmits(['payment-success', 'payment-error'])

// State
const amount = ref(props.initialAmount)
const loading = ref(false)
const message = ref('')
const messageType = ref('') // 'success' or 'error'
const stripeLoaded = ref(false)
const cardError = ref('')
const cardComplete = ref(false)

// Stripe instances
let stripe = null
let elements = null

// Computed
const messageClass = computed(() => {
  return messageType.value === 'success' 
    ? 'bg-green-50 border border-green-200 text-green-800'
    : 'bg-red-50 border border-red-200 text-red-800'
})

// Methods
const formatPrice = (price) => {
  if (!price) return '0,00₺'
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const initializeStripe = async () => {
  try {
    const { $stripe } = useNuxtApp()
    stripe = $stripe
    
    if (!stripe) {
      throw new Error('Stripe yüklenemedi')
    }
    
    // Create Elements instance
    elements = stripe.elements({
      locale: 'tr'
    })
    
    // Create card element
    const cardElement = elements.create('card', {
      style: {
        base: {
          fontSize: '16px',
          color: '#374151',
          '::placeholder': {
            color: '#9CA3AF'
          }
        },
        invalid: {
          color: '#EF4444'
        }
      },
      hidePostalCode: true
    })
    
    // Mount card element
    cardElement.mount('#card-element')
    
    // Listen for changes
    cardElement.on('change', (event) => {
      cardError.value = event.error ? event.error.message : ''
      cardComplete.value = event.complete
    })
    
    stripeLoaded.value = true
    
  } catch (error) {
    console.error('Stripe initialization error:', error)
    showMessage('Stripe yüklenirken bir hata oluştu.', 'error')
  }
}

const handlePayment = async () => {
  if (!amount.value || amount.value < 1) {
    showMessage('Geçerli bir tutar giriniz.', 'error')
    return
  }

  if (!stripe || !elements) {
    showMessage('Stripe henüz yüklenmedi.', 'error')
    return
  }

  loading.value = true
  message.value = ''

  try {
    // Create payment intent on the server
    const { data } = await $fetch('/api/payments/create-intent', {
      method: 'POST',
      baseURL: useRuntimeConfig().public.apiBase,
      body: {
        amount: Math.round(amount.value * 100), // Convert to cents
        currency: 'try'
      }
    })
    
    if (!data.success) {
      throw new Error(data.error || 'Ödeme oluşturulamadı')
    }
    
    const { client_secret } = data.data
    
    // Confirm payment
    const { error: paymentError } = await stripe.confirmCardPayment(client_secret, {
      payment_method: {
        card: elements.getElement('card'),
        billing_details: {
          name: 'Müşteri'
        }
      }
    })
    
    if (paymentError) {
      throw new Error(paymentError.message)
    }
    
    showMessage(`${formatPrice(amount.value)} tutarında ödeme başarıyla tamamlandı!`, 'success')
    emit('payment-success', { amount: amount.value })
    
    // Reset form
    amount.value = props.initialAmount
    
  } catch (error) {
    console.error('Payment error:', error)
    showMessage('Ödeme işlemi başarısız oldu. Lütfen tekrar deneyin.', 'error')
    emit('payment-error', error)
  } finally {
    loading.value = false
  }
}

const showMessage = (text, type) => {
  message.value = text
  messageType.value = type
  
  // Auto clear message after 5 seconds
  setTimeout(() => {
    message.value = ''
    messageType.value = ''
  }, 5000)
}

// Composable for toast notifications
const toast = useNuxtApp().$toast

watch(message, (newMessage) => {
  if (newMessage && messageType.value === 'success') {
    toast.success(newMessage)
  } else if (newMessage && messageType.value === 'error') {
    toast.error(newMessage)
  }
})

// Lifecycle
onMounted(() => {
  nextTick(() => {
    initializeStripe()
  })
})
</script>