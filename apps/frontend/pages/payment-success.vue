<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Loading state -->
      <div
        v-if="loading"
        class="text-center"
      >
        <div class="spinner h-12 w-12 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900">
          Ödemeniz kontrol ediliyor...
        </h2>
        <p class="text-gray-600 mt-2">
          Lütfen bekleyin
        </p>
      </div>

      <!-- Success state -->
      <div
        v-else-if="paymentStatus === 'succeeded'"
        class="text-center"
      >
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircleIcon class="w-10 h-10 text-green-600" />
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Ödeme Başarılı! 🎉
        </h1>
        <p class="text-gray-600 mb-8">
          Siparişiniz başarıyla oluşturuldu ve ödemeniz alındı.
        </p>
        
        <!-- Order Details -->
        <div
          v-if="orderData"
          class="bg-white rounded-lg shadow-sm p-6 mb-8 text-left"
        >
          <h2 class="text-xl font-semibold text-gray-900 mb-4">
            Sipariş Detayları
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium text-gray-900">Sipariş No:</span>
              <span class="text-gray-600 ml-2">{{ orderData.orderId }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-900">Durum:</span>
              <span class="text-green-600 ml-2">{{ orderData.status }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-900">Toplam:</span>
              <span class="text-gray-600 ml-2">{{ formatPrice(paymentData.amount, !paymentData.isWallet) }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-900">Para Birimi:</span>
              <span class="text-gray-600 ml-2">{{ paymentData.currency?.toUpperCase() }}</span>
            </div>
          </div>
          
          <div class="mt-4 p-3 bg-green-50 rounded-lg">
            <p class="text-sm text-green-800">
              <InformationCircleIcon class="w-4 h-4 inline mr-1" />
              Siparişiniz işleme alındı. Kargo detayları e-posta adresinize gönderilecek.
            </p>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="space-y-4">
          <NuxtLink
            to="/orders"
            class="btn-primary btn-lg w-full sm:w-auto"
          >
            Siparişlerimi Görüntüle
          </NuxtLink>
          
          <div class="sm:ml-4">
            <NuxtLink
              to="/products"
              class="btn-outline btn-lg w-full sm:w-auto"
            >
              Alışverişe Devam Et
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Error state -->
      <div
        v-else
        class="text-center"
      >
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircleIcon class="w-10 h-10 text-red-600" />
        </div>
        
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          Ödeme Başarısız
        </h1>
        <p class="text-gray-600 mb-8">
          {{ errorMessage || 'Ödeme işleminizde bir sorun oluştu.' }}
        </p>
        
        <!-- Action Buttons -->
        <div class="space-y-4">
          <NuxtLink
            to="/checkout"
            class="btn-primary btn-lg w-full sm:w-auto"
          >
            Tekrar Dene
          </NuxtLink>
          
          <div class="sm:ml-4">
            <NuxtLink
              to="/cart"
              class="btn-outline btn-lg w-full sm:w-auto"
            >
              Sepete Dön
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useOrderService } from '~/services/api/OrderService'
import { usePaymentConfirmService } from '~/services/api/PaymentService'
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

// Layout
definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

// Page meta
useHead({
  title: 'Ödeme Sonucu - E-Commerce Platform',
  meta: [
    {
      name: 'description',
      content: 'Ödeme işlem sonucu'
    }
  ]
})

// Stores
const orderService = useOrderService()
const paymentConfirmService = usePaymentConfirmService()
const cartStore = useCartStore()

// State
const loading = ref(true)
const paymentStatus = ref('')
const paymentData = ref(null)
const orderData = ref(null)
const errorMessage = ref('')

// Methods
const formatPrice = (price, isCents = true) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(isCents ? price / 100 : price)
}

const checkPaymentStatus = async () => {
  try {
    const route = useRoute()
    const paymentIntentId = route.query.payment_intent
    const isWallet = route.query.type === 'wallet'
    const walletOrderId = route.query.orderId

    if (isWallet && walletOrderId) {
      paymentStatus.value = 'succeeded'
      try {
        const orderResponse = await orderService.getOrder(walletOrderId)
        
        if (orderResponse.success) {
          const order = orderResponse.data
          orderData.value = {
            orderId: order.orderNumber,
            status: 'Ödendi'
          }
          // Handle Money object or plain number
          const amount = order.totalAmount?.amount ?? order.totalAmount ?? 0
          paymentData.value = {
            amount: Number(amount),
            currency: 'try',
            isWallet: true
          }
          loading.value = false
          return
        } else {
          console.error('Order fetch failed:', orderResponse.error)
        }
      } catch (err) {
        console.error('Error fetching order details for wallet payment:', err)
      }
      
      // Fallback if order details can't be fetched
      paymentData.value = { amount: 0, currency: 'try', isWallet: true }
      loading.value = false
      return
    }

    // Stripe payment intent check
    if (!isWallet && !paymentIntentId) {
      throw new Error('Ödeme bilgisi bulunamadı')
    }

    // Get payment status from backend
    const paymentResponse = isWallet
      ? await orderService.getOrder(walletOrderId)
      : await orderService.getPaymentStatus(paymentIntentId) 

    if (!paymentResponse.success) {
      throw new Error(paymentResponse.error || 'Ödeme durumu doğrulanamadı')
    }

    const remoteStatus = isWallet 
      ? (['COMPLETED', 'PAID'].includes(paymentResponse.data?.status) ? 'succeeded' : paymentResponse.data?.status)
      : paymentResponse.data?.status;

    if (remoteStatus === 'succeeded' || remoteStatus === 'processing') {
      paymentData.value = paymentResponse.data
      paymentStatus.value = remoteStatus

      if (remoteStatus === 'succeeded') {
        // Confirm payment on backend if not wallet (wallet orders are completed immediately)
        if (!isWallet) {
          const confirmResponse = await paymentConfirmService.confirmPayment(paymentIntentId) 

          if (confirmResponse.success) {
            orderData.value = confirmResponse.data
            // Refresh cart to clear items
            await cartStore.fetchCart()
          } else {
            throw new Error(confirmResponse.error || 'Sipariş onaylanırken bir hata oluştu')
          }
        } else {
          // For wallet, we have the order data from the first fetch
          orderData.value = {
            orderId: paymentResponse.data.orderNumber,
            status: 'Ödendi'
          }
          await cartStore.fetchCart()
        }
      } 
    } else {
      throw new Error('Ödeme başarısız oldu veya bekleniyor')
    }

  } catch (error) {
    console.error('Payment status check error:', error)
    paymentStatus.value = 'failed'
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(async () => {
  await checkPaymentStatus()
})
</script>