<template>
  <div class="space-y-2">
    <div class="relative">
      <input
        :value="search"
        type="text"
        :placeholder="$t('products.filters.brandSearch')"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div class="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
      <label
        v-for="brand in brands"
        :key="brand.id"
        class="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-md cursor-pointer transition-colors group"
      >
        <div class="relative flex items-center h-5">
          <input
            type="checkbox"
            :checked="selectedBrands.includes(brand.slug)"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all duration-200"
            @change="$emit('toggle', brand.slug)"
          >
        </div>
        <span :class="['text-sm transition-colors', selectedBrands.includes(brand.slug) ? 'text-primary-700 font-medium' : 'text-gray-700 group-hover:text-gray-900']">{{ brand.name }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Brand } from '@barterborsa/shared-types'

defineProps<{
  brands: Brand[]
  selectedBrands: string[]
  search: string
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'toggle', slug: string): void
}>()
</script>
