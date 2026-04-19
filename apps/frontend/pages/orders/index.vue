<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">
        Siparişlerim
      </h1>

      <div
        v-if="pending"
        class="flex justify-center py-12"
      >
        <div class="animate-spin h-10 w-10 border-4 border-primary-500 border-t-transparent rounded-full" />
      </div>

      <div
        v-else-if="orders.length === 0"
        class="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-200"
      >
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBagIcon class="h-8 w-8 text-gray-400" />
        </div>
        <h2 class="text-xl font-bold text-gray-900 mb-2">
          Henüz siparişiniz yok
        </h2>
        <p class="text-gray-500 mb-6">
          Harika ürünlerimize göz atarak ilk siparişinizi verebilirsiniz.
        </p>
        <NuxtLink
          to="/products"
          class="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition"
        >
          Alışverişe Başla
        </NuxtLink>
      </div>

      <div
        v-else
        class="space-y-6"
      >
        <div
          v-for="order in orders"
          :key="order.id"
          class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div class="p-6">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-primary-50 rounded-xl">
                  <ShoppingBagIcon class="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Sipariş No
                  </p>
                  <p class="font-bold text-gray-900 text-lg">
                    #{{ order.orderNumber }}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Tarih
                </p>
                <p class="text-gray-900 font-medium">
                  {{ formatDate(order.createdAt) }}
                </p>
              </div>
              <div class="flex items-center space-x-3">
                <span :class="getStatusBadgeClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
                <NuxtLink
                  :to="`/orders/${order.id}`"
                  class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                >
                  <ChevronRightIcon class="h-6 w-6" />
                </NuxtLink>
              </div>
            </div>

            <div class="border-t border-gray-100 pt-6">
              <div class="flex items-center justify-between">
                <div class="flex -space-x-3 overflow-hidden">
                  <template v-if="order.OrderItem && order.OrderItem.length > 0">
                    <img
                      v-for="item in order.OrderItem.slice(0, 4)"
                      :key="item.id"
                      :src="resolveImageUrl(item.productImage || (item.Listing?.CatalogProduct?.images?.[0])) || 'https://placehold.co/100x100?text=Ürün'"
                      class="inline-block h-12 w-12 rounded-full ring-4 ring-white object-cover bg-gray-50"
                    >
                    <div
                      v-if="order.OrderItem.length > 4"
                      class="inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500 ring-4 ring-white"
                    >
                      +{{ order.OrderItem.length - 4 }}
                    </div>
                  </template>
                  <div
                    v-else
                    class="text-xs text-gray-400 italic py-2"
                  >
                    Ürün detayı bulunamadı
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm text-gray-500">
                    Toplam Tutar
                  </p>
                  <p class="text-xl font-bold text-primary-600">
                    {{ formatPrice(order.totalAmount || order.total || 0) }}
                  </p>
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
import { ShoppingBagIcon, ChevronRightIcon, TruckIcon } from '@heroicons/vue/24/outline'
import { useOrderService } from '~/services/api/OrderService'
import { useAppImage } from '~/composables/useAppImage'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { resolveImageUrl } = useAppImage()
const orderService = useOrderService()

const { data: ordersRes, pending } = await useAsyncData('my-orders', () => orderService.getMyOrders())
const orders = computed(() => ordersRes.value?.data || [])

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

const getStatusBadgeClass = (status: string) => {
  const base = 'px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider'
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
