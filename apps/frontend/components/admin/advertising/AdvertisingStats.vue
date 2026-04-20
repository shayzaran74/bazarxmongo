<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
    <div
      v-for="s in cards"
      :key="s.label"
      class="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-default group"
    >
      <div class="flex items-center justify-between">
        <div class="space-y-1">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ s.label }}</span>
          <div class="text-3xl font-black text-gray-900 group-hover:scale-105 transition-transform origin-left">
            {{ s.value }}
          </div>
        </div>
        <div
          :class="`w-14 h-14 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all shadow-sm`"
          :style="{ backgroundColor: s.bgColor, color: s.textColor }"
        >
          <component :is="s.icon" class="w-7 h-7" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  RocketLaunchIcon, 
  ClockIcon, 
  CurrencyDollarIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const cards = computed(() => [
  { 
    label: 'Aktif Kampanyalar', 
    value: props.stats.activeCount || 0, 
    icon: RocketLaunchIcon, 
    color: 'indigo', 
    bgColor: '#EEF2FF', 
    textColor: '#4F46E5' 
  },
  { 
    label: 'Onay Bekleyenler', 
    value: props.stats.pendingCount || 0, 
    icon: ClockIcon, 
    color: 'orange', 
    bgColor: '#FFF7ED', 
    textColor: '#EA580C' 
  },
  { 
    label: 'Platform Geliri', 
    value: `₺${(props.stats.totalPlatformRevenue || 0).toLocaleString('tr-TR')}`, 
    icon: CurrencyDollarIcon, 
    color: 'green', 
    bgColor: '#F0FDF4', 
    textColor: '#16A34A' 
  }
])
</script>
