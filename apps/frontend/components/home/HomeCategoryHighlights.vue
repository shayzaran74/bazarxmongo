<template>
  <div
    v-if="Object.values(bestSellersByCategory).some(prods => prods.length > 0)"
    class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 mb-10"
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

    // Ana kategorilerden ilk 4'ünü al, her biri için ayrı listing isteği
    const topCategories = (catRes?.data ?? []).filter((c: Category) => !c.parentId).slice(0, 4)

    const categoryListings = await Promise.all(
      topCategories.map((cat: Category) =>
        $api<{ success: boolean; data: { items: Product[] } }>('/api/v1/listings/marketplace', {
          query: { categoryId: cat.id, limit: 8, vendorType: 'COMMERCE' },
        }).then(r => ({ catId: cat.id, items: r?.data?.items ?? [] }))
          .catch(() => ({ catId: cat.id, items: [] as Product[] }))
      )
    )

    bestSellersByCategory.value = Object.fromEntries(
      categoryListings
        .filter(cl => cl.items.length >= 3)
        .map(cl => [cl.catId, cl.items])
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
