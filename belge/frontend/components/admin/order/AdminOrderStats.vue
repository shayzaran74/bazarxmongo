<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    <div
      v-for="stat in orderStats"
      :key="stat.label"
      class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
    >
      <div class="flex items-center justify-between mb-2">
        <div :class="`p-2 rounded-lg ${stat.bg}`">
          <component
            :is="stat.icon"
            :class="`h-6 w-6 ${stat.color}`"
          />
        </div>
        <span class="text-2xl font-bold text-gray-900">{{ stat.value }}</span>
      </div>
      <p class="text-sm font-medium text-gray-500">
        {{ stat.label }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from '#imports'
import ShoppingBagIcon from '@heroicons/vue/24/outline/ShoppingBagIcon'
import ClockIcon from '@heroicons/vue/24/outline/ClockIcon'
import TruckIcon from '@heroicons/vue/24/outline/TruckIcon'
import CheckCircleIcon from '@heroicons/vue/24/outline/CheckCircleIcon'

const props = defineProps({
  orders: {
    type: Array,
    required: true
  }
})

const orderStats = computed(() => {
  return [
    { label: 'Yeni Siparişler', value: props.orders.filter(o => o.status === 'Pending').length, icon: ClockIcon, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Hazırlananlar', value: props.orders.filter(o => o.status === 'Processing').length, icon: ShoppingBagIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Yoldakiler', value: props.orders.filter(o => o.status === 'Shipped').length, icon: TruckIcon, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Tamamlananlar', value: props.orders.filter(o => o.status === 'Delivered').length, icon: CheckCircleIcon, color: 'text-green-600', bg: 'bg-green-100' },
  ]
})
</script>
