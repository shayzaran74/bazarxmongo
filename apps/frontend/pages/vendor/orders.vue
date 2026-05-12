<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">
          📦 Müşteri Siparişleri
        </h1>
        <p class="text-sm text-gray-500 mt-1">
          Sizin ürünlerinizi içeren siparişleri takip edin
        </p>
      </div>
      <button
        class="inline-flex items-center px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        @click="() => refresh()"
      >
        <HeroIcons.ArrowPathIcon
          class="h-4 w-4 mr-2"
          :class="{ 'animate-spin': pending }"
        />
        Yenile
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Bekleyen Siparişler
        </p>
        <p class="text-2xl font-bold text-orange-600">
          {{ pendingCount }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Kargolananlar
        </p>
        <p class="text-2xl font-bold text-primary-600">
          {{ shippedCount }}
        </p>
      </div>
      <div class="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          Toplam Kazanç
        </p>
        <p class="text-2xl font-bold text-green-600">
          {{ formatPrice(totalRevenue) }}
        </p>
      </div>
    </div>

    <!-- Orders Filter -->
    <div class="bg-white p-4 rounded-xl border border-gray-200 mb-6 flex items-center space-x-4">
      <div class="relative flex-1">
        <HeroIcons.MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          v-model="searchQuery"
          placeholder="Sipariş no ile ara..."
          class="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        >
      </div>
      <select
        v-model="filterStatus"
        class="p-2 border border-gray-100 rounded-lg text-sm bg-gray-50 outline-none"
      >
        <option value="">
          Tüm Durumlar
        </option>
        <option value="PENDING">
          Beklemede
        </option>
        <option value="PROCESSING">
          Hazırlanıyor
        </option>
        <option value="SHIPPED">
          Kargoda
        </option>
        <option value="DELIVERED">
          Teslim Edildi
        </option>
      </select>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <table class="w-full text-left">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Sipariş No</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Ürünler</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Tarih</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Toplam</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Müşteri</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">İşlem</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-if="pending && !orders.length">
            <td
              colspan="6"
              class="px-6 py-12 text-center"
            >
              <div class="animate-spin h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" />
            </td>
          </tr>
          <tr v-else-if="filteredOrders.length === 0">
            <td
              colspan="6"
              class="px-6 py-12 text-center text-gray-500 italic"
            >
              Sipariş bulunamadı
            </td>
          </tr>
          <tr
            v-for="order in filteredOrders"
            :key="order.id"
            class="hover:bg-gray-50/50 transition-colors cursor-pointer"
            @click="selectedOrder = order"
          >
            <td class="px-6 py-4 text-sm font-bold text-gray-900">#{{ order.orderNumber }}</td>
            <td class="px-6 py-4 text-xs text-gray-600">
              {{ order.OrderItem.length }} kalem ürün
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              {{ formatDate(order.createdAt) }}
            </td>
            <td class="px-6 py-4 text-sm font-bold text-gray-900">
              {{ formatPrice(orderTotalForVendor(order)) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              {{ order.User?.name || 'İsimsiz' }}
            </td>
            <td class="px-6 py-4 text-right">
              <span :class="getStatusBadgeClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Shipping Modal (Stubbed Logic) -->
    <div v-if="selectedOrder" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
         <div class="p-6 border-b flex justify-between items-center">
            <h2 class="text-xl font-bold">Sipariş İşlemleri #{{ selectedOrder.orderNumber }}</h2>
            <button @click="selectedOrder = null" class="text-gray-400 hover:text-black">✕</button>
         </div>
         <div class="p-6 space-y-4">
            <div class="bg-gray-50 p-4 rounded-xl">
               <p class="text-sm font-bold mb-1">Teslimat Adresi</p>
               <p class="text-sm text-gray-600">{{ selectedOrder.Address?.fullName || selectedOrder.User?.name }}</p>
               <p class="text-xs text-gray-500">{{ selectedOrder.Address?.addressLine }} {{ selectedOrder.Address?.city }}</p>
            </div>
            <div v-for="item in selectedOrder.OrderItem" :key="item.id" class="flex items-center gap-4 p-4 border rounded-xl">
               <div class="flex-1">
                  <p class="text-sm font-bold">{{ item.Listing?.CatalogProduct?.name || 'Ürün' }}</p>
                  <p class="text-xs text-gray-500">Adet: {{ item.quantity }} | Fiyat: {{ formatPrice(item.price) }}</p>
               </div>
               <div class="flex flex-col gap-2">
                  <input v-model="item.shippingCarrier" placeholder="Kargo Firması" class="text-xs p-1 border rounded">
                  <input v-model="item.trackingNumber" placeholder="Takip No" class="text-xs p-1 border rounded">
                  <button @click="updateItemShipping(item)" class="bg-primary-600 text-white text-[10px] py-1 rounded">Güncelle</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { useVendorOrders } from '~/composables/useVendorOrders'
import { useVendor } from '~/composables/useVendor'
import { useOrderStatusLabel } from '~/composables/useOrderStatusLabel'

definePageMeta({
  layout: 'vendor',
  middleware: 'vendor'
})

useHead({
  title: 'Müşteri Siparişleri - BarterBorsa'
})

const { 
  orders, searchQuery, filterStatus, selectedOrder,
  filteredOrders, pendingCount, shippedCount, totalRevenue,
  fetchOrders, updateItemShipping, orderTotalForVendor
} = useVendorOrders()

const { pending, refresh } = await useAsyncData('vendor-orders', async () => {
  await fetchOrders()
  return true
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('tr-TR')
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const getStatusBadgeClass = (status: string) => {
  const base = 'px-2 py-1 rounded-full text-[10px] uppercase font-bold'
  switch (status?.toUpperCase()) {
    case 'PENDING': return `${base} bg-orange-100 text-orange-700`
    case 'SHIPPED': return `${base} bg-purple-100 text-purple-700`
    case 'DELIVERED': return `${base} bg-green-100 text-green-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'Beklemede',
    'SHIPPED': 'Kargoda',
    'DELIVERED': 'Teslim Edildi'
  }
  return map[status?.toUpperCase()] || status
}
</script>
