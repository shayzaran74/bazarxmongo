<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="p-6 border-b border-gray-100 flex items-center justify-between">
      <h2 class="text-lg font-bold text-gray-900">
        Ürünler
      </h2>
      <span class="text-sm text-gray-500">{{ items.length }} Çeşit Ürün</span>
    </div>
    <div class="divide-y divide-gray-100">
      <div
        v-for="item in items"
        :key="item.id"
        class="p-6 flex items-center space-x-6"
      >
        <NuxtImg
          v-if="item.Product?.image"
          :src="resolveImageUrl(item.Product.image)" 
          class="w-16 h-16 rounded-xl object-cover bg-gray-50 flex-shrink-0"
        />
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-bold text-gray-900 truncate">
            {{ item.Product?.name }}
          </h4>
          <p class="text-xs text-gray-500 mt-1">
            SKU: {{ item.Product?.sku || 'N/A' }} | Satıcı: {{
              item.Product?.Vendor?.profile?.storeName || item.Product?.Vendor?.businessName || 'Mağaza' }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span :class="getStatusBadgeClass(item.status || 'PENDING')">{{ getStatusText(item.status || 'PENDING') }}</span>
            <span
              v-if="item.trackingNumber"
              class="text-[10px] text-gray-500 font-medium"
            >
              {{ item.shippingCarrier }}: {{ item.trackingNumber }}
            </span>
          </div>
        </div>
        <div class="text-right flex-shrink-0">
          <p class="text-sm font-bold text-gray-900">
            {{ formatPrice(item.price) }}
          </p>
          <p class="text-xs text-gray-500 mt-1">
            x {{ item.quantity }}
          </p>
        </div>
      </div>
    </div>
    <!-- Summary -->
    <div class="bg-gray-50/50 p-6 space-y-3">
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Ara Toplam</span>
        <span class="text-gray-900 font-medium">{{ formatPrice(subTotal) }}</span>
      </div>
      <div class="flex justify-between text-sm">
        <span class="text-gray-600">Kargo</span>
        <span class="text-gray-900 font-medium">{{ formatPrice(shippingCost) }}</span>
      </div>
      <div class="flex justify-between text-lg font-bold pt-3 border-t border-gray-200">
        <span class="text-gray-900">Toplam</span>
        <span class="text-primary-600">{{ formatPrice(totalAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAppImage } from '#imports'

interface OrderItemRow {
  id: string
  status?: string
  trackingNumber?: string
  shippingCarrier?: string
  price: number | string
  quantity: number
  Product?: {
    name?: string
    image?: string
    sku?: string
    Vendor?: {
      businessName?: string
      id?: string
      profile?: {
        storeName?: string
      } | null
    }
  } | null
}

defineProps<{
  items: OrderItemRow[]
  subTotal: number
  shippingCost: number
  totalAmount: number
}>()

const { resolveImageUrl } = useAppImage()

const formatPrice = (price: number | string | undefined) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(price) || 0)

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-orange-100 text-orange-700',
  PAID: 'bg-emerald-100 text-emerald-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-amber-100 text-amber-700',
  READY: 'bg-cyan-100 text-cyan-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
  REFUNDED: 'bg-pink-100 text-pink-700',
}

const STATUS_TEXT: Record<string, string> = {
  PENDING: 'Beklemede',
  PAID: 'Ödendi',
  CONFIRMED: 'Onaylandı',
  PROCESSING: 'Hazırlanıyor',
  PREPARING: 'Mutfakta',
  READY: 'Hazır',
  SHIPPED: 'Kargoda',
  DELIVERED: 'Teslim Edildi',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal Edildi',
  REFUNDED: 'İade Edildi',
}

const BADGE_BASE = 'px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider'

const getStatusBadgeClass = (status: string) =>
  `${BADGE_BASE} ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-700'}`
const getStatusText = (status: string) => STATUS_TEXT[status] ?? status
</script>
