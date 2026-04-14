<template>
  <div
    class="advanced-search-container w-full py-2 px-4 sticky top-16 md:top-20 z-40 transition-all duration-300"
    :class="{ 'bg-white/90 backdrop-blur-xl shadow-lg border-b border-gray-100': isScrolled }"
  >
    <div class="max-w-7xl mx-auto">
      <!-- Collapsible Header -->
      <button
        class="w-full flex items-center justify-between bg-white rounded-2xl border border-gray-200 shadow-lg px-6 py-4 hover:border-primary-200 transition-all group"
        @click="isExpanded = !isExpanded"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 bg-gradient-to-br from-primary-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200/50"
          >
            <MagnifyingGlassIcon class="h-5 w-5 text-white" />
          </div>
          <div class="text-left">
            <h3 class="text-lg font-black text-gray-900 tracking-tight uppercase">
              {{ $t('search.advancedTitle') }}
            </h3>
            <p class="text-xs text-gray-400 font-medium">
              {{ isVendorStore ? $t('search.vendorDesc') :
                $t('search.globalDesc') }}
            </p>
          </div>
        </div>
        <ChevronDownIcon
          class="h-5 w-5 text-gray-400 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
        />
      </button>

      <!-- Expandable Content -->
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0 overflow-hidden"
        enter-to-class="opacity-100 max-h-[500px]"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 max-h-[500px]"
        leave-to-class="opacity-0 max-h-0 overflow-hidden"
      >
        <div
          v-show="isExpanded"
          class="mt-4"
        >
          <!-- Search Bar & Filters Unified -->
          <div
            class="bg-white rounded-2xl md:rounded-full border border-gray-200 shadow-xl p-2 md:p-1.5 flex flex-col md:flex-row items-center gap-2 transition-all hover:border-primary-200"
          >
            <!-- Search Input -->
            <div class="relative w-full md:w-1/3 lg:w-2/5 group">
              <MagnifyingGlassIcon
                class="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-600 transition-colors"
              />
              <input
                v-model="filters.search"
                type="text"
                :placeholder="isVendorStore ? $t('search.vendorPlaceholder') : $t('search.globalPlaceholder')"
                class="w-full pl-12 pr-4 py-3 md:py-2.5 bg-gray-50 border-none rounded-xl md:rounded-full focus:ring-2 focus:ring-primary-500/20 text-sm font-medium transition-all"
                @keyup.enter="applyFilters"
              >
            </div>

            <!-- Category Select -->
            <div
              v-if="!hideCategory"
              class="relative w-full md:w-1/4 lg:w-40 group"
            >
              <select
                v-model="filters.category"
                class="w-full appearance-none pl-4 pr-10 py-3 md:py-2.5 bg-gray-50 border-none rounded-xl md:rounded-full focus:ring-2 focus:ring-primary-500/20 text-sm font-medium cursor-pointer transition-all"
              >
                <option value="">
                  {{ $t('search.category') }}
                </option>
                <option
                  v-for="cat in categories"
                  :key="cat.slug"
                  :value="cat.slug"
                >
                  {{ cat.name }}
                </option>
              </select>
              <ChevronDownIcon
                class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-primary-600 transition-colors"
              />
            </div>

            <!-- Brand Select -->
            <div class="relative w-full md:w-1/4 lg:w-40 group">
              <select
                v-model="filters.brand"
                class="w-full appearance-none pl-4 pr-10 py-3 md:py-2.5 bg-gray-50 border-none rounded-xl md:rounded-full focus:ring-2 focus:ring-primary-500/20 text-sm font-medium cursor-pointer transition-all"
              >
                <option value="">
                  {{ $t('search.brand') }}
                </option>
                <optgroup :label="$t('search.popularBrands')">
                  <option
                    v-for="brand in brandSections.popular"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </optgroup>
                <optgroup :label="$t('search.allBrands')">
                  <option
                    v-for="brand in brandSections.others"
                    :key="brand.id"
                    :value="brand.id"
                  >
                    {{ brand.name }}
                  </option>
                </optgroup>
              </select>
              <ChevronDownIcon
                class="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-primary-600 transition-colors"
              />
            </div>

            <!-- Price Range -->
            <div class="flex items-center gap-2 w-full md:w-auto px-2 md:px-0 lg:w-48">
              <div class="relative flex-1">
                <input
                  v-model.number="filters.minPrice"
                  type="number"
                  :placeholder="$t('search.minPrice')"
                  class="w-full px-3 py-3 md:py-2.5 bg-gray-50 border-none rounded-xl md:rounded-full focus:ring-2 focus:ring-primary-500/20 text-[10px] font-black tracking-widest transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                >
              </div>
              <span class="text-gray-300 font-bold">-</span>
              <div class="relative flex-1">
                <input
                  v-model.number="filters.maxPrice"
                  type="number"
                  :placeholder="$t('search.maxPrice')"
                  class="w-full px-3 py-3 md:py-2.5 bg-gray-50 border-none rounded-xl md:rounded-full focus:ring-2 focus:ring-primary-500/20 text-[10px] font-black tracking-widest transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                >
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center gap-2 w-full md:w-auto">
              <button
                class="flex-1 md:flex-none px-8 py-3 md:py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl md:rounded-full text-sm font-black uppercase tracking-widest shadow-lg shadow-primary-200 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                @click="applyFilters"
              >
                {{ $t('search.filter') }}
              </button>

              <button
                v-if="hasActiveFilters"
                class="p-3 md:p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-400 hover:text-gray-600 rounded-xl md:rounded-full transition-all flex items-center justify-center"
                :title="$t('search.clear')"
                @click="clearFilters"
              >
                <XMarkIcon class="h-5 w-5" />
              </button>
            </div>
          </div>

          <!-- Quick Sort Filters -->
          <div class="mt-4 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide no-scrollbar">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex-shrink-0">{{
              $t('search.sort') }}:</span>
            <button
              v-for="option in sortOptions"
              :key="option.value"
              class="flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap"
              :class="filters.sort === option.value ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100'"
              @click="filters.sort = option.value; applyFilters()"
            >
              {{ option.label }}
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, useI18n } from '#imports'
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import XMarkIcon from '@heroicons/vue/24/outline/XMarkIcon'

const { t } = useI18n()

const props = defineProps({
  isVendorStore: {
    type: Boolean,
    default: false
  },
  vendorId: {
    type: String,
    default: null
  },
  hideCategory: {
    type: Boolean,
    default: false
  },
  initialFilters: {
    type: Object,
    default: () => ({})
  },
  categories: {
    type: Array,
    default: () => []
  },
  brands: {
    type: Array,
    default: () => []
  },
  startExpanded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['filter'])

const filters = ref({
  search: props.initialFilters.search || '',
  category: props.initialFilters.category || '',
  brand: props.initialFilters.brand || '',
  minPrice: props.initialFilters.minPrice || undefined,
  maxPrice: props.initialFilters.maxPrice || undefined,
  sort: props.initialFilters.sort || 'created_desc'
})

const isExpanded = ref(props.startExpanded)
const isScrolled = ref(false)

const brandSections = computed(() => {
  if (!props.brands?.length) return { popular: [], others: [] }
  const sorted = [...props.brands].sort((a, b) => (b.popularityScore || 0) - (a.popularityScore || 0))
  const popular = sorted.slice(0, 5)
  const others = sorted.slice(5).sort((a, b) => a.name.localeCompare(b.name))
  return { popular, others }
})

const sortOptions = computed(() => [
  { label: t('search.sortOptions.newest'), value: 'created_desc' },
  { label: t('search.sortOptions.priceAsc'), value: 'price_asc' },
  { label: t('search.sortOptions.priceDesc'), value: 'price_desc' },
  { label: t('search.sortOptions.nameAsc'), value: 'name_asc' },
  { label: t('search.sortOptions.popular'), value: 'popular' }
])

const hasActiveFilters = computed(() => {
  return filters.value.search ||
    filters.value.category ||
    filters.value.brand ||
    filters.value.minPrice !== undefined ||
    filters.value.maxPrice !== undefined ||
    filters.value.sort !== 'created_desc'
})

const applyFilters = () => {
  const cleanFilters = {}

  if (filters.value.search?.trim()) cleanFilters.search = filters.value.search.trim()
  if (filters.value.category) cleanFilters.category = filters.value.category
  if (filters.value.brand) cleanFilters.brand = filters.value.brand
  if (typeof filters.value.minPrice === 'number') cleanFilters.minPrice = filters.value.minPrice
  if (typeof filters.value.maxPrice === 'number') cleanFilters.maxPrice = filters.value.maxPrice
  if (filters.value.sort) cleanFilters.sort = filters.value.sort

  emit('filter', cleanFilters)
}

const clearFilters = () => {
  filters.value = {
    search: '',
    category: '',
    brand: '',
    minPrice: undefined,
    maxPrice: undefined,
    sort: 'created_desc'
  }
  applyFilters()
}

// Scroll listener for sticky effect polish
onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('scroll', handleScroll)
  }
})

const handleScroll = () => {
  isScrolled.value = window.scrollY > 100
}

// Watch initialFilters for sync if needed
watch(() => props.initialFilters, (newVal) => {
  if (newVal) {
    filters.value = { ...filters.value, ...newVal }
  }
}, { deep: true })
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>