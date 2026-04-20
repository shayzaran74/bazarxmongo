<template>
  <div class="relative flex-1 overflow-hidden px-1">
    <!-- Left Scroll Button -->
    <button
      v-if="showButtons && !isMobile"
      class="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-300 text-gray-500 hover:text-primary-600 border border-white"
      @click="$emit('scroll-left')"
    >
      <ChevronLeftIcon class="w-4 h-4" />
    </button>

    <div
      ref="container"
      class="flex items-center space-x-1.5 lg:space-x-2 overflow-x-auto py-1 scrollbar-hide scroll-smooth no-scrollbar mask-edges"
    >
      <div
        v-for="category in categories"
        :key="category.id"
        class="flex-shrink-0 relative"
        @mouseenter="$emit('mouseenter', category)"
        @mouseleave="$emit('mouseleave')"
      >
        <NuxtLink
          :to="`/products?categorySlug=${category.slug}`"
          class="px-4 py-2.5 rounded-2xl bg-gray-100/50 hover:bg-white dark:bg-gray-800/40 dark:hover:bg-gray-800/80 backdrop-blur-md border border-gray-200/50 text-[10px] lg:text-[11px] font-black text-gray-700 hover:text-primary-600 hover:shadow-sm transition-all duration-300 uppercase tracking-widest relative group whitespace-nowrap flex items-center gap-2"
          @click="$emit('hide')"
        >
          <div v-if="isMobile" class="text-primary-600">
            <component :is="HeroIcons[category.icon] || HeroIcons.Squares2X2Icon" class="w-4 h-4" />
          </div>
          <span>{{ category.name }}</span>

          <span
            v-if="category.badgeText"
            class="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black text-white uppercase shadow-sm border border-white leading-none transform rotate-3 group-hover:rotate-0 transition-transform duration-300"
            :style="{ backgroundColor: category.badgeColor || '#ef4444' }"
          >
            {{ category.badgeText }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Right Scroll Button -->
    <button
      v-if="showButtons && !isMobile"
      class="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-md shadow-lg rounded-full p-2 hover:bg-white hover:scale-110 transition-all duration-300 text-gray-500 hover:text-primary-600 border border-white"
      @click="$emit('scroll-right')"
    >
      <ChevronRightIcon class="w-4 h-4" />
    </button>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import * as HeroIcons from '@heroicons/vue/24/outline'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  categories: Array,
  showButtons: Boolean,
  isMobile: Boolean
})

defineEmits(['scroll-left', 'scroll-right', 'mouseenter', 'mouseleave', 'hide'])

const container = ref(null)

// Expose the container for the parent to measure
defineExpose({ container })
</script>
