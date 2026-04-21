<template>
  <div class="bg-green-50 rounded-2xl p-6 border border-green-100 flex flex-col items-center text-center">
    <p class="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-2">
      Tahsil Edilecek Tutar
    </p>
    <div class="space-y-1">
      <p class="text-lg font-bold text-gray-500 opacity-60">
        {{ formatPrice(amount) }}
      </p>
      <p class="text-xs text-orange-600 font-black uppercase tracking-wider">
        + {{ formatPrice(fee) }} İşlem Ücreti (%3 + 1₺)
      </p>
      <div class="pt-4 mt-4 border-t border-green-200/50 w-full min-w-[200px]">
        <p class="text-4xl font-black text-green-900 italic tracking-tighter">
          {{ formatPrice(total) }}
        </p>
        <p class="text-[10px] text-green-700/50 font-bold uppercase tracking-widest mt-1">
          Toplam Ödeme (Net)
        </p>
      </div>
    </div>
    <div v-if="orderNumber" class="mt-4 px-4 py-1 bg-green-100 rounded-full">
      <p class="text-[10px] font-bold text-green-800 uppercase tracking-widest italic">
        Sipariş #{{ orderNumber }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  amount: number
  fee: number
  total: number
  orderNumber?: string
  formatPrice: (p: number) => string
}>()
</script>
