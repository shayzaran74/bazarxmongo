import { ref, computed, watch } from 'vue'
import type { Category, Brand } from '@barterborsa/shared-types'

export interface FilterState {
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

export const useProductFilters = (props: {
  categories: Category[]
  brands: Brand[]
  currentFilters: FilterState
  availableSpecs: Record<string, string[]>
}, emit: any) => {
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

  const availableColors = computed(() => props.availableSpecs.colors || [])
  const availableSizes = computed(() => props.availableSpecs.sizes || [])
  const availableMaterials = computed(() => props.availableSpecs.materials || [])

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

  return {
    openSections,
    brandSearch,
    categorySearch,
    expandedCategories,
    localFilters,
    selectedBrands,
    selectedColors,
    selectedSizes,
    selectedMaterials,
    filteredCategories,
    filteredBrands,
    availableColors,
    availableSizes,
    availableMaterials,
    hasActiveFilters,
    getSubCategories,
    toggleCategory,
    toggleSection,
    selectCategory,
    toggleBrand,
    toggleColor,
    toggleSize,
    toggleMaterial,
    applyPriceFilter,
    emitFilters,
    clearAllFilters,
    getColorHex
  }
}
