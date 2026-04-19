<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1400px] mx-auto px-4 py-6">
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

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 flex-shrink-0">
          <ProductFilters
            :categories="categories"
            :current-filters="currentFilters"
            @update:filters="handleFilterUpdate"
            @clear:filters="clearFilters"
          />
        </aside>

        <!-- Main Product Grid -->
        <main class="flex-1">
          <div v-if="pending" class="flex justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
          
          <div v-else-if="error" class="bg-red-50 p-4 rounded-xl text-red-600 text-center">
            {{ $t('products.errorLoading') }}
          </div>

          <div v-else>
            <div v-if="products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

            <!-- Simple Pagination -->
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
import type { Product, Category } from '@barterborsa/shared-types'
import { getProductUrl } from '~/utils/product-url'
import { useProductService } from '~/services/api/ProductService'
import { useCategoryService } from '~/services/api/CategoryService'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const productService = useProductService()
const categoryService = useCategoryService()

// Reactive Filter State from Query
const currentFilters = computed(() => ({
  categorySlug: route.query.categorySlug as string || undefined,
  page: Number(route.query.page) || 1,
  sort: route.query.sort as string || undefined
}))

// SSR Data Fetch
const { data: categoriesData } = await useAsyncData('categories', () => categoryService.getCategories())
const categories = computed(() => categoriesData.value?.data || [])

const { data: productsData, pending, error, refresh } = await useAsyncData(
  `products-${JSON.stringify(currentFilters.value)}`,
  () => productService.getProducts({
    ...currentFilters.value,
    limit: 20
  }),
  { watch: [() => route.query] }
)

const products = computed(() => productsData.value?.data || [])
const pagination = computed(() => ({
  page: productsData.value?.meta?.page || 1,
  total: productsData.value?.meta?.total || 0,
  totalPages: Math.ceil((productsData.value?.meta?.total || 0) / 20)
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

definePageMeta({ layout: 'default' })
useHead({ title: computed(() => `${currentCategoryName.value} | BarterBorsa`) })
</script>