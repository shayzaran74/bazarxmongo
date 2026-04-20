<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <div v-for="(val, key) in statsMap" :key="key" class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div class="flex items-center gap-4">
        <div :class="val.color" class="w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform">
          <component :is="val.icon" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-2xl font-black text-gray-900 leading-none">{{ stats?.[key] || 0 }}</div>
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ val.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ClockIcon, CheckBadgeIcon, XCircleIcon, StarIcon, ShieldExclamationIcon } from '@heroicons/vue/24/outline'
defineProps({ stats: Object })
const statsMap = {
  PENDING:    { label: 'Bekleyenler', icon: ClockIcon, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  APPROVED:   { label: 'Onaylı',      icon: CheckBadgeIcon, color: 'bg-green-50 text-green-600 border-green-100' },
  REJECTED:   { label: 'Reddedilen',  icon: XCircleIcon, color: 'bg-red-50 text-red-600 border-red-100' },
  POPULAR:    { label: 'Popüler',     icon: StarIcon, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  VIOLATIONS: { label: 'İhlaller',   icon: ShieldExclamationIcon, color: 'bg-rose-50 text-rose-600 border-rose-100' }
}
</script>
