<script setup lang="ts">
import type { FormSection } from '~/types/product-form'

interface Props {
  sections: FormSection[]
  activeSection: string
  isSectionComplete: (id: string) => boolean
}

defineProps<Props>()
const emit = defineEmits(['navigate'])
</script>

<template>
  <div class="hidden lg:block w-64 flex-shrink-0">
    <div class="sticky top-6 space-y-1">
      <a
        v-for="section in sections"
        :key="section.id"
        :href="'#' + section.id"
        class="flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all"
        :class="[
          activeSection === section.id
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
            : 'text-gray-600 hover:bg-gray-100'
        ]"
        @click.prevent="emit('navigate', section.id)"
      >
        <component
          :is="section.icon"
          class="h-5 w-5 mr-3"
        />
        {{ section.name }}
        <span
          v-if="section.required && !isSectionComplete(section.id)"
          class="ml-auto text-red-400 text-[10px]"
        >●</span>
      </a>
    </div>
  </div>
</template>
