<template>
  <div :class="[colorMap[color] || colorMap.indigo, 'rounded-2xl p-6 text-white shadow-xl hover:scale-[1.02] transition-all cursor-default relative overflow-hidden group']">
    <!-- Decorative background icon -->
    <component
      :is="getIcon(icon)"
      class="absolute -right-4 -bottom-4 h-24 w-24 opacity-10 group-hover:scale-110 transition-transform"
    />
    
    <div class="relative z-10">
      <div class="flex items-center justify-between mb-2">
        <h3 class="text-[10px] font-black uppercase tracking-widest opacity-80">
          {{ title }}
        </h3>
        <component
          :is="getIcon(icon)"
          class="h-5 w-5 opacity-80"
        />
      </div>
      <p class="text-3xl font-black">
        ₺{{ formatPrice(value) }}
      </p>
      <div class="mt-4 w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
        <div
          class="bg-white h-full"
          style="width: 100%"
        />
      </div>
    </div>
  </div>
</template>

<script setup>

import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import MegaphoneIcon from '@heroicons/vue/24/outline/MegaphoneIcon'
import TruckIcon from '@heroicons/vue/24/outline/TruckIcon'
import ArrowPathIcon from '@heroicons/vue/24/outline/ArrowPathIcon'
import CubeIcon from '@heroicons/vue/24/outline/CubeIcon'

const icons = {
  SparklesIcon,
  MegaphoneIcon,
  TruckIcon,
  ArrowPathIcon,
  CubeIcon
}

defineProps({
  title: {
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
    default: 'indigo'
  }
})

const colorMap = {
  indigo: 'bg-gradient-to-br from-indigo-500 to-indigo-700',
  purple: 'bg-gradient-to-br from-purple-500 to-purple-700',
  blue: 'bg-gradient-to-br from-blue-500 to-blue-700',
  rose: 'bg-gradient-to-br from-orange-500 to-red-600'
}

const getIcon = (name) => icons[name] || CubeIcon

const formatPrice = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0
  }).format(val || 0)
}
</script>
