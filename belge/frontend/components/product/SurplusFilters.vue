<template>
  <div class="space-y-6">
    <!-- Search -->
    <div class="border-b border-gray-200 pb-4">
      <div class="relative">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Malzeme, kategori ara..."
          class="w-full px-3 py-2 pl-10 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          @input="debouncedSearch"
        >
      </div>
    </div>

    <!-- Category Filter -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('category')"
      >
        <span>Kategori</span>
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
            placeholder="Kategori ara..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-64 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          <button
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              !localFilters.category
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectCategory('')"
          >
            Tüm Kategoriler
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
                  localFilters.category === cat.name
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                ]"
                @click="selectCategory(cat.name)"
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
                  localFilters.category === sub.name
                    ? 'bg-primary-50 text-primary-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                ]"
                @click="selectCategory(sub.name)"
              >
                {{ sub.name }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Location Filter -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('location')"
      >
        <span>Konum</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.location && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.location"
        class="mt-3 space-y-2"
      >
        <div class="relative">
          <input
            v-model="citySearch"
            type="text"
            placeholder="Şehir ara..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-48 overflow-y-auto space-y-1">
          <button
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              !localFilters.location
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectLocation('')"
          >
            Tüm Türkiye
          </button>
          <button
            v-for="city in filteredCities"
            :key="city"
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              localFilters.location === city
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="selectLocation(city)"
          >
            {{ city }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quantity Range -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('quantity')"
      >
        <span>Miktar Aralığı</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.quantity && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.quantity"
        class="mt-3 space-y-3"
      >
        <div class="grid grid-cols-2 gap-2">
          <input
            v-model.number="localFilters.minQuantity"
            type="number"
            placeholder="Min"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
          <input
            v-model.number="localFilters.maxQuantity"
            type="number"
            placeholder="Max"
            class="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <button
          class="w-full px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          @click="emitFilters"
        >
          Uygula
        </button>
      </div>
    </div>

    <!-- Price Range -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('price')"
      >
        <span>Birim Fiyat Aralığı</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.price && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.price"
        class="mt-3 space-y-3"
      >
        <div class="grid grid-cols-2 gap-2">
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
            <input
              v-model.number="localFilters.minPrice"
              type="number"
              placeholder="Min"
              class="w-full pl-5 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
          <div class="relative">
            <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₺</span>
            <input
              v-model.number="localFilters.maxPrice"
              type="number"
              placeholder="Max"
              class="w-full pl-5 pr-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
          </div>
        </div>
        <button
          class="w-full px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-md hover:bg-primary-700 transition-colors"
          @click="emitFilters"
        >
          Uygula
        </button>
      </div>
    </div>

    <!-- Status Filter -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('status')"
      >
        <span>Durum</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.status && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.status"
        class="mt-3 space-y-2"
      >
        <label
          v-for="status in statusOptions"
          :key="status.value"
          class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            v-model="localFilters.status"
            type="radio"
            :value="status.value"
            class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            @change="emitFilters"
          >
          <span class="text-sm text-gray-700">{{ status.label }}</span>
        </label>
      </div>
    </div>

    <!-- Material Type -->
    <div
      v-show="specs?.materials?.length"
      class="border-b border-gray-200 pb-4"
    >
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('materials')"
      >
        <span>Malzeme Türü</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.materials && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.materials"
        class="mt-3 space-y-2"
      >
        <div class="relative">
          <input
            v-model="materialSearch"
            type="text"
            placeholder="Malzeme ara..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-48 overflow-y-auto pr-1 custom-scrollbar space-y-1">
          <button
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              !localFilters.materialType
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="handleMaterialChange('')"
          >
            Tüm Malzemeler
          </button>
          <button
            v-for="material in filteredMaterials"
            :key="material"
            :class="[
              'block w-full text-left px-3 py-2 text-sm rounded-md transition-colors',
              localFilters.materialType === material
                ? 'bg-primary-50 text-primary-700 font-medium'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
            @click="handleMaterialChange(material)"
          >
            {{ material }}
          </button>
        </div>
      </div>
    </div>

    <!-- Trade Mode -->
    <div class="border-b border-gray-200 pb-4">
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('tradeMode')"
      >
        <span>Takas Yöntemi</span>
        <ChevronDownIcon :class="['w-5 h-5 transition-transform', openSections.tradeMode && 'rotate-180']" />
      </button>
      <div
        v-show="openSections.tradeMode"
        class="mt-3 space-y-2"
      >
        <label
          v-for="mode in tradeModeOptions"
          :key="mode.value"
          class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
        >
          <input
            v-model="localFilters.tradeMode"
            type="radio"
            :value="mode.value"
            class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
            @change="emitFilters"
          >
          <span class="text-sm text-gray-700">{{ mode.label }}</span>
        </label>
      </div>
    </div>

    <!-- Toggle Filters -->
    <div class="border-b border-gray-200 pb-4">
      <div class="space-y-3">
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">Sadece Acil İlanlar</span>
          <input
            v-model="localFilters.urgent"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">Toplu Alıma Uygun</span>
          <input
            v-model="localFilters.bulkAvailable"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
        <label class="flex items-center justify-between cursor-pointer">
          <span class="text-sm font-medium text-gray-900">Fotoğraflı İlanlar</span>
          <input
            v-model="localFilters.withImages"
            type="checkbox"
            class="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            @change="emitFilters"
          >
        </label>
      </div>
    </div>

    <!-- Wanted Categories -->
    <div
      v-show="specs?.wantedCategories?.length"
      class="border-b border-gray-200 pb-4"
    >
      <button
        class="flex items-center justify-between w-full text-left font-medium text-gray-900 hover:text-primary-600"
        @click="toggleSection('wantedCategories')"
      >
        <span>Takas Karşılığı Aranan</span>
        <ChevronDownIcon
          :class="['w-5 h-5 transition-transform', openSections.wantedCategories && 'rotate-180']"
        />
      </button>
      <div
        v-show="openSections.wantedCategories"
        class="mt-3 space-y-2"
      >
        <div class="relative">
          <input
            v-model="wantedCategorySearch"
            type="text"
            placeholder="Kategori ara..."
            class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
        </div>
        <div class="max-h-48 overflow-y-auto pr-2 space-y-1 custom-scrollbar">
          <label class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer">
            <input
              v-model="localFilters.wantedCategory"
              type="radio"
              value=""
              class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              @change="emitFilters"
            >
            <span class="text-sm text-gray-700 font-medium">Tümü</span>
          </label>
          <label
            v-for="cat in filteredWantedCategories"
            :key="cat"
            class="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              v-model="localFilters.wantedCategory"
              type="radio"
              :value="cat"
              class="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              @change="emitFilters"
            >
            <span class="text-sm text-gray-700">{{ cat }}</span>
          </label>
        </div>
      </div>
    </div>

    <!-- Clear Filters Button -->
    <button
      v-if="hasActiveFilters"
      class="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
      @click="clearAllFilters"
    >
      Filtreleri Temizle
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch } from '#imports'
import ChevronDownIcon from '@heroicons/vue/24/outline/ChevronDownIcon'
import MagnifyingGlassIcon from '@heroicons/vue/24/outline/MagnifyingGlassIcon'

const props = defineProps({
    categories: {
        type: Array,
        default: () => []
    },
    cities: {
        type: Array,
        default: () => []
    },
    specs: {
        type: Object,
        default: () => ({
            materials: [],
            units: [],
            locations: [],
            wantedCategories: [],
            tradeModes: []
        })
    },
    currentFilters: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['update:filters', 'clear:filters'])

// Local state
const openSections = ref({
    category: true,
    location: false,
    quantity: false,
    price: false,
    materials: false,
    tradeModes: false,
    wantedCategories: false,
    status: false
})

const searchQuery = ref('')
const citySearch = ref('')
const categorySearch = ref('')
const wantedCategorySearch = ref('')
const materialSearch = ref('')
const expandedCategories = ref(new Set())
const localFilters = ref({ ...props.currentFilters })

const statusOptions = [
    { value: '', label: 'Tümü' },
    { value: 'active', label: 'Aktif' },
    { value: 'pending', label: 'Onay Bekliyor' },
    { value: 'completed', label: 'Tamamlandı' }
]

const tradeModeOptions = [
    { value: '', label: 'Tümü' },
    { value: 'FULL_BARTER', label: 'Tam Takas' },
    { value: 'PARTIAL_BARTER', label: 'Kısmi Takas' },
    { value: 'CASH_ONLY', label: 'Sadece Nakit' }
]

// Computed
const filteredCategories = computed(() => {
    if (!categorySearch.value) {
        return props.categories.filter(c => !c.parentId)
    }
    return props.categories.filter(c =>
        c.name.toLowerCase().includes(categorySearch.value.toLowerCase())
    )
})

const getSubCategories = (parentId) => {
    return props.categories.filter(c => c.parentId === parentId)
}

const toggleCategory = (catId) => {
    const next = new Set(expandedCategories.value)
    if (next.has(catId)) {
        next.delete(catId)
    } else {
        next.add(catId)
    }
    expandedCategories.value = next
}

const filteredWantedCategories = computed(() => {
    if (!wantedCategorySearch.value) return props.specs.wantedCategories || []
    return (props.specs.wantedCategories || []).filter(c =>
        c.toLowerCase().includes(wantedCategorySearch.value.toLowerCase())
    )
})

const filteredMaterials = computed(() => {
    if (!materialSearch.value) return props.specs.materials || []
    return (props.specs.materials || []).filter(m =>
        m.toLowerCase().includes(materialSearch.value.toLowerCase())
    )
})

const filteredCities = computed(() => {
    if (!citySearch.value) return props.cities.slice(0, 20)
    return props.cities.filter(c =>
        c.toLowerCase().includes(citySearch.value.toLowerCase())
    ).slice(0, 20)
})

const hasActiveFilters = computed(() => {
    return Object.keys(localFilters.value).some(key => {
        const value = localFilters.value[key]
        return value !== undefined && value !== null && value !== '' && value !== false
    })
})

// Methods
const toggleSection = (section) => {
    openSections.value[section] = !openSections.value[section]
}

const selectCategory = (categoryName) => {
    localFilters.value.category = categoryName
    emitFilters()
}

const selectLocation = (location) => {
    localFilters.value.location = location
    emitFilters()
}

const emitFilters = () => {
    emit('update:filters', { ...localFilters.value })
}

const clearAllFilters = () => {
    localFilters.value = {}
    searchQuery.value = ''
    emit('clear:filters')
}

const handleMaterialChange = (material) => {
    localFilters.value.materialType = material
    emitFilters()
}

// Debounced search
let searchTimeout
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        localFilters.value.search = searchQuery.value
        emitFilters()
    }, 500)
}

// Watch for prop changes
watch(() => props.currentFilters, (newFilters) => {
    localFilters.value = { ...newFilters }
    searchQuery.value = newFilters.search || ''
}, { deep: true, immediate: true })
</script>
