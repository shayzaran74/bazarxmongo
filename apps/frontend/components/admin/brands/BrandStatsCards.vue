<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
    <div
      v-for="card in statCards"
      :key="card.label"
      class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 relative overflow-hidden group hover:shadow-md transition-all"
    >
      <div 
        class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        :class="`bg-gradient-to-br ${card.gradient}`"
      />
      
      <div class="flex items-center gap-3 relative">
        <div :class="`p-2.5 rounded-xl ${card.iconBg} ${card.iconColor}`">
          <component :is="card.icon" class="h-5 w-5" />
        </div>
        <div>
          <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            {{ card.label }}
          </p>
          <p class="text-2xl font-black text-gray-900 leading-none mt-1">
            {{ card.value }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ClockIcon, 
  CheckBadgeIcon, 
  XCircleIcon, 
  FireIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: {
    type: Object,
    required: true
  }
})

const statCards = computed(() => [
  { 
    label: 'Bekleyen', 
    value: props.stats.PENDING || 0, 
    icon: ClockIcon, 
    iconBg: 'bg-amber-100', 
    iconColor: 'text-amber-600',
    gradient: 'from-amber-50 to-transparent'
  },
  { 
    label: 'Onaylı', 
    value: props.stats.APPROVED || 0, 
    icon: CheckBadgeIcon, 
    iconBg: 'bg-green-100', 
    iconColor: 'text-green-600',
    gradient: 'from-green-50 to-transparent'
  },
  { 
    label: 'Reddedilen', 
    value: props.stats.REJECTED || 0, 
    icon: XCircleIcon, 
    iconBg: 'bg-red-100', 
    iconColor: 'text-red-600',
    gradient: 'from-red-50 to-transparent'
  },
  { 
    label: 'Popüler', 
    value: props.stats.POPULAR || 0, 
    icon: FireIcon, 
    iconBg: 'bg-rose-100', 
    iconColor: 'text-rose-600',
    gradient: 'from-rose-50 to-transparent'
  },
  { 
    label: 'İhlaller', 
    value: props.stats.VIOLATIONS || 0, 
    icon: ExclamationTriangleIcon, 
    iconBg: 'bg-red-100', 
    iconColor: 'text-red-600',
    gradient: 'from-red-50 to-transparent'
  }
])
</script>
