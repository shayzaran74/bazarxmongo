<template>
  <div class="space-y-2">
    <!-- Category Filter -->
    <FilterSection
      :title="$t('products.filters.category')"
      :is-open="openSections.category"
      @toggle="toggleSection('category')"
    >
      <CategoryFilter
        v-model:search="categorySearch"
        :categories="categories"
        :selected-slug="localFilters.categorySlug"
        :expanded-ids="expandedCategories"
        :get-sub-categories="getSubCategories"
        @select="selectCategory"
        @toggle-expand="toggleCategory"
      />
    </FilterSection>

    <!-- Brand Filter -->
    <FilterSection
      :title="$t('products.filters.brand')"
      :is-open="openSections.brand"
      @toggle="toggleSection('brand')"
    >
      <BrandFilter
        v-model:search="brandSearch"
        :brands="brands"
        :selected-brands="selectedBrands"
        @toggle="toggleBrand"
      />
    </FilterSection>

    <!-- Price Range -->
    <FilterSection
      :title="$t('products.filters.price')"
      :is-open="openSections.price"
      @toggle="toggleSection('price')"
    >
      <PriceFilter
        v-model:min-price="localFilters.minPrice"
        v-model:max-price="localFilters.maxPrice"
        @apply="applyPriceFilter"
      />
    </FilterSection>

    <!-- Color Filter -->
    <FilterSection
      v-if="availableColors.length > 0"
      :title="$t('products.filters.color')"
      :is-open="openSections.color"
      @toggle="toggleSection('color')"
    >
      <SpecFilter
        type="color"
        :items="availableColors"
        :selected-items="selectedColors"
        :get-color-hex="getColorHex"
        @toggle="toggleColor"
      />
    </FilterSection>

    <!-- Size/Dimension Filter -->
    <FilterSection
      v-if="availableSizes.length > 0"
      :title="$t('products.filters.size')"
      :is-open="openSections.size"
      @toggle="toggleSection('size')"
    >
      <SpecFilter
        type="grid"
        :items="availableSizes"
        :selected-items="selectedSizes"
        @toggle="toggleSize"
      />
    </FilterSection>

    <!-- Material Filter -->
    <FilterSection
      v-if="availableMaterials.length > 0"
      :title="$t('products.filters.material')"
      :is-open="openSections.material"
      @toggle="toggleSection('material')"
    >
      <SpecFilter
        type="list"
        :items="availableMaterials"
        :selected-items="selectedMaterials"
        @toggle="toggleMaterial"
      />
    </FilterSection>

    <!-- Toggle Filters -->
    <div class="pt-4 px-2 space-y-4">
      <div class="space-y-3">
        <label
          v-for="toggle in toggleItems"
          :key="toggle.key"
          class="flex items-center justify-between cursor-pointer group"
        >
          <span class="text-sm font-bold text-gray-700 group-hover:text-primary-700 transition-colors">{{ toggle.label }}</span>
          <div class="relative inline-flex items-center">
            <input
              v-model="localFilters[toggle.key]"
              type="checkbox"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 transition-all cursor-pointer"
              @change="emitFilters"
            >
          </div>
        </label>
      </div>

      <!-- Clear Filters Button -->
      <button
        v-if="hasActiveFilters"
        class="w-full px-4 py-3 bg-gray-100/80 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-200 active:scale-95 transition-all"
        @click="clearAllFilters"
      >
        {{ $t('products.filters.clearFilters') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category, Brand } from '@barterborsa/shared-types'
import { useProductFilters } from '~/composables/useProductFilters'
import type { FilterState } from '~/composables/useProductFilters'

// Components
import FilterSection from './filters/FilterSection.vue'
import CategoryFilter from './filters/CategoryFilter.vue'
import BrandFilter from './filters/BrandFilter.vue'
import PriceFilter from './filters/PriceFilter.vue'
import SpecFilter from './filters/SpecFilter.vue'

const props = defineProps({
  categories: { type: Array as () => Category[], default: () => [] },
  brands: { type: Array as () => Brand[], default: () => [] },
  currentFilters: { type: Object as () => FilterState, default: () => ({}) },
  availableSpecs: { type: Object as () => Record<string, string[]>, default: () => ({}) }
})

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
  (e: 'clear:filters'): void
}>()

const {
  openSections, brandSearch, categorySearch, expandedCategories, localFilters,
  selectedBrands, selectedColors, selectedSizes, selectedMaterials,
  filteredCategories, filteredBrands, availableColors, availableSizes, availableMaterials,
  hasActiveFilters, getSubCategories, toggleCategory, toggleSection, selectCategory,
  toggleBrand, toggleColor, toggleSize, toggleMaterial, applyPriceFilter,
  emitFilters, clearAllFilters, getColorHex
} = useProductFilters(props, emit)

const { t } = useI18n()

const toggleItems = computed(() => [
  { key: 'isSpecialOffer', label: t('products.filters.specialOffers') },
  { key: 'bulkAvailable', label: t('products.filters.bulkAvailable') },
  { key: 'giftBox', label: t('products.filters.giftBox') }
])
</script>
