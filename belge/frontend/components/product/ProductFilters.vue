<template>
  <div class="space-y-6">
    <!-- Category Filter -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('category')"
      >
        <span>{{ $t('products.filters.category') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.category && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.category"
        class="mt-3 space-y-2"
      >
        <div class="relative">
          <input
            v-model="categorySearch"
            type="text"
            :placeholder="$t('products.filters.categorySearch')"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          <button
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              !currentFilters.categorySlug
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectCategory('')"
          >
            {{ $t('products.filters.allProducts') }}
          </button>

          <div
            v-for="cat in filteredCategories"
            :key="cat.id"
            class="space-y-1"
          >
            <div class="flex items-center group">
              <button
                :class="[
                  'flex-grow text-left px-3 py-2 text-sm rounded-l-md transition-colors',
                  currentFilters.categorySlug === cat.slug
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                ]"
                @click="selectCategory(cat.slug)"
              >
                {{ cat.name }}
              </button>
              <button
                v-if="!categorySearch && getSubCategories(cat.id).length"
                class="px-2 py-2 hover:bg-gray-100 rounded-r-md transition-colors"
                @click.stop="toggleCategory(cat.id)"
              >
                <ChevronDownIcon
                  :class="[
                    'w-4 h-4 text-gray-400 transition-transform',
                    expandedCategories.has(cat.id) ? 'rotate-180' : ''
                  ]"
                />
              </button>
            </div>

            <!-- Subcategories -->
            <div
              v-if="!categorySearch && expandedCategories.has(cat.id)"
              class="pl-4 space-y-1"
            >
              <button
                v-for="sub in getSubCategories(cat.id)"
                :key="sub.id"
                :class="[
                  'block w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors',
                  currentFilters.categorySlug === sub.slug
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                ]"
                @click="selectCategory(sub.slug)"
              >
                {{ sub.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Brand Filter -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('brand')"
      >
        <span>{{ $t('products.filters.brand') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.brand && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.brand"
        class="mt-3 space-y-2"
      >
        <div class="relative">
          <input
            v-model="brandSearch"
            type="text"
            :placeholder="$t('products.filters.brandSearch')"
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          <label
            v-for="brand in filteredBrands"
            :key="brand.id"
            class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="selectedBrands.includes(brand.slug)"
              class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              @change="toggleBrand(brand.slug)"
            >
            <span class="text-sm text-gray-700">{{ brand.name }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Price Range -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('price')"
      >
        <span>{{ $t('products.filters.price') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.price && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.price"
        class="mt-3 space-y-3"
      >
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model.number="localFilters.minPrice"
            type="number"
            placeholder="Min"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
          <input
            v-model.number="localFilters.maxPrice"
            type="number"
            placeholder="Max"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <button
          class="w-full px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          @click="applyPriceFilter"
        >
          {{ $t('products.filters.apply') }}
        </button>
      </div>
    </div>

    <!-- Color Filter -->
    <div
      v-if="availableColors.length > 0"
      class="border-b border-gray-200 pb-4"
    >
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('color')"
      >
        <span>{{ $t('products.filters.color') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.color && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.color"
        class="mt-3"
      >
        <div class="grid grid-cols-4 gap-2">
          <button
            v-for="color in availableColors"
            :key="color"
            :class="[
              'w-10 h-10 rounded-full border-2 transition-all',
              selectedColors.includes(color)
                ? 'border-primary-600 ring-2 ring-primary-200'
                : 'border-gray-300 hover:border-gray-400'
            ]"
            :style="{ backgroundColor: getColorHex(color) }"
            :title="color"
            @click="toggleColor(color)"
          />
        </div>
      </div>
    </div>

    <!-- Size/Dimension Filter -->
    <div
      v-if="availableSizes.length > 0"
      class="border-b border-gray-200 pb-4"
    >
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('size')"
      >
        <span>{{ $t('products.filters.size') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.size && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.size"
        class="mt-3"
      >
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="size in availableSizes"
            :key="size"
            :class="[
              'px-3 py-2 text-sm font-medium rounded-md border transition-colors',
              selectedSizes.includes(size)
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
            ]"
            @click="toggleSize(size)"
          >
            {{ size }}
          </button>
        </div>
      </div>
    </div>

    <!-- Material Filter -->
    <div
      v-if="availableMaterials.length > 0"
      class="border-b border-gray-200 pb-4"
    >
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('material')"
      >
        <span>{{ $t('products.filters.material') }}</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.material && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.material"
        class="mt-3 max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar"
      >
        <label
          v-for="material in availableMaterials"
          :key="material"
          class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedMaterials.includes(material)"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="toggleMaterial(material)"
          >
          <span class="text-sm text-gray-700">{{ material }}</span>
        </label>
      </div>
    </div>

    <!-- Toggle Filters -->
    <div class="border-b border-gray-200 pb-4">
      <div class="space-y-3">
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">{{ $t('products.filters.specialOffers') }}</span>
          <input
            v-model="localFilters.isSpecialOffer"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">{{ $t('products.filters.bulkAvailable') }}</span>
          <input
            v-model="localFilters.bulkAvailable"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">{{ $t('products.filters.giftBox') }}</span>
          <input
            v-model="localFilters.giftBox"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
      </div>
    </div>

    <!-- Clear Filters Button -->
    <button
      v-if="hasActiveFilters"
      class="w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
      @click="clearAllFilters"
    >
      {{ $t('products.filters.clearFilters') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from '#imports'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import type { Category, Brand } from '@barterborsa/shared-types'

interface FilterState {
  [key: string]: string | number | boolean | string[] | undefined
  categorySlug?: string
  brands?: string[]
  colors?: string[]
  sizes?: string[]
  materials?: string[]
  minPrice?: number
  maxPrice?: number
  isSpecialOffer?: boolean
  bulkAvailable?: boolean
  giftBox?: boolean
}

const props = defineProps({
    categories: {
        type: Array as () => Category[],
        default: () => []
    },
    brands: {
        type: Array as () => Brand[],
        default: () => []
    },
    currentFilters: {
        type: Object as () => FilterState,
        default: () => ({})
    },
    availableSpecs: {
        type: Object as () => Record<string, string[]>,
        default: () => ({})
    }
})

const emit = defineEmits<{
  (e: 'update:filters', filters: FilterState): void
  (e: 'clear:filters'): void
}>()

// Local state
const openSections = ref<Record<string, boolean>>({
    category: true,
    brand: false,
    price: false,
    color: false,
    size: false,
    material: false
})

const brandSearch = ref('')
const categorySearch = ref('')
const expandedCategories = ref(new Set<string | number>())
const localFilters = ref<FilterState>({ ...props.currentFilters })
const selectedBrands = ref<string[]>([])
const selectedColors = ref<string[]>([])
const selectedSizes = ref<string[]>([])
const selectedMaterials = ref<string[]>([])

// Computed
const filteredCategories = computed(() => {
    if (!categorySearch.value) {
        return props.categories.filter(c => !c.parentId)
    }
    return props.categories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.value.toLowerCase())
    )
})

const getSubCategories = (parentId: string | number) => {
    return props.categories.filter(c => c.parentId === parentId)
}

const toggleCategory = (catId: string | number) => {
    const next = new Set(expandedCategories.value)
    if (next.has(catId)) {
        next.delete(catId)
    } else {
        next.add(catId)
    }
    expandedCategories.value = next
}

const filteredBrands = computed(() => {
    if (!brandSearch.value) return props.brands
    return props.brands.filter(b =>
        b.name.toLowerCase().includes(brandSearch.value.toLowerCase())
    )
})

const availableColors = computed(() => {
    return props.availableSpecs.colors || []
})

const availableSizes = computed(() => {
    return props.availableSpecs.sizes || []
})

const availableMaterials = computed(() => {
    return props.availableSpecs.materials || []
})

const hasActiveFilters = computed(() => {
    return Object.keys(localFilters.value).length > 0 ||
        selectedBrands.value.length > 0 ||
        selectedColors.value.length > 0 ||
        selectedSizes.value.length > 0 ||
        selectedMaterials.value.length > 0
})

// Methods
const toggleSection = (section: string) => {
    openSections.value[section] = !openSections.value[section]
}

const selectCategory = (slug: string) => {
    localFilters.value.categorySlug = slug
    emitFilters()
}

const toggleBrand = (brandSlug: string) => {
    const index = selectedBrands.value.indexOf(brandSlug)
    if (index > -1) {
        selectedBrands.value.splice(index, 1)
    } else {
        selectedBrands.value.push(brandSlug)
    }
    localFilters.value.brands = selectedBrands.value
    emitFilters()
}

const toggleColor = (color: string) => {
    const index = selectedColors.value.indexOf(color)
    if (index > -1) {
        selectedColors.value.splice(index, 1)
    } else {
        selectedColors.value.push(color)
    }
    localFilters.value.colors = selectedColors.value
    emitFilters()
}

const toggleSize = (size: string) => {
    const index = selectedSizes.value.indexOf(size)
    if (index > -1) {
        selectedSizes.value.splice(index, 1)
    } else {
        selectedSizes.value.push(size)
    }
    localFilters.value.sizes = selectedSizes.value
    emitFilters()
}

const toggleMaterial = (material: string) => {
    const index = selectedMaterials.value.indexOf(material)
    if (index > -1) {
        selectedMaterials.value.splice(index, 1)
    } else {
        selectedMaterials.value.push(material)
    }
    localFilters.value.materials = selectedMaterials.value
    emitFilters()
}

const applyPriceFilter = () => {
    emitFilters()
}

const emitFilters = () => {
    emit('update:filters', { ...localFilters.value })
}

const clearAllFilters = () => {
    localFilters.value = {}
    selectedBrands.value = []
    selectedColors.value = []
    selectedSizes.value = []
    selectedMaterials.value = []
    emit('clear:filters')
}

const getColorHex = (colorName: string) => {
    const colorMap: Record<string, string> = {
        'Siyah': '#000000',
        'Beyaz': '#FFFFFF',
        'Kırmızı': '#FF0000',
        'Mavi': '#0000FF',
        'Yeşil': '#00FF00',
        'Sarı': '#FFFF00',
        'Turuncu': '#FFA500',
        'Mor': '#800080',
        'Pembe': '#FFC0CB',
        'Kahverengi': '#8B4513',
        'Gri': '#808080',
        'Lacivert': '#000080',
        'Bej': '#F5F5DC',
        'Krem': '#FFFDD0'
    }
    return colorMap[colorName] || '#CCCCCC'
}

// Watch for prop changes
watch(() => props.currentFilters, (newFilters) => {
    localFilters.value = { ...newFilters }
    selectedBrands.value = newFilters?.brands || []
    selectedColors.value = newFilters?.colors || []
    selectedSizes.value = newFilters?.sizes || []
    selectedMaterials.value = newFilters?.materials || []
}, { deep: true, immediate: true })
</script>
