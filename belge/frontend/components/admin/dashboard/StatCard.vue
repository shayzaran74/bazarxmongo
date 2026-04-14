<template>
  <div class="bg-white overflow-hidden shadow-sm hover:shadow-md transition-all rounded-2xl border border-gray-100">
    <div class="px-5 py-6">
      <div class="flex items-center">
        <div :class="[colorMap[color] || colorMap.primary, 'flex-shrink-0 rounded-xl p-3 shadow-sm']">
          <component
            :is="getIcon(icon)"
            class="h-6 w-6 text-white"
          />
        </div>
        <div class="ml-5 flex-1">
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {{ label }}
          </p>
          <div class="text-2xl font-black text-gray-900 mt-0.5">
            {{ formatValue(value) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import ShoppingBagIcon from '@heroicons/vue/24/outline/ShoppingBagIcon'
import FolderIcon from '@heroicons/vue/24/outline/FolderIcon'
import CurrencyDollarIcon from '@heroicons/vue/24/outline/CurrencyDollarIcon'
import TicketIcon from '@heroicons/vue/24/outline/TicketIcon'
import UsersIcon from '@heroicons/vue/24/outline/UsersIcon'
import ShoppingCartIcon from '@heroicons/vue/24/outline/ShoppingCartIcon'
import CubeIcon from '@heroicons/vue/24/outline/CubeIcon'

const icons = {
  ShoppingBagIcon,
  FolderIcon,
  CurrencyDollarIcon,
  TicketIcon,
  UsersIcon,
  ShoppingCartIcon,
  CubeIcon
}

defineProps({
  label: {
    type: String,
    default: ''
  },
  value: {
    type: [Number, String],
    default: 0
  },
  icon: {
    type: String,
    default: 'CubeIcon'
  },
  color: {
    type: String,
    default: 'primary'
  }
})

const colorMap = {
  primary: 'bg-primary-600',
  green: 'bg-emerald-600',
  purple: 'bg-purple-600',
  pink: 'bg-pink-600',
  blue: 'bg-blue-600',
  yellow: 'bg-orange-500'
}

const getIcon = (name) => icons[name] || CubeIcon

const formatValue = (val) => {
  if (typeof val === 'number') return val.toLocaleString('tr-TR')
  return val || 0
}
</script>
