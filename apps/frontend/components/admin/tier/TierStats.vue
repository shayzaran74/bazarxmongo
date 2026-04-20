<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 italic">
    <div v-for="stat in dynamicStats" :key="stat.label" class="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all flex flex-col gap-4 relative overflow-hidden">
      <div class="flex items-center justify-between relative z-10">
        <div :class="stat.iconBg" class="p-4 rounded-2xl transition-transform group-hover:scale-110 shadow-sm">
          <component :is="stat.icon" class="h-6 w-6" :class="stat.iconColor" />
        </div>
        <div :class="stat.trendColor" class="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border border-current opacity-70">
          {{ stat.trend }}
        </div>
      </div>
      <div class="relative z-10 pt-2">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <p class="text-3xl font-black text-gray-900 tracking-tighter mt-1">{{ stat.value }}</p>
      </div>
      <!-- Decorative background elements -->
      <div class="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <component :is="stat.icon" class="h-28 w-28" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ServerIcon, CurrencyDollarIcon, SparklesIcon, ArrowUpCircleIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ tiers: Array })

const dynamicStats = computed(() => [
  {
    label: 'AKTİF SEGMENTLER',
    value: props.tiers.length,
    icon: ServerIcon,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    trend: 'STABLE',
    trendColor: 'text-blue-600'
  },
  {
    label: 'ORT. KOMİSYON',
    value: `%${((props.tiers.reduce((acc, t) => acc + Number(t.commissionCash || 0), 0) / (props.tiers.length || 1)) * 100).toFixed(1)}`,
    icon: CurrencyDollarIcon,
    iconBg: 'bg-green-50',
    iconColor: 'text-green-600',
    trend: 'OPTIMIZED',
    trendColor: 'text-green-600'
  },
  {
    label: 'MAX XP ÇARPANI',
    value: `${Math.max(...props.tiers.map(t => Number(t.xpMultiplier) || 1))}X`,
    icon: SparklesIcon,
    iconBg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    trend: 'BOOSTED',
    trendColor: 'text-indigo-600'
  },
  {
    label: 'SİSTEM KAPASİTE',
    value: props.tiers.reduce((acc, t) => acc + (t.listingLimit || 0), 0),
    icon: ArrowUpCircleIcon,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    trend: 'SCALABLE',
    trendColor: 'text-amber-600'
  }
])
</script>
