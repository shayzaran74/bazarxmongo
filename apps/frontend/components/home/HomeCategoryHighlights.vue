<template>
  <div
    v-if="Object.values(bestSellersByCategory).some(prods => prods.length > 0)"
    class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mb-10"
  >
    <LayoutHorizontalProductScroll
      v-for="(prods, catId) in Object.fromEntries(Object.entries(bestSellersByCategory).slice(0, 4))"
      :key="catId"
      :title="getCategoryNameDisplay(String(catId)) + ' Favorileri'"
      :products="prods as Product[]"
      :link="'/products?category=' + catId"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product, Category } from '@barterborsa/shared-types'

const bestSellersByCategory = ref<Record<string, Product[]>>({})
const categories = ref<Category[]>([])

const fetchHighlights = async () => {
  try {
    const { $api } = useApi()

    // Kategorileri ve öne çıkan ürünleri paralel çek
    const [catRes, listingRes] = await Promise.all([
      $api<{ success: boolean; data: Category[] }>('/api/v1/listings/categories', { query: { all: 'true' } }),
      $api<{ success: boolean; data: { items: Product[] } }>('/api/v1/listings/marketplace', {
        query: { limit: 48 }
      }),
    ])

    categories.value = catRes?.data ?? []

    const items: Product[] = listingRes?.data?.items ?? []

    // Kategori bazlı gruplama — her kategoriden max 8 ürün
    const grouped: Record<string, Product[]> = {}
    for (const item of items) {
      const catId = (item as unknown as { category: string }).category
      if (!catId) continue
      if (!grouped[catId]) grouped[catId] = []
      if (grouped[catId].length < 8) grouped[catId].push(item)
    }

    // En az 3 ürünü olan kategorileri al, max 4 kategori göster
    bestSellersByCategory.value = Object.fromEntries(
      Object.entries(grouped)
        .filter(([, prods]) => prods.length >= 3)
        .slice(0, 4)
    )
  } catch {
    // sessizce geç — bölüm gizlenir
  }
}

const getCategoryNameDisplay = (catId: string): string => {
  const cat = categories.value.find(c => c.id === catId)
  return cat?.name ?? 'Kategori'
}

onMounted(fetchHighlights)
</script>
