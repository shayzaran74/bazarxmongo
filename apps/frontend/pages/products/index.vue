<template>
  <div class="products-page min-h-screen py-8 lg:py-12">
    <div class="container mx-auto px-4">
      <!-- Breadcrumb & Title -->
      <div class="mb-8 lg:mb-12">
        <div class="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-2">
          {{ categoryName || 'Tüm Ürünler' }}
        </div>
        <h1 class="text-4xl lg:text-6xl font-display font-black text-slate-800 italic tracking-tighter leading-none">
          Koleksiyonu Keşfet
        </h1>
      </div>

      <div class="flex flex-col lg:flex-row gap-12">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0 hidden lg:block">
          <div class="sticky top-24">
            <ProductFilters
              :categories="categories"
              :brands="brands"
              :current-filters="activeFilters"
              @update:filters="handleFilterChange"
              @clear:filters="clearFilters"
            />
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-grow">
          <!-- Toolbar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div class="text-xs font-bold text-slate-400">
              <span class="text-slate-800">{{ meta.total }}</span> ürün listeleniyor
            </div>
            
            <div class="flex items-center gap-4">
              <ProductSort 
                v-model="activeFilters.sort" 
                @update:model-value="handleFilterChange(activeFilters)"
              />
              
              <!-- Mobile Filter Trigger -->
              <UiButton
                variant="secondary"
                class="lg:hidden"
                @click="showMobileFilters = true"
              >
                <Icon name="heroicons:adjustments-horizontal" class="w-4 h-4 mr-2" />
                Filtrele
              </UiButton>
            </div>
          </div>

          <!-- Grid -->
          <ProductGrid
            :products="products"
            :loading="loading"
            @product-click="goToProduct"
          />

          <!-- Pagination -->
          <div v-if="meta.totalPages > 1" class="mt-12 flex justify-center">
            <UiPagination
              :total="meta.total"
              :page="meta.page"
              :limit="meta.limit"
              @change="goToPage"
            />
          </div>
        </main>
      </div>
    </div>

    <!-- Mobile Filters Slide-over -->
    <UiSlideOver
      v-model="showMobileFilters"
      title="Filtrele"
    >
      <ProductFilters
        :categories="categories"
        :brands="brands"
        :current-filters="activeFilters"
        @update:filters="handleFilterChange"
        @clear:filters="clearFilters"
      />
    </UiSlideOver>
  </div>
</template>

<script setup lang="ts">
import type { Category, Brand, Product } from '~/types/catalog'
import type { ApiResponse } from '~/types/api'
import type { ProductFilters } from '~/composables/useProducts'

const { products, loading, meta, filtersFromQuery, updateQuery, fetchProducts, goToPage, clearFilters } = useProducts()
const { $api } = useApi()
const route = useRoute()

const showMobileFilters = ref(false)
const activeFilters = ref(filtersFromQuery())

// Fetch reference data (categories/brands)
const { data: categories } = useAsyncData('filter-categories', async () => {
  const res = await $api<ApiResponse<Category[]>>('categories', { query: { all: true } })
  return res.data || []
}, { default: () => [] })

const { data: brands } = useAsyncData('filter-brands', async () => {
  const res = await $api<ApiResponse<Brand[]>>('brands')
  return res.data || []
}, { default: () => [] })

const categoryName = computed(() => {
  if (!activeFilters.value.categorySlug) return ''
  return categories.value?.find(c => c.slug === activeFilters.value.categorySlug)?.name || ''
})

function handleFilterChange(newFilters: Partial<ProductFilters>) {
  activeFilters.value = { ...activeFilters.value, ...newFilters, page: 1 }
  updateQuery(activeFilters.value)
}

function goToProduct(product: Product) {
  navigateTo(`/products/${product.slug}`)
}

// Watch query for fetching
watch(() => route.query, () => {
  activeFilters.value = filtersFromQuery()
  fetchProducts(activeFilters.value)
}, { immediate: true })

useAppSeo({
  title: categoryName.value || 'Ürünler',
  description: 'BarterBorsa ürün kataloğunu keşfedin, takas fırsatlarını yakalayın.'
})
</script>
