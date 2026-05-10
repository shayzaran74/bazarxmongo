<template>
  <div
    v-if="Object.values(bestSellersByCategory).some(prods => prods.length > 0)"
    class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mb-10"
  >
    <LayoutHorizontalProductScroll
      v-for="(prods, catId) in Object.fromEntries(Object.entries(bestSellersByCategory).slice(0, 4))"
      :key="catId"
      :title="getCategoryNameDisplay(catId) + ' Favorileri'"
      :products="prods"
      :link="'/products?category=' + catId"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

import type { Product, Category, ApiResponse, HomeCategoryHighlightsData } from '@barterborsa/shared-types'

const bestSellersByCategory = ref<Record<string, Product[]>>({})
const categories = ref<Category[]>([])
const loading = ref(false)

const fetchHighlights = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    
    // Fetch bulk data for category highlights
    const bulkData = await $api<HomeCategoryHighlightsData>('/api/products/homepage-bulk')
    if (bulkData.success && bulkData.data) {
      bestSellersByCategory.value = bulkData.data.bestSellersByCategory || {}
    }

    // Fetch categories for naming
    const catData = await $api<Category[]>('/api/categories', { query: { all: true } })
    if (catData.success && catData.data) {
      categories.value = catData.data
    }
  } catch (error) {
    console.error('Fetch category highlights error:', error)
  } finally {
    loading.value = false
  }
}

const getCategoryNameDisplay = (catId: string) => {
  const cat = categories.value.find(c => c.id === catId)
  return cat ? cat.name : 'Kategori'
}

onMounted(() => {
  fetchHighlights()
})
</script>
