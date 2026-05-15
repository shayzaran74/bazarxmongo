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

    <!-- Orders List (Improved Cards/Table) -->
    <div class="space-y-4">
      <div
        v-for="order in filteredOrders"
        :key="order.id"
        class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
        @click="selectedOrder = order"
      >
        <div class="p-5 flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold">
              #{{ order.orderNumber.slice(-4) }}
            </div>
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-bold text-gray-900">#{{ order.orderNumber }}</span>
                <span :class="getStatusBadgeClass(order.status)">
                  {{ getStatusText(order.status) }}
                </span>
              </div>
              <div class="flex items-center gap-3 text-xs text-gray-500">
                <span class="flex items-center gap-1">
                  <HeroIcons.CalendarIcon class="h-3 w-3" />
                  {{ formatDate(order.createdAt) }}
                </span>
                <span class="flex items-center gap-1">
                  <HeroIcons.UserIcon class="h-3 w-3" />
                  {{ order.user?.profile ? `${order.user.profile.firstName} ${order.user.profile.lastName}` : 'İsimsiz' }}
                </span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-6">
            <div class="text-right">
              <p class="text-xs text-gray-400 font-medium uppercase tracking-wider mb-0.5">Tutar</p>
              <p class="text-lg font-bold text-gray-900">{{ formatPrice(orderTotalForVendor(order)) }}</p>
            </div>
            <div class="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
              <HeroIcons.ChevronRightIcon class="h-5 w-5" />
            </div>
          </div>
        </div>
        
        <!-- Quick Preview of Items -->
        <div class="px-5 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center gap-2">
          <div v-for="item in (order.orderItems || []).slice(0, 3)" :key="item.id" class="w-8 h-8 rounded-lg overflow-hidden border border-white shadow-sm">
             <img :src="resolveImageUrl(item.productImage || item.listing?.catalogProduct?.media?.[0]?.url)" class="w-full h-full object-cover">
          </div>
          <span v-if="order.orderItems?.length > 3" class="text-[10px] text-gray-400 font-medium">+{{ order.orderItems.length - 3 }} ürün daha</span>
        </div>
      </div>
      
      <div v-if="filteredOrders.length === 0 && !pending" class="py-24 text-center">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <HeroIcons.InboxIcon class="h-10 w-10 text-gray-300" />
        </div>
        <p class="text-gray-500 font-medium">Gösterilecek sipariş bulunamadı.</p>
      </div>
    </div>

    <!-- Order Details Side Panel (Slide-over) -->
    <div 
      v-if="selectedOrder" 
      class="fixed inset-0 z-50 overflow-hidden"
      @click.self="selectedOrder = null"
    >
      <div class="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
      
      <div class="fixed inset-y-0 right-0 max-w-full flex">
        <div class="w-screen max-w-lg bg-white shadow-2xl flex flex-col transform transition-transform duration-500 ease-in-out">
          <!-- Panel Header -->
          <div class="px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div>
              <h2 class="text-xl font-bold text-gray-900">Sipariş Detayı</h2>
              <p class="text-xs text-gray-500 mt-0.5">#{{ selectedOrder.orderNumber }}</p>
            </div>
            <button 
              class="p-2 rounded-full hover:bg-white hover:shadow-sm text-gray-400 hover:text-gray-900 transition-all"
              @click="selectedOrder = null"
            >
              <HeroIcons.XMarkIcon class="h-6 w-6" />
            </button>
          </div>

          <!-- Panel Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-8">
            <!-- Customer & Shipping -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-2xl">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Müşteri</p>
                <p class="text-sm font-bold text-gray-900">
                  {{ selectedOrder.user?.profile ? `${selectedOrder.user.profile.firstName} ${selectedOrder.user.profile.lastName}` : 'İsimsiz' }}
                </p>
                <p class="text-xs text-gray-500 truncate">{{ selectedOrder.user?.email }}</p>
              </div>
              <div class="bg-gray-50 p-4 rounded-2xl">
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Durum</p>
                <span :class="getStatusBadgeClass(selectedOrder.status)">
                  {{ getStatusText(selectedOrder.status) }}
                </span>
              </div>
            </div>

            <div class="bg-primary-50/30 border border-primary-100 p-4 rounded-2xl">
              <p class="text-[10px] font-bold text-primary-600 uppercase tracking-widest mb-2">Teslimat Adresi</p>
              <p class="text-sm text-gray-800 font-medium">{{ selectedOrder.address?.fullName || (selectedOrder.user?.profile ? `${selectedOrder.user.profile.firstName} ${selectedOrder.user.profile.lastName}` : 'İsimsiz') }}</p>
              <p class="text-xs text-gray-600 mt-1 leading-relaxed">
                {{ selectedOrder.address?.addressLine }}<br>
                {{ selectedOrder.address?.district }} / {{ selectedOrder.address?.city }}
              </p>
            </div>

            <!-- Items -->
            <div>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ürünler</p>
              <div class="space-y-3">
                <div 
                  v-for="item in (selectedOrder.orderItems || [])" 
                  :key="item.id" 
                  class="flex gap-4 p-3 rounded-2xl border border-gray-100 hover:border-primary-100 transition-colors"
                >
                  <div class="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0 border border-gray-50">
                    <img :src="resolveImageUrl(item.productImage || item.listing?.catalogProduct?.media?.[0]?.url)" class="w-full h-full object-cover">
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-bold text-gray-900 truncate">{{ item.listing?.catalogProduct?.name || item.productName }}</p>
                    <p class="text-xs text-gray-500 mt-0.5">Adet: {{ item.quantity }}</p>
                    <p class="text-sm font-bold text-primary-600 mt-1">{{ formatPrice(item.price) }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Shipment Tracking Form -->
            <div v-if="['PAID', 'PROCESSING'].includes(selectedOrder.status)" class="bg-white border-2 border-primary-100 p-6 rounded-3xl shadow-sm">
               <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
                 <HeroIcons.TruckIcon class="h-5 w-5 text-primary-600" />
                 Kargo Bilgilerini Gir
               </h3>
               <div class="space-y-4">
                 <div>
                   <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Kargo Firması</label>
                   <select 
                    v-model="selectedOrder.shippingCarrier"
                    class="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                   >
                     <option value="">Seçiniz</option>
                     <option value="ARAS">Aras Kargo</option>
                     <option value="YURTICI">Yurtiçi Kargo</option>
                     <option value="MNG">MNG Kargo</option>
                     <option value="SURAT">Sürat Kargo</option>
                     <option value="PTT">PTT Kargo</option>
                     <option value="JET">BazarX Jet</option>
                   </select>
                 </div>
                 <div>
                   <label class="text-[10px] font-bold text-gray-400 uppercase ml-1">Takip Numarası</label>
                   <input 
                     v-model="selectedOrder.trackingNumber" 
                     placeholder="Örn: 1234567890" 
                     class="w-full mt-1 p-3 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                   >
                 </div>
                 <button 
                  @click="updateItemShipping(selectedOrder)"
                  :disabled="!selectedOrder.trackingNumber || !selectedOrder.shippingCarrier"
                  class="w-full py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-primary-200"
                 >
                   Siparişi Kargola
                 </button>
               </div>
            </div>
            
            <div v-else-if="selectedOrder.status === 'SHIPPED'" class="bg-emerald-50 p-6 rounded-3xl border border-emerald-100">
               <div class="flex items-center gap-3 mb-2 text-emerald-700 font-bold">
                 <HeroIcons.CheckCircleIcon class="h-6 w-6" />
                 Kargoya Verildi
               </div>
               <p class="text-xs text-emerald-600">
                 <strong>Firma:</strong> {{ selectedOrder.shippingCarrier }}<br>
                 <strong>Takip No:</strong> {{ selectedOrder.trackingNumber }}
               </p>
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

const { resolveImageUrl } = useAppImage()
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
