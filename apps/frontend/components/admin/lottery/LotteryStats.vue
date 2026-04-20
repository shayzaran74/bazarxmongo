<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-6 italic">
    <div v-for="stat in dynamicStats" :key="stat.label" class="group bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-100 transition-all flex flex-col gap-4 relative overflow-hidden">
      <div class="flex items-center justify-between relative z-10">
        <div :class="stat.iconBg" class="p-4 rounded-2xl shadow-sm transition-transform group-hover:scale-110">
          <component :is="stat.icon" class="h-6 w-6" :class="stat.iconColor" />
        </div>
      </div>
      <div class="relative z-10 pt-2">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <p class="text-3xl font-black text-gray-900 tracking-tighter mt-1">{{ stat.value }}</p>
      </div>
      <div class="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
        <component :is="stat.icon" class="h-28 w-28" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { TicketIcon, FireIcon, CurrencyDollarIcon, UsersIcon } from '@heroicons/vue/24/outline'

const props = defineProps({ stats: Object })

const dynamicStats = computed(() => [
  { label: 'TOPLAM ÇEKİLİŞ', value: props.stats.total || 0, icon: TicketIcon, iconBg: 'bg-pink-50', iconColor: 'text-pink-600' },
  { label: 'AKTİF ÇEKİLİŞ', value: props.stats.active || 0, icon: FireIcon, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
  { label: 'ÖDÜL DEĞERİ', value: `₺${(props.stats.totalPrizeValue || 0).toLocaleString('tr-TR')}`, icon: CurrencyDollarIcon, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
  { label: 'TOPLAM KATILIM', value: props.stats.totalParticipants || 0, icon: UsersIcon, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' }
])
</script>
