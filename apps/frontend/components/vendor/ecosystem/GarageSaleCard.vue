<script setup lang="ts">
interface GarageSale {
  id: string
  ecosystemName: string
  productName: string
  originalPrice: number
  campaignPrice: number
  discountRate: number
  maxQtyPerDealer: number
  myPurchasedQty: number
  remainingForMe: number
  totalRemaining: number
  startsAt: string
  endsAt: string
  status: 'SCHEDULED' | 'ACTIVE' | 'EXHAUSTED' | 'ENDED'
}

const props = defineProps<{ sale: GarageSale }>()

const statusLabel: Record<string, string> = {
  SCHEDULED: 'Yakında',
  ACTIVE: 'Aktif',
  EXHAUSTED: 'Stok tükendi',
  ENDED: 'Sona erdi',
}
const statusColor: Record<string, string> = {
  SCHEDULED: 'bg-blue-50 text-blue-700',
  ACTIVE: 'bg-green-50 text-green-700',
  EXHAUSTED: 'bg-red-50 text-red-700',
  ENDED: 'bg-gray-100 text-gray-500',
}

const hoursLeft = computed(() => {
  const diff = new Date(props.sale.endsAt).getTime() - Date.now()
  return Math.max(0, Math.floor(diff / 3600000))
})

const quotaPercent = computed(() =>
  Math.round((props.sale.myPurchasedQty / props.sale.maxQtyPerDealer) * 100)
)
</script>

<template>
  <div class="bg-white border border-gray-200 rounded-xl p-4 space-y-3">
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div>
        <p class="text-xs text-gray-400">{{ sale.ecosystemName }}</p>
        <p class="font-medium text-gray-900 text-sm">{{ sale.productName }}</p>
      </div>
      <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusColor[sale.status]">
        {{ statusLabel[sale.status] }}
      </span>
    </div>

    <!-- Fiyat -->
    <div class="flex items-baseline gap-2">
      <span class="text-lg font-semibold text-gray-900">
        {{ sale.campaignPrice.toLocaleString('tr-TR') }} ₺
      </span>
      <span class="text-sm text-gray-400 line-through">
        {{ sale.originalPrice.toLocaleString('tr-TR') }} ₺
      </span>
      <span class="text-xs font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
        %{{ sale.discountRate }} indirim
      </span>
    </div>

    <!-- Kota bar -->
    <div>
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Senin kotanı</span>
        <span>{{ sale.myPurchasedQty }}/{{ sale.maxQtyPerDealer }}</span>
      </div>
      <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full"
          :class="quotaPercent >= 100 ? 'bg-red-400' : quotaPercent > 60 ? 'bg-amber-400' : 'bg-purple-500'"
          :style="{ width: `${quotaPercent}%` }"
        />
      </div>
    </div>

    <!-- Kalan stok + süre -->
    <div class="flex items-center justify-between text-xs text-gray-500">
      <span>Genel stok: {{ sale.totalRemaining }} kaldı</span>
      <span v-if="sale.status === 'ACTIVE'">{{ hoursLeft }} saat kaldı</span>
    </div>

    <!-- Sepete at butonu -->
    <NuxtLink
      v-if="sale.status === 'ACTIVE' && sale.remainingForMe > 0"
      :to="`/products?garageSaleId=${sale.id}`"
      class="block w-full text-center text-sm py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
    >
      Sepete ekle
    </NuxtLink>
    <div
      v-else-if="sale.remainingForMe === 0"
      class="text-center text-xs text-gray-400 py-2"
    >
      Kota doldu — bu kampanyadan başka alım yapamazsın
    </div>
  </div>
</template>