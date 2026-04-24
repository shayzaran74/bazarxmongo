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
            <HeroIcons.ArrowLeftIcon class="h-4 w-4 mr-1" />
            Siparişlerime Dön
          </NuxtLink>
          <div class="flex items-center gap-4">
            <h1
              v-if="order"
              class="text-3xl font-bold text-gray-900"
            >
              Sipariş Detayı #{{ order.orderNumber }}
            </h1>
          </div>
        </div>
        <div
          v-if="order"
          class="text-right"
        >
          <p class="text-sm text-gray-500">Sipariş Tarihi</p>
          <p class="font-bold text-gray-900">{{ formatDate(order.createdAt) }}</p>
        </div>
      </div>

      <div
        v-if="pending"
        class="flex justify-center py-24"
      >
        <div class="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>

      <div
        v-else-if="!order"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
      >
        <p class="text-gray-500">Sipariş bulunamadı.</p>
      </div>

      <div
        v-else
        class="space-y-8"
      >
        <!-- Order Stats Summary -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Genel Durum</p>
            <span :class="getStatusBadgeClass(order.status)">
              {{ getStatusText(order.status) }}
            </span>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Toplam Tutar</p>
            <p class="text-xl font-bold text-primary-600">
              {{ formatPrice(order.totalAmount || order.total || 0) }}
            </p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ödeme Metodu</p>
            <p class="font-bold text-gray-900 uppercase text-sm">
              {{ order.paymentMethod || 'Kredi Kartı' }}
            </p>
          </div>
        </div>

        <!-- Order Items -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 class="font-bold text-gray-900">Sipariş Verilen Ürünler</h2>
          </div>
          <div class="divide-y divide-gray-100">
            <div
              v-for="item in (order.orderItems || order.OrderItem || [])"
              :key="item.id"
              class="p-6"
            >
              <div class="flex flex-col md:flex-row gap-6">
                <div class="flex gap-4 items-center">
                  <div class="w-20 h-20 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                    <img
                      :src="resolveImageUrl(item.productImage || item.Listing?.CatalogProduct?.images?.[0])"
                      class="w-full h-full object-cover"
                    >
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 leading-tight mb-1">
                      {{ item.productName || item.Listing?.CatalogProduct?.name }}
                    </h3>
                    <p class="text-sm text-gray-500">Adet: {{ item.quantity }}</p>
                    <p class="text-sm font-bold text-primary-600">{{ formatPrice(item.price) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useOrderService } from '~/services/api/OrderService'
import { useAppImage } from '~/composables/useAppImage'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const route = useRoute()
const { resolveImageUrl } = useAppImage()
const orderService = useOrderService()

const { data: orderRes, pending } = await useAsyncData(
  `order-${route.params.id}`,
  () => orderService.getOrder(route.params.id as string)
)
const order = computed(() => orderRes.value?.data)

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const getStatusBadgeClass = (status: string) => {
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

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'Beklemede',
    'PROCESSING': 'Hazırlanıyor',
    'SHIPPED': 'Kargoya Verildi',
    'DELIVERED': 'Teslim Edildi',
    'CANCELLED': 'İptal Edildi'
  }
  return map[(status || '').toUpperCase()] || status
}
</script>
