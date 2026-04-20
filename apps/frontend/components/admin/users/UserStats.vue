<template>
  <div class="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
    <div v-for="item in statsMap" :key="item.label" class="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group">
      <div class="flex items-center gap-4">
        <div :class="item.color" class="w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm group-hover:scale-110 transition-transform">
          <component :is="item.icon" class="w-6 h-6" />
        </div>
        <div>
          <div class="text-2xl font-black text-gray-900 leading-none">{{ item.value || 0 }}</div>
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{{ item.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { UsersIcon, CheckCircleIcon, ShieldCheckIcon, CalendarIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  stats: Object
})

const statsMap = computed(() => [
  { label: 'Toplam Kullanıcı', value: props.stats.total, icon: UsersIcon, color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { label: 'Aktif Kullanıcı', value: props.stats.active, icon: CheckCircleIcon, color: 'bg-green-50 text-green-600 border-green-100' },
  { label: 'Admin', value: props.stats.admins, icon: ShieldCheckIcon, color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { label: 'Bu Ay Yeni', value: props.stats.thisMonth, icon: CalendarIcon, color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { label: 'Satıcı Adayları', value: props.stats.vendorPending, icon: ShoppingBagIcon, color: 'bg-rose-50 text-rose-600 border-rose-100' }
])
</script>
