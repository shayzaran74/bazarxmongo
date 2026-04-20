<script setup lang="ts">
const props = defineProps<{
  stats: any
  tierColor: string
}>()

const { formatCurrency } = useCalculators()
</script>

<template>
  <div class="grid grid-cols-4 gap-4 px-8 py-6 bg-gray-50/50 border-b border-gray-100">
    <div v-for="(val, label) in { 
      'Satış': stats.totalSales || 0,
      'Ciro': formatCurrency(stats.totalRevenue || 0),
      'Puan': (stats.averageRating?.toFixed(1) || '0.0') + ' ⭐',
      'Ürün': stats.productCount || 0
    }" :key="label" class="text-center group">
      <span class="block text-lg font-black italic tracking-tighter transition-transform group-hover:scale-110" :style="{ color: tierColor }">{{ val }}</span>
      <span class="text-[9px] font-black uppercase tracking-widest text-gray-400">{{ label }}</span>
    </div>
  </div>
</template>
