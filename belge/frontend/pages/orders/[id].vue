<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <NuxtLink
            to="/orders"
            class="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center mb-2"
          >
            <ArrowLeftIcon class="h-4 w-4 mr-1" />
            Siparişlerime Dön
          </NuxtLink>
          <div class="flex items-center gap-4">
            <h1
              v-if="order"
              class="text-3xl font-bold text-gray-900"
            >
              Sipariş Detayı #{{ order.orderNumber }}
            </h1>
            <div
              v-if="order?.OrderReturn"
              class="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold ring-1 ring-red-200"
            >
              İade Talebi Açıldı ({{ getReturnStatusText(order.OrderReturn.status) }})
            </div>
            <button
              v-else-if="order?.status === 'DELIVERED'"
              class="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm transition-colors ring-1 ring-red-200 shadow-sm flex items-center"
              @click="openReturnModal"
            >
              <ExclamationTriangleIcon class="w-4 h-4 mr-2" />
              Siparişi İade Et
            </button>
          </div>
        </div>
        <div
          v-if="order"
          class="text-right"
        >
          <p class="text-sm text-gray-500">
            Sipariş Tarihi
          </p>
          <p class="font-bold text-gray-900">
            {{ formatDate(order.createdAt) }}
          </p>
        </div>
      </div>

      <div
        v-if="loading"
        class="flex justify-center py-24"
      >
        <div class="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>

      <div
        v-else-if="!order"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
      >
        <p class="text-gray-500">
          Sipariş bulunamadı.
        </p>
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <!-- Order Stats Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Genel Durum
            </p>
            <span :class="getStatusBadgeClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Toplam Tutar
            </p>
            <p class="text-xl font-bold text-primary-600">
              {{ formatPrice(order.totalAmount) }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Ödeme Metodu
            </p>
            <p class="font-bold text-gray-900 uppercase text-sm">
              {{ order.paymentMethod || 'Kredi Kartı' }}
            </p>
          </div>
        </div>

        <!-- Order Items with Trackers -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h2 class="font-bold text-gray-900">
              Sipariş Verilen Ürünler
            </h2>
            <span class="text-sm text-gray-500">{{ order.OrderItem.length }} Ürün</span>
          </div>

          <div class="divide-y divide-gray-100">
            <div
              v-for="item in order.OrderItem"
              :key="item.id"
              class="p-6"
            >
              <div class="flex flex-col md:flex-row gap-6">
                <!-- Product Info -->
                <div class="flex gap-4 md:w-1/3">
                  <div class="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      :src="resolveImageUrl(item.Listing?.CatalogProduct?.images?.[0])"
                      :alt="item.Listing?.CatalogProduct?.name"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 leading-tight mb-1">
                      {{ item.Listing?.CatalogProduct?.name }}
                    </h3>
                    <p class="text-sm text-gray-500">
                      Adet: {{ item.quantity }}
                    </p>
                    <p class="text-sm font-bold text-primary-600">
                      {{ formatPrice(item.price) }}
                    </p>
                  </div>
                </div>

                <!-- Individual Item Status Tracker -->
                <div class="flex-1">
                  <!-- Stepper Design for individual item -->
                  <div class="relative flex items-center justify-between mb-2 px-2">
                    <div class="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-0.5 bg-gray-100" />
                    <div
                      class="absolute left-8 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 transition-all duration-500"
                      :style="{ width: getTrackerWidth(item.status) }"
                    />

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                          ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes((item.status || '').toUpperCase())
                            ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'
                        ]"
                      >
                        <CheckIcon
                          v-if="true"
                          class="h-3 w-3 text-white"
                        />
                      </div>
                      <span class="text-[10px] font-bold mt-1 text-gray-500">Alındı</span>
                    </div>

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                          ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes((item.status || '').toUpperCase())
                            ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'
                        ]"
                      >
                        <CheckIcon
                          v-if="(item.status || '').toUpperCase() !== 'PENDING'"
                          class="h-3 w-3 text-white"
                        />
                      </div>
                      <span class="text-[10px] font-bold mt-1 text-gray-500">Hazırlanıyor</span>
                    </div>

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                          ['SHIPPED', 'DELIVERED'].includes((item.status || '').toUpperCase())
                            ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'
                        ]"
                      >
                        <CheckIcon
                          v-if="['SHIPPED', 'DELIVERED'].includes((item.status || '').toUpperCase())"
                          class="h-3 w-3 text-white"
                        />
                      </div>
                      <span class="text-[10px] font-bold mt-1 text-gray-500">Kargoda</span>
                    </div>

                    <div class="relative z-10 flex flex-col items-center">
                      <div
                        :class="[
                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-colors duration-300',
                          (item.status || '').toUpperCase() === 'DELIVERED'
                            ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'
                        ]"
                      >
                        <CheckIcon
                          v-if="(item.status || '').toUpperCase() === 'DELIVERED'"
                          class="h-3 w-3 text-white"
                        />
                      </div>
                      <span class="text-[10px] font-bold mt-1 text-gray-500">Teslim</span>
                    </div>
                  </div>

                  <!-- Individual Tracking Info -->
                  <div
                    v-if="item.trackingNumber"
                    class="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                  >
                    <div class="flex items-center space-x-3">
                      <TruckIcon class="h-5 w-5 text-primary-500" />
                      <div>
                        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Kargo Bilgisi
                        </p>
                        <p class="text-xs font-bold text-gray-900">
                          {{ item.shippingCarrier }}: {{ item.trackingNumber }}
                        </p>
                      </div>
                    </div>
                    <a
                      href="#"
                      class="text-xs font-bold text-primary-600 hover:underline"
                      @click.prevent="openTracking(item)"
                    >Takip Et</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Address & Payment Summary -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center">
              <MapPinIcon class="h-5 w-5 mr-2 text-gray-400" />
              Teslimat Adresi
            </h3>
            <div
              v-if="parsedAddress"
              class="text-sm text-gray-600 space-y-1"
            >
              <p class="font-bold text-gray-900">
                {{ parsedAddress.fullName }}
              </p>
              <p>{{ parsedAddress.address }}</p>
              <p>{{ parsedAddress.district }} / {{ parsedAddress.city }}</p>
              <p>{{ parsedAddress.phone }}</p>
            </div>
            <p
              v-else
              class="text-sm text-gray-500"
            >
              {{ order.shippingAddress }}
            </p>
          </div>

          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon class="h-5 w-5 mr-2 text-gray-400" />
              Ödeme Özeti
            </h3>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-500">
                <span>Ara Toplam</span>
                <span>{{ formatPrice(order.totalAmount) }}</span>
              </div>
              <div class="flex justify-between text-gray-500">
                <span>Kargo</span>
                <span class="text-green-600 font-medium">Ücretsiz</span>
              </div>
              <div class="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-lg">
                <span>Toplam</span>
                <span>{{ formatPrice(order.totalAmount) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- BazarX Logi-Shield Return Form Modal -->
    <div
      v-if="isReturnModalOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="closeReturnModal"
        />
        <span
          class="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >&#8203;</span>

        <div
          class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full"
        >
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div
                class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"
              >
                <ExclamationTriangleIcon
                  class="h-6 w-6 text-red-600"
                  aria-hidden="true"
                />
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3
                  id="modal-title"
                  class="text-lg leading-6 font-bold text-gray-900"
                >
                  Logi-Shield İade Talebi Oluştur
                </h3>
                <div class="mt-2 text-sm text-gray-500 mb-4">
                  BazarX platformunda gereksiz iadeleri (sebepsiz caymaları) engellemek adına çift taraflı Lojistik
                  Bariyeri aktiftir. Lütfen iade sebebinizi çok dikkatli seçin.
                </div>

                <div class="space-y-4">
                  <div>
                    <label class="block text-sm font-bold text-gray-700 mb-1">İade Sebebiniz</label>
                    <select
                      v-model="returnReason"
                      class="block w-full rounded-xl border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-2 px-3 border bg-gray-50"
                    >
                      <option
                        value=""
                        disabled
                      >
                        Lütfen Bir Sebep Seçin
                      </option>
                      <option value="KUSURLU">
                        Ürün Kusurlu/Bozuk Geldi
                      </option>
                      <option value="YANLIS_URUN">
                        Yanlış Ürün Gönderildi
                      </option>
                      <option value="SEBEPSIZ">
                        Sebepsiz İade (Cayma Hakkı)
                      </option>
                    </select>
                  </div>

                  <!-- Logi-Shield Warning Area -->
                  <div
                    v-if="returnReason === 'SEBEPSIZ'"
                    class="bg-orange-50 p-4 rounded-xl border border-orange-200"
                  >
                    <p class="text-sm font-bold text-orange-800 mb-1 flex items-center">
                      <ExclamationTriangleIcon class="h-4 w-4 mr-1" />
                      DİKKAT: Alıcı Sorumluluğu (Logi-Shield)
                    </p>
                    <p class="text-xs text-orange-700">
                      "Sebepsiz iade" seçeneğini kullandığınız için, BazarX kuralları gereği gidiş ve dönüş kargo taşıma
                      bedelleri sizden kesilecektir.
                    </p>
                    <div
                      v-if="logisticInfo"
                      class="mt-2 pt-2 border-t border-orange-200 text-sm font-bold flex justify-between text-orange-900"
                    >
                      <span>Tahmini Gönderi/İade Kesintisi:</span>
                      <span>{{ formatPrice(Number(logisticInfo.forwardFeeStandard) +
                        Number(logisticInfo.returnFeeStandard)) }}</span>
                    </div>
                  </div>

                  <div
                    v-else-if="['KUSURLU', 'YANLIS_URUN'].includes(returnReason)"
                    class="bg-blue-50 p-4 rounded-xl border border-blue-200"
                  >
                    <p class="text-sm font-bold text-blue-800 mb-1">
                      Ücretsiz İade Garantisi
                    </p>
                    <p class="text-xs text-blue-700">
                      Satıcıdan kaynaklı sorunlarda kargo bedelini satıcı öder. Ancak
                      kanıt için "Gözetim Kulesi" talebe bakacaktır.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-2xl">
            <button
              type="button"
              :disabled="isSubmittingReturn || !returnReason"
              class="w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-bold text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              @click="submitReturn"
            >
              {{ isSubmittingReturn ? 'İşleniyor...' : 'Kabul Ediyorum, Talebi Aç' }}
            </button>
            <button
              type="button"
              class="mt-3 w-full inline-flex justify-center rounded-xl border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
              @click="closeReturnModal"
            >
              Vazgeç
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeftIcon,
  MapPinIcon,
  CreditCardIcon,
  TruckIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/solid'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { resolveImageUrl } = useAppImage()
const order = ref(null)
const loading = ref(true)

// Return Modal State
const isReturnModalOpen = ref(false)
const isSubmittingReturn = ref(false)
const returnReason = ref('')
const logisticInfo = ref(null)
const toast = useNuxtApp().$toast

const fetchOrder = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api(`/api/orders/${route.params.id}`)
    if (response.success) {
      order.value = response.data
    }
  } catch (err) {
    console.error('Fetch order error:', err)
  } finally {
    loading.value = false
  }
}

const fetchLogisticSystem = async () => {
  try {
    const { $api } = useApi()
    const res = await $api('/api/returns/logistic-system')
    if (res.success) {
      logisticInfo.value = res.data
    }
  } catch (e) { console.error('Logistic DB error:', e) }
}

const openReturnModal = () => {
  returnReason.value = ''
  isReturnModalOpen.value = true
  if (!logisticInfo.value) {
    fetchLogisticSystem()
  }
}

const closeReturnModal = () => {
  isReturnModalOpen.value = false
}

const submitReturn = async () => {
  if (!returnReason.value) return

  isSubmittingReturn.value = true
  try {
    const { $api } = useApi()
    const res = await $api('/api/returns', {
      method: 'POST',
      body: {
        orderId: order.value.id,
        reason: returnReason.value
      }
    })

    if (res.success) {
      toast.success(res.message || 'İade talebi başarıyla oluşturuldu.')
      await fetchOrder() // Update UI state
      closeReturnModal()
    } else {
      toast.error(res.error || 'İade sırasında bir hata oluştu.')
    }
  } catch (e) {
    toast.error('Bağlantı hatası yaşandı.')
  } finally {
    isSubmittingReturn.value = false
  }
}

const parsedAddress = computed(() => {
  if (!order.value?.shippingAddress) return null
  try {
    return JSON.parse(order.value.shippingAddress)
  } catch (e) {
    return null
  }
})

const getTrackerWidth = (status) => {
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'PENDING': return '0%'
    case 'PROCESSING': return '33%'
    case 'SHIPPED': return '66%'
    case 'DELIVERED': return '100%'
    default: return '0%'
  }
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const getStatusBadgeClass = (status) => {
  const base = 'px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider'
  const s = (status || '').toUpperCase()
  switch (s) {
    case 'PENDING': return `${base} bg-orange-100 text-orange-700`
    case 'PROCESSING': return `${base} bg-blue-100 text-blue-700`
    case 'SHIPPED': return `${base} bg-purple-100 text-purple-700`
    case 'DELIVERED': return `${base} bg-green-100 text-green-700`
    case 'CANCELLED': return `${base} bg-red-100 text-red-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

const getStatusText = (status) => {
  const map = {
    'PENDING': 'Beklemede',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi'
  }
  return map[(status || '').toUpperCase()] || status
}

const getReturnStatusText = (status) => {
  const map = {
    'PENDING': 'Bekliyor',
    'APPROVED': 'İade Onaylandı',
    'REJECTED': 'Reddedildi',
    'IN_WATCHTOWER': 'Gözetim Kulesinde İnceleniyor'
  }
  return map[(status || '').toUpperCase()] || status
}

const openTracking = (item) => {
  const toast = useNuxtApp().$toast
  toast.info(`${item.shippingCarrier} sayfasına yönlendiriliyorsunuz...`)
}

onMounted(() => {
  fetchOrder()
})
</script>
