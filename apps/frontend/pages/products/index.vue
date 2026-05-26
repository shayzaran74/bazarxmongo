<template>
  <div class="min-h-screen bg-gray-50">
    <div class="w-full px-4 lg:px-8 py-6">
      <!-- Breadcrumb -->
      <nav class="text-sm mb-4 flex items-center gap-2 text-gray-600">
        <NuxtLink to="/" class="hover:text-primary-600">{{ $t('products.home') }}</NuxtLink>
        <span>/</span>
        <span class="text-gray-900 font-medium">{{ currentCategoryName }}</span>
      </nav>

      <!-- Category Banner -->
      <div
        v-if="currentCategory"
        :class="['mb-6 rounded-2xl overflow-hidden relative shadow-sm', (currentCategory.colorFrom || currentCategory.colorTo) && !currentCategory.image ? `bg-gradient-to-r ${currentCategory.colorFrom || 'from-blue-400'} ${currentCategory.colorTo || 'to-amber-500'}` : 'bg-white']"
      >
        <div v-if="currentCategory.image" class="absolute inset-0">
          <img :src="currentCategory.image" :alt="currentCategory.name" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-black/50" />
        </div>
        <div class="relative p-8 md:p-12" :class="[currentCategory.image || (currentCategory.colorFrom || currentCategory.colorTo) ? 'text-white' : 'text-gray-900']">
          <div class="flex items-center gap-4 mb-2">
            <h1 class="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">{{ currentCategory.name }}</h1>
          </div>
          <p v-if="currentCategory.description" class="text-lg opacity-90 drop-shadow-md font-medium max-w-2xl mt-4">{{ currentCategory.description }}</p>
        </div>
      </div>

      <div class="flex flex-col xl:flex-row gap-6">
        <!-- Sidebar Filters (Collapsible on mobile) -->
        <aside v-show="isSidebarOpen" class="xl:w-72 flex-shrink-0 relative">
          <div class="flex justify-end mb-2">
            <button @click="isSidebarOpen = false" class="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md transition-colors" title="Filtreleri Gizle">
              <HeroIcons.Bars3Icon class="w-6 h-6" />
            </button>
          </div>
          <ProductFilters
            :categories="categories"
            :current-filters="currentFilters"
            @update:filters="handleFilterUpdate"
            @clear:filters="clearFilters"
          />
        </aside>

        <!-- Main Product Grid -->
        <main class="flex-1">
          <div v-if="!isSidebarOpen" class="mb-4">
            <button @click="isSidebarOpen = true" class="p-2 bg-white text-gray-700 border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 flex items-center gap-2 font-bold transition-colors">
              <HeroIcons.Bars3Icon class="w-5 h-5" />
              <span class="text-sm">Kategoriler / Filtreler</span>
            </button>
          </div>
          <div v-if="pending" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="error" class="bg-red-50 p-4 rounded-xl text-red-600 text-center">
            {{ $t('products.errorLoading') }}
          </div>

          <div v-else>
            <!-- Active Filters Pills -->
            <div v-if="hasActiveFilters" class="mb-6 flex flex-wrap items-center gap-3">
              <span class="text-xs font-black text-gray-400 uppercase tracking-widest">Aktif Filtreler:</span>
              <button
                v-if="currentFilters.categorySlug"
                class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-200 transition-colors"
                @click="removeFilter('categorySlug')"
              >
                {{ getCategoryName(currentFilters.categorySlug) }}
                <XMarkIcon class="w-3 h-3" />
              </button>
              <button
                v-if="currentFilters.brand"
                class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-200 transition-colors"
                @click="removeFilter('brand')"
              >
                {{ currentFilters.brand }}
                <XMarkIcon class="w-3 h-3" />
              </button>
              <button
                v-if="currentFilters.minPrice || currentFilters.maxPrice"
                class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-200 transition-colors"
                @click="removeFilter('price')"
              >
                {{ currentFilters.minPrice || 0 }}₺ - {{ currentFilters.maxPrice || '∞' }}₺
                <XMarkIcon class="w-3 h-3" />
              </button>
              <button
                v-if="currentFilters.search"
                class="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-200 transition-colors"
                @click="removeFilter('search')"
              >
                "{{ currentFilters.search }}"
                <XMarkIcon class="w-3 h-3" />
              </button>
              <button
                class="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold hover:bg-gray-200 transition-colors"
                @click="clearFilters"
              >
                Tümünü Temizle
              </button>
            </div>

            <div v-if="products.length > 0" class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              <ProductCard
                v-for="product in products"
                :key="product.id"
                :product="product"
                @click="navigateTo(getProductUrl(product))"
              />
            </div>

            <div v-else class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div class="text-gray-400 mb-4">
                <HeroIcons.CommandLineIcon class="w-16 h-16 mx-auto opacity-20" />
              </div>
              <h3 class="text-lg font-bold text-gray-900">{{ $t('products.noProductFound') }}</h3>
              <p class="text-gray-500 mb-6">{{ $t('products.noProductFoundDesc') }}</p>
              <button @click="clearFilters" class="px-6 py-2 bg-primary-600 text-white rounded-xl font-bold">{{ $t('products.clearFilters') }}</button>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1" class="mt-12 flex justify-center gap-2">
              <button
                :disabled="pagination.page === 1"
                class="px-4 py-2 border rounded-xl disabled:opacity-30"
                @click="goToPage(pagination.page - 1)"
              >‹</button>
              <span class="flex items-center px-4 font-bold text-sm">{{ pagination.page }} / {{ pagination.totalPages }}</span>
              <button
                :disabled="pagination.page === pagination.totalPages"
                class="px-4 py-2 border rounded-xl disabled:opacity-30"
                @click="goToPage(pagination.page + 1)"
              >›</button>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import type { Product, Category } from '@barterborsa/shared-types'
import { getProductUrl } from '~/utils/product-url'
import { useProductService } from '~/services/api/ProductService'
import { useCategoryService } from '~/services/api/CategoryService'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const productService = useProductService()
const categoryService = useCategoryService()

const isSidebarOpen = ref(true)

// Reactive Filter State from Query
const currentFilters = computed(() => {
  const filters: Record<string, any> = {
    categorySlug: route.query.categorySlug || route.query.category || undefined,
    page: Number(route.query.page) || 1,
    sort: route.query.sort as string || undefined,
    search: route.query.search as string || undefined,
    brand: route.query.brand as string || undefined,
  }
  if (route.query.minPrice) filters.minPrice = Number(route.query.minPrice)
  if (route.query.maxPrice) filters.maxPrice = Number(route.query.maxPrice)

  return Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined))
})

const hasActiveFilters = computed(() =>
  currentFilters.value.categorySlug || currentFilters.value.brand ||
  currentFilters.value.minPrice || currentFilters.value.maxPrice || currentFilters.value.search
)

const getCategoryName = (slug: string) => {
  const cat = categories.value.find(c => c.slug === slug)
  return cat?.name || slug
}

const removeFilter = (key: string) => {
  const q = { ...route.query }
  if (key === 'price') { delete q.minPrice; delete q.maxPrice }
  else if (key === 'categorySlug') { delete q.categorySlug; delete q.category }
  else delete q[key]
  router.push({ query: q })
}

// SSR Data Fetch
const { data: categoriesData } = await useAsyncData('categories', () => categoryService.getCategories())
const categories = computed(() => categoriesData.value?.data || [])

const { data: productsData, pending, error, refresh } = await useAsyncData(
  `products-${JSON.stringify(currentFilters.value)}`,
  () => productService.getProducts({
    ...currentFilters.value,
    limit: 24
  }),
  { watch: [() => route.query] }
)

const products = computed(() => productsData.value?.data || [])
const pagination = computed(() => ({
  page: productsData.value?.meta?.page || 1,
  total: productsData.value?.meta?.total || 0,
  totalPages: Math.ceil((productsData.value?.meta?.total || 0) / 24)
}))

const currentCategory = computed(() => {
  return categories.value.find(c => c.slug === currentFilters.value.categorySlug)
})
const currentCategoryName = computed(() => currentCategory.value?.name || t('products.allProducts'))

// Methods
const handleFilterUpdate = (filters: any) => {
  router.push({ query: { ...route.query, ...filters, page: 1 } })
}

const clearFilters = () => {
  router.push({ query: {} })
}

const goToPage = (page: number) => {
  router.push({ query: { ...route.query, page } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

definePageMeta({ layout: 'default', hideSideAds: true })
useHead({ title: computed(() => `${currentCategoryName.value} | BarterBorsa`) })
</script>