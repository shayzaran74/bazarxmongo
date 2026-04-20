import { ref, computed, watch } from 'vue'

export const useSurplusFilters = (props: any, emit: any) => {
  const openSections = ref<any>({
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
  const expandedCategories = ref(new Set<string>())
  const localFilters = ref({ ...props.currentFilters })

  const statusOptions = [
    { value: '', label: 'TÜMÜ' },
    { value: 'active', label: 'AKTİF' },
    { value: 'pending', label: 'ONAY BEKLİYOR' },
    { value: 'completed', label: 'TAMAMLANDI' }
  ]

  const tradeModeOptions = [
    { value: '', label: 'TÜMÜ' },
    { value: 'FULL_BARTER', label: 'TAM TAKAS' },
    { value: 'PARTIAL_BARTER', label: 'KISMİ TAKAS' },
    { value: 'CASH_ONLY', label: 'SADECE NAKİT' }
  ]

  const filteredCategories = computed(() => {
    if (!categorySearch.value) {
      return props.categories.filter((c: any) => !c.parentId)
    }
    return props.categories.filter((c: any) =>
      c.name.toLowerCase().includes(categorySearch.value.toLowerCase())
    )
  })

  const getSubCategories = (parentId: string) => {
    return props.categories.filter((c: any) => c.parentId === parentId)
  }

  const toggleCategory = (catId: string) => {
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
    return (props.specs.wantedCategories || []).filter((c: string) =>
      c.toLowerCase().includes(wantedCategorySearch.value.toLowerCase())
    )
  })

  const filteredMaterials = computed(() => {
    if (!materialSearch.value) return props.specs.materials || []
    return (props.specs.materials || []).filter((m: string) =>
      m.toLowerCase().includes(materialSearch.value.toLowerCase())
    )
  })

  const filteredCities = computed(() => {
    if (!citySearch.value) return props.cities.slice(0, 20)
    return props.cities.filter((c: string) =>
      c.toLowerCase().includes(citySearch.value.toLowerCase())
    ).slice(0, 20)
  })

  const hasActiveFilters = computed(() => {
    return Object.keys(localFilters.value).some(key => {
      const value = localFilters.value[key]
      return value !== undefined && value !== null && value !== '' && value !== false
    })
  })

  const toggleSection = (section: string) => {
    openSections.value[section] = !openSections.value[section]
  }

  const selectCategory = (categoryName: string) => {
    localFilters.value.category = categoryName
    emitFilters()
  }

  const selectLocation = (location: string) => {
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

  const handleMaterialChange = (material: string) => {
    localFilters.value.materialType = material
    emitFilters()
  }

  let searchTimeout: any
  const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      localFilters.value.search = searchQuery.value
      emitFilters()
    }, 500)
  }

  watch(() => props.currentFilters, (newFilters) => {
    localFilters.value = { ...newFilters }
    searchQuery.value = newFilters.search || ''
  }, { deep: true, immediate: true })

  return {
    openSections, searchQuery, citySearch, categorySearch, wantedCategorySearch, materialSearch,
    expandedCategories, localFilters, statusOptions, tradeModeOptions, filteredCategories,
    filteredWantedCategories, filteredMaterials, filteredCities, hasActiveFilters,
    toggleSection, selectCategory, selectLocation, emitFilters, clearAllFilters,
    handleMaterialChange, debouncedSearch, toggleCategory, getSubCategories
  }
}
