<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
    <h2 class="text-lg font-bold text-gray-900 mb-6">
      Ödeme Bilgisi
    </h2>
    <div class="space-y-4">
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500 font-medium">Ödeme Yöntemi</span>
        <span class="text-gray-900 font-bold uppercase">{{ paymentMethod || 'Kredi Kartı' }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500 font-medium">Ödeme Durumu</span>
        <span
          :class="paidAt ? 'text-green-600' : 'text-orange-600'"
          class="font-bold"
        >
          {{ paidAt ? 'Ödendi' : 'Beklemede' }}
        </span>
      </div>
      <div
        v-if="paidAt"
        class="flex items-center justify-between text-sm"
      >
        <span class="text-gray-500 font-medium">Ödeme Tarihi</span>
        <span class="text-gray-900">{{ formatDate(paidAt) }}</span>
      </div>
      <div class="flex items-center justify-between text-sm">
        <span class="text-gray-500 font-medium">Stripe ID</span>
        <span class="text-xs text-gray-400 font-mono">{{ paymentIntentId ? paymentIntentId.slice(-8) + '...' : 'Yok' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  paymentMethod: {
    type: String,
    default: ''
  },
  paidAt: {
    type: String,
    default: ''
  },
  paymentIntentId: {
    type: String,
    default: ''
  }
})

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>
