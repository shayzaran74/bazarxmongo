<template>
  <div 
    class="bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all rounded-2xl border-2 border-transparent hover:border-gray-200 cursor-pointer group"
    @click="navigateTo(link)"
  >
    <div class="px-5 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div :class="[colorMap[color] || 'bg-gray-100', 'flex-shrink-0 rounded-xl p-3']">
            <component
              :is="getIcon(icon)"
              :class="['h-6 w-6', color === 'primary' ? 'text-white' : 'text-gray-900']"
            />
          </div>
          <div class="ml-5">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {{ label }}
            </p>
            <div class="text-2xl font-black text-gray-900 mt-0.5">
              {{ value || 0 }}
            </div>
          </div>
        </div>
        <div class="group-hover:translate-x-1 transition-transform">
          <ChevronRightIcon class="h-5 w-5 text-gray-300" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { navigateTo } from '#imports'
import ClockIcon from '@heroicons/vue/24/outline/ClockIcon'
import BuildingStorefrontIcon from '@heroicons/vue/24/outline/BuildingStorefrontIcon'
import ChevronRightIcon from '@heroicons/vue/24/outline/ChevronRightIcon'
import CubeIcon from '@heroicons/vue/24/outline/CubeIcon'

const icons = {
  ClockIcon,
  BuildingStorefrontIcon,
  ChevronRightIcon,
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
    default: 'indigo'
  },
  link: {
    type: String,
    default: '#'
  }
})

const colorMap = {
  orange: 'bg-orange-100 text-orange-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  primary: 'bg-primary-600'
}

const getIcon = (name) => icons[name] || CubeIcon
</script>
