<template>
  <div class="mt-4 p-4 border border-primary-100 bg-primary-50 rounded-xl">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-sm font-bold text-primary-900 flex items-center">
        <span class="mr-2">💳</span> Şimdi Al Sonra Öde (BNPL)
      </h4>
      <span class="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">2026 TREND</span>
    </div>
    <p class="text-xs text-primary-700 mb-3">
      Bu siparişi faizsiz 3 taksit ile ödeyebilirsiniz.
    </p>
    
    <div class="grid grid-cols-3 gap-2">
      <div
        v-for="i in 3"
        :key="i"
        class="bg-white p-2 rounded-lg border border-primary-200 text-center"
      >
        <p class="text-[10px] text-gray-500">
          {{ i }}. Taksit
        </p>
        <p class="text-xs font-bold text-gray-900">
          {{ formatPrice(totalPrice / 3) }}
        </p>
      </div>
    </div>
    
    <button class="w-full mt-3 py-2 bg-white border border-primary-600 text-primary-600 text-xs font-bold rounded-lg hover:bg-primary-600 hover:text-white transition-all">
      BNPL İle Öde
    </button>
  </div>
</template>

<script setup>
defineProps({
  totalPrice: {
    type: Number,
    required: true
  }
})

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}
</script>
