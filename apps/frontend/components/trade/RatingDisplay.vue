<template>
  <div
    class="flex items-center"
    :class="{ 'space-x-3': layout !== 'compact', 'space-x-1': layout === 'compact' }"
  >
    <!-- Star Group -->
    <div
      class="flex items-center"
      :class="{ 'space-x-0.5': layout === 'compact' }"
    >
      <StarIcon
        v-for="i in 5"
        :key="i"
        class="transition-all"
        :class="[
          sizeClasses[size] || 'h-4 w-4',
          i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
        ]"
      />
    </div>

    <!-- Rating Text -->
    <div
      v-if="layout !== 'stars-only'"
      class="flex items-center"
    >
      <span
        class="font-black text-gray-900 italic leading-none"
        :class="textSuffixSizeClasses[size]"
      >
        {{ rating?.toFixed(1) || '0.0' }}
      </span>
      <span
        v-if="count !== undefined && layout !== 'compact'"
        class="ml-2 py-0.5 px-2 bg-gray-100 rounded-md text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none"
      >
        {{ count }} DEĞERLENDİRME
      </span>
      <span
        v-else-if="count !== undefined"
        class="ml-1 text-[9px] font-bold text-gray-400"
      >
        ({{ count }})
      </span>
    </div>
  </div>
</template>

<script setup>
import { StarIcon } from '@heroicons/vue/24/solid'

defineProps({
    rating: {
        type: Number,
        default: 0
    },
    count: {
        type: Number,
        default: 0
    },
    size: {
        type: String,
        default: 'md', // sm, md, lg, xl
    },
    layout: {
        type: String,
        default: 'default', // default, compact, stars-only
    }
})

const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
    xl: 'h-6 w-6'
}

const textSuffixSizeClasses = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
    xl: 'text-xl'
}
</script>
