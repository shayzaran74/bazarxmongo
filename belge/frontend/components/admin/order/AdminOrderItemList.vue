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
              item.Product?.Vendor?.businessName || 'Mağaza' }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span :class="getStatusBadgeClass(item.status || 'Pending')">{{ getStatusText(item.status || 'Pending') }}</span>
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

<script setup>
import { useAppImage } from '#imports'

defineProps({
  items: { type: Array, required: true },
  subTotal: { type: Number, required: true },
  shippingCost: { type: Number, required: true },
  totalAmount: { type: Number, required: true }
})

const { resolveImageUrl } = useAppImage()

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const getStatusBadgeClass = (status) => {
  const base = 'px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider'
  switch (status) {
    case 'Pending': return `${base} bg-orange-100 text-orange-700`
    case 'Processing': return `${base} bg-blue-100 text-blue-700`
    case 'Shipped': return `${base} bg-purple-100 text-purple-700`
    case 'Delivered': return `${base} bg-green-100 text-green-700`
    case 'Cancelled': return `${base} bg-red-100 text-red-700`
    default: return `${base} bg-gray-100 text-gray-700`
  }
}

const getStatusText = (status) => {
  const map = {
    'Pending': 'Beklemede',
    'Processing': 'Hazırlanıyor',
    'Shipped': 'Kargoda',
    'Delivered': 'Teslim Edildi',
    'Cancelled': 'İptal Edildi'
  }
  return map[status] || status
}
</script>
