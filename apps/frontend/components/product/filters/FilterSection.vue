<template>
  <div class="border-b border-gray-200 pb-4">
    <button
      class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600 transition-colors"
      @click="$emit('toggle')"
    >
      <span>{{ title }}</span>
      <ChevronDownIcon :class="['w-5 h-5 transition-transform duration-300', isOpen && 'rotate-180']" />
    </button>
    <div
      v-show="isOpen"
      class="mt-3 overflow-hidden"
    >
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'

defineProps<{
  title: string
  isOpen: boolean
}>()

defineEmits<{
  (e: 'toggle'): void
}>()
</script>
