<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
    <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm group hover:shadow-xl hover:shadow-indigo-100/50 transition-all">
      <div class="flex items-center gap-4">
        <div :class="stat.bg" class="p-3.5 rounded-2xl text-white shadow-sm transition-transform group-hover:scale-110">
          <component :is="stat.icon" class="h-6 w-6" />
        </div>
        <div>
          <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">{{ stat.label }}</h3>
          <p class="text-2xl font-black text-gray-900 leading-none italic">{{ stat.value }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClockIcon, CheckCircleIcon, XCircleIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ stats: Object, formatPrice: Function })

const statCards = computed(() => [
  { label: 'BEKLEYEN', value: props.stats.pending, icon: ClockIcon, bg: 'bg-amber-500' },
  { label: 'ONAYLANAN', value: props.stats.approved, icon: CheckCircleIcon, bg: 'bg-emerald-500' },
  { label: 'REDDEDİLEN', value: props.stats.rejected, icon: XCircleIcon, bg: 'bg-red-500' },
  { label: 'TOPLAM TUTAR', value: props.formatPrice(props.stats.totalAmount), icon: CurrencyDollarIcon, bg: 'bg-indigo-600' }
])
</script>
