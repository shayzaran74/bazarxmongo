<template>
  <div class="space-y-2">
    <div class="relative">
      <input
        :value="search"
        type="text"
        :placeholder="$t('products.filters.categorySearch')"
        class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-400"
        @input="$emit('update:search', ($event.target as HTMLInputElement).value)"
      >
    </div>
    <div class="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
      <button
        :class="[
          'block w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-200',
          !selectedSlug
            ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
            : 'text-gray-700 hover:bg-gray-50'
        ]"
        @click="$emit('select', '')"
      >
        {{ $t('products.filters.allProducts') }}
      </button>

      <div
        v-for="cat in categories"
        :key="cat.id"
        class="space-y-1"
      >
        <div class="flex items-center group">
          <button
            :class="[
              'flex-grow text-left px-3 py-2 text-sm rounded-l-md transition-all duration-200',
              selectedSlug === cat.slug
                ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="$emit('select', cat.slug)"
          >
            {{ cat.name }}
          </button>
          <button
            v-if="!search && getSubCategories(cat.id).length"
            class="px-2 py-2 hover:bg-gray-100 rounded-r-md transition-colors"
            @click.stop="$emit('toggle-expand', cat.id)"
          >
            <ChevronDownIcon
              :class="[
                'w-4 h-4 text-gray-400 transition-transform duration-300',
                expandedIds.has(cat.id) ? 'rotate-180' : ''
              ]"
            />
          </button>
        </div>

        <!-- Subcategories -->
        <transition
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div
            v-if="!search && expandedIds.has(cat.id)"
            class="pl-4 space-y-1 border-l-2 border-gray-100 ml-3"
          >
            <button
              v-for="sub in getSubCategories(cat.id)"
              :key="sub.id"
              :class="[
                'block w-full text-left px-3 py-1.5 text-xs rounded-md transition-all duration-200',
                selectedSlug === sub.slug
                  ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              ]"
              @click="$emit('select', sub.slug)"
            >
              {{ sub.name }}
            </button>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import type { Category } from '@barterborsa/shared-types'

defineProps<{
  categories: Category[]
  selectedSlug?: string
  search: string
  expandedIds: Set<string | number>
  getSubCategories: (parentId: string | number) => Category[]
}>()

defineEmits<{
  (e: 'update:search', value: string): void
  (e: 'select', slug: string): void
  (e: 'toggle-expand', id: string | number): void
}>()
</script>
