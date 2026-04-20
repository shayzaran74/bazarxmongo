<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16 italic">
    <div v-for="stat in items" :key="stat.label" class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-neutral-100 flex flex-col justify-between hover:shadow-2xl hover:shadow-neutral-200 transition-all group overflow-hidden relative">
      <div v-if="stat.color" :class="stat.color" class="absolute left-0 top-0 bottom-0 w-2" />
      <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 opacity-60">{{ stat.label }}</span>
      <div class="mt-4 flex flex-col">
        <span :class="stat.textClass" class="text-4xl font-black tracking-tightest leading-none">{{ stat.value }}</span>
        <span v-if="stat.sub" class="text-[9px] font-black text-gray-400 mt-2 uppercase italic tracking-widest">{{ stat.sub }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ stats: Object })
const formatCurrency = (v) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(v || 0)
const formatNumber = (v) => new Intl.NumberFormat('tr-TR').format(v || 0)

const items = computed(() => [
  { label: 'AKTİF EKOSİSTEMLER', value: props.stats.active, sub: 'APEX+ DENETİM', textClass: 'text-gray-900', color: 'bg-indigo-600' },
  { label: 'TOPLAM PRİVATE STOK', value: formatNumber(props.stats.privateStock), sub: 'KÖR HAVUZ MİKTARI', textClass: 'text-gray-900', color: 'bg-neutral-900' },
  { label: 'ENVANTER DEĞERİ', value: formatCurrency(props.stats.inventoryValue), textClass: 'text-indigo-600', color: 'bg-indigo-400' },
  { label: 'SON 24S İHLAL', value: props.stats.violations, sub: 'GÜVENLİK UYARISI', textClass: 'text-rose-600', color: 'bg-rose-500' }
])
</script>
