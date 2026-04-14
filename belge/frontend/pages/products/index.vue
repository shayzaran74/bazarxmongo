<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-[1400px] mx-auto px-4 py-6">
      <!-- Breadcrumb -->
      <nav class="text-sm mb-4 flex items-center gap-2 text-gray-600">
        <NuxtLink
          to="/"
          class="hover:text-primary-600"
        >
          {{ $t('products.home') }}
        </NuxtLink>
        <span>/</span>
        <span class="text-gray-900 font-medium">{{ currentCategoryName }}</span>
      </nav>

      <!-- Header / Banner -->
      <div
        v-if="currentCategory"
        :class="[
          'mb-6 rounded-2xl overflow-hidden relative shadow-sm',
          (currentCategory.colorFrom || currentCategory.colorTo) && !currentCategory.image
            ? `bg-gradient-to-r ${currentCategory.colorFrom || 'from-blue-400'} ${currentCategory.colorTo || 'to-amber-500'}`
            : 'bg-white'
        ]"
      >
        <div
          v-if="currentCategory.image"
          class="absolute inset-0"
        >
          <img
            :src="currentCategory.image"
            :alt="currentCategory.name"
            class="w-full h-full object-cover"
          >
          <div class="absolute inset-0 bg-black/50" />
        </div>

        <div
          class="relative p-8 md:p-12"
          :class="[currentCategory.image || (currentCategory.colorFrom || currentCategory.colorTo) ? 'text-white' : 'text-gray-900']"
        >
          <div class="flex items-center gap-4 mb-2">
            <component
              :is="(HeroIcons as any)[currentCategory.icon] || HeroIcons.Squares2X2Icon"
              v-if="currentCategory.icon"
              class="w-10 h-10 md:w-16 md:h-16 opacity-90 drop-shadow-md"
            />
            <h1 class="text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">
              {{ currentCategory.name }}
            </h1>
          </div>
          <p
            v-if="currentCategory.description"
            class="text-lg opacity-90 drop-shadow-md font-medium max-w-2xl mt-4"
          >
            {{
              currentCategory.description }}
          </p>
          <div
            class="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-sm font-semibold border border-white/20 shadow-sm"
          >
            <span>{{ $t('products.premiumProducts', { count: pagination.total || 0 }) }}</span>
          </div>
        </div>
      </div>
      <div
        v-else
        class="mb-6"
      >
        <h1 class="text-2xl font-bold text-gray-900 mb-2">
          {{ $t('products.allProducts') }}
        </h1>
        <p class="text-gray-600">
          {{ $t('products.countProducts', { count: pagination.total || 0 }) }}
        </p>
      </div>

      <!-- AI Semantic Search Banner -->
      <div
        v-if="isAISearch"
        class="mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50"
        />
        <div class="relative flex items-center gap-4">
          <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
            <SparklesIcon class="w-7 h-7 text-white" />
          </div>
          <div>
            <h3 class="text-lg font-black tracking-tight">
              🧠 AI Semantik Arama
            </h3>
            <p class="text-sm text-white/80 mt-0.5">
              "<span class="font-bold text-white">{{ aiSearchQuery }}</span>" için
              pgvector ile vektörel eşleşme sonuçları
            </p>
          </div>
          <button
            class="ml-auto px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all backdrop-blur-sm"
            @click="clearAISearch"
          >
            Temizle
          </button>
        </div>
      </div>

      <div class="flex gap-6">
        <!-- Left Sidebar - Filters -->
        <aside class="w-64 flex-shrink-0 bg-white rounded-lg shadow-sm p-4 h-fit sticky top-4">
          <ProductFilters
            :categories="categories"
            :brands="brands_list"
            :current-filters="currentFilters"
            :available-specs="availableSpecs as Record<string, string[]>"
            @update:filters="handleFilterUpdate"
            @clear:filters="clearFilters"
          />
        </aside>

        <!-- Main Content -->
        <main class="flex-1">
          <!-- Quick Badges -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div class="flex flex-wrap gap-2">
              <button
                v-for="badge in quickBadges"
                :key="badge.id"
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  currentFilters[badge.key]
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                ]"
                @click="toggleQuickBadge(badge.id)"
              >
                <component
                  :is="badge.icon"
                  class="w-4 h-4"
                />
                {{ $t(`products.${badge.id === 'flash' ? 'flashProducts' : badge.id === 'highRated' ? 'highRated' :
                  badge.id === 'freeShipping' ? 'freeShipping' : badge.id === 'giftBox' ? 'giftBox' : 'featured'}`) }}
              </button>

              <!-- Geo Badge -->
              <button
                :class="[
                  'px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2',
                  userLocation && currentFilters.nearby ? 'bg-orange-100 text-orange-700 border-2 border-orange-500' : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                ]"
                @click="toggleGeoFilter"
              >
                <MapPinIcon class="w-4 h-4" />
                {{ userLocation && currentFilters.nearby ? $t('products.nearby') : $t('products.useLocation') }}
              </button>
            </div>
          </div>

          <!-- Sort Options -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-4 flex items-center justify-between">
            <span class="text-sm text-gray-600">{{ $t('products.recommendedSort') }}</span>
            <select
              v-model="currentFilters.sort"
              class="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              @change="handleSortChange"
            >
              <option value="">
                {{ $t('products.sortOptions.recommended') }}
              </option>
              <option value="priceAsc">
                {{ $t('products.sortOptions.priceAsc') }}
              </option>
              <option value="priceDesc">
                {{ $t('products.sortOptions.priceDesc') }}
              </option>
              <option value="newest">
                {{ $t('products.sortOptions.newest') }}
              </option>
              <option value="popular">
                {{ $t('products.sortOptions.popular') }}
              </option>
              <option value="rating">
                {{ $t('products.sortOptions.rating') }}
              </option>
              <option
                v-if="userLocation"
                value="distance"
              >
                {{ $t('products.sortOptions.distance') }}
              </option>
            </select>
          </div>

          <!-- Loading State -->
          <div
            v-if="loading"
            class="flex justify-center items-center h-64"
          >
            <div class="spinner h-12 w-12" />
          </div>

          <!-- Error State -->
          <div
            v-else-if="error"
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <p class="text-red-800">
              {{ error }}
            </p>
          </div>

          <!-- Products Grid -->
          <div v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <div
                v-for="product in products"
                :key="product.id"
                class="relative"
              >
                <!-- AI Similarity Score Badge -->
                <div
                  v-if="isAISearch && product.similarityScore"
                  class="absolute top-2 right-2 z-10 px-2 py-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[10px] font-black rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-1"
                >
                  <SparklesIcon class="w-3 h-3" />
                  {{ Math.round(product.similarityScore * 100) }}%
                </div>
                <ProductCard
                  :product="product"
                  :badges="getProductBadges(product)"
                  @click="navigateTo(getProductUrl(product as Product))"
                  @add-to-cart="addToCart"
                />
              </div>
            </div>

            <!-- Empty State -->
            <div
              v-if="products.length === 0 && !loading"
              class="text-center py-16"
            >
              <svg
                class="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <h3 class="mt-4 text-lg font-medium text-gray-900">
                {{ $t('products.noProductFound') }}
              </h3>
              <p class="mt-2 text-sm text-gray-500">
                {{ $t('products.noProductFoundDesc') }}
              </p>
              <button
                class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                @click="clearFilters"
              >
                {{ $t('products.clearFilters') }}
              </button>
            </div>

            <!-- Pagination -->
            <div
              v-if="pagination.totalPages > 1"
              class="mt-8 flex justify-center"
            >
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  :disabled="pagination.page === 1"
                  class="relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="goToPage(pagination.page - 1)"
                >
                  ‹
                </button>

                <template
                  v-for="page in pagination.totalPages"
                  :key="page"
                >
                  <button
                    v-if="shouldShowPage(page)"
                    :class="[
                      page === pagination.page
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                      'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                    ]"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                  <span
                    v-else-if="Math.abs(page - pagination.page) === 3"
                    class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                </template>

                <button
                  :disabled="pagination.page === pagination.totalPages"
                  class="relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  @click="goToPage(pagination.page + 1)"
                >
                  ›
                </button>
              </nav>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as HeroIcons from '@heroicons/vue/24/outline'
import type { Product, Category, Brand, PaginatedResponse, ApiResponse } from '@barterborsa/shared-types'
import { getProductUrl } from '~/utils/product-url'

interface PaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

interface FilterState {
  [key: string]: string | number | boolean | string[] | undefined
  categorySlug?: string
  sort?: string
  nearby?: boolean
}

const {
  BoltIcon,
  StarIcon,
  TruckIcon,
  GiftIcon,
  SparklesIcon,
  MapPinIcon
} = HeroIcons

const { getProductBadges } = useProductBadges()

definePageMeta({
  layout: 'default'
})

const { t } = useI18n()
useHead({
  title: `${t('products.pageTitle')}`,
  meta: [
    {
      name: 'description',
      content: `${t('products.metaDescription')}`
    }
  ]
})

const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()

// State
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const brands_list = ref<Brand[]>([])
const availableSpecs = ref<Record<string, unknown>>({})
const loading = ref(false)
const error = ref<string | null>(null)
const currentFilters = ref<FilterState>({})
const pagination = ref<PaginationState>({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0
})

// AI Search State
const isAISearch = computed(() => route.query.ai === 'true' && !!route.query.search)
const aiSearchQuery = computed(() => (route.query.search as string) || '')

const userLocation = ref<{ lat: number; lng: number } | null>(null)

// Quick Badges
const quickBadges = [
  { id: 'flash', label: 'Flaş Ürünler', key: 'isFlashSale', icon: BoltIcon },
  { id: 'highRated', label: 'Yüksek Puanlı', key: 'highRated', icon: StarIcon },
  { id: 'freeShipping', label: 'Kargo Bedava', key: 'freeShipping', icon: TruckIcon },
  { id: 'giftBox', label: 'Hediye Paketi', key: 'giftBox', icon: GiftIcon },
  { id: 'featured', label: 'Öne Çıkanlar', key: 'isFeatured', icon: SparklesIcon }
]

// Computed
const currentCategory = computed(() => {
  const slug = (route.query.categorySlug as string) || (currentFilters.value.categorySlug as string)
  if (!slug) return null
  return categories.value.find(c => c.slug === slug) || null
})

const currentCategoryName = computed(() => {
  return currentCategory.value ? currentCategory.value.name : t('products.title')
})

// Methods
const fetchProducts = async (page = 1, filters: FilterState = {}) => {
  loading.value = true
  error.value = null

  try {
    const cleanFilters: Record<string, unknown> = {}
    Object.keys(filters).forEach(key => {
      const value = filters[key]
      if (value !== undefined && value !== null && value !== '' && value !== false) {
        cleanFilters[key] = value
      }
    })

    const { $api } = useApi()

    // AI Semantic Search Mode
    if (isAISearch.value) {
      const data = await $api<PaginatedResponse<Product>>('/api/products/natural-search', {
        query: {
          q: aiSearchQuery.value,
          page,
          limit: pagination.value.limit
        }
      })

      if (data.success && data.data) {
        products.value = data.data
        if (data.pagination) {
          pagination.value = {
            page: data.pagination.page || 1,
            limit: data.pagination.limit || 20,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || 0
          }
        }
      }
    } else {
      // Standard product search
      const data = await $api<PaginatedResponse<Product>>('/api/products', {
        query: {
          page,
          limit: pagination.value.limit,
          ...cleanFilters,
          lat: userLocation.value?.lat,
          lng: userLocation.value?.lng,
          radius: currentFilters.value.nearby ? 50 : undefined
        }
      })

      if (data.success && data.data) {
        products.value = data.data
        if (data.pagination) {
          pagination.value = {
            page: data.pagination.page || 1,
            limit: data.pagination.limit || 20,
            total: data.pagination.total || 0,
            totalPages: data.pagination.totalPages || 0
          }
        }
      }
    }
  } catch (err: unknown) {
    const errorMsg = (err as Error)?.message || t('products.errorLoading')
    error.value = errorMsg
    console.error('Fetch products error:', err)
  } finally {
    loading.value = false
  }
}

const clearAISearch = () => {
  const query = { ...route.query }
  delete query.ai
  delete query.search
  router.push({ query })
}

const fetchCategories = async () => {
  try {
    const { $api } = useApi()
    const data = await $api<ApiResponse<Category[]>>('/api/categories')
    if (data.success && data.data) {
      categories.value = data.data
    }
  } catch (err) {
    console.error('Fetch categories error:', err)
  }
}

const fetchBrands = async () => {
  try {
    const { $api } = useApi()
    const data = await $api<ApiResponse<Brand[]>>('/api/brands')
    if (data.success && data.data) {
      brands_list.value = data.data
    }
  } catch (err) {
    console.error('Fetch brands error:', err)
  }
}

const fetchAvailableSpecs = async () => {
  try {
    const { $api } = useApi()
    const data = await $api<ApiResponse<Record<string, unknown>>>('/api/products/specs', {
      query: { categorySlug: currentFilters.value.categorySlug }
    })
    if (data.success && data.data) {
      availableSpecs.value = data.data || {}
    }
  } catch (err) {
    console.error('Fetch specs error:', err)
  }
}

const handleFilterUpdate = (filters: FilterState) => {
  currentFilters.value = filters
  updateQueryParams(filters)
  fetchProducts(1, filters)
}

const handleSortChange = () => {
  updateQueryParams(currentFilters.value)
  fetchProducts(1, currentFilters.value)
}

const toggleQuickBadge = (badgeId: string) => {
  const badge = quickBadges.find(b => b.id === badgeId)
  if (badge && badge.key) {
    currentFilters.value[badge.key] = !currentFilters.value[badge.key]
    handleFilterUpdate(currentFilters.value)
  }
}

const toggleGeoFilter = () => {
  if (userLocation.value) {
    currentFilters.value.nearby = !currentFilters.value.nearby
    if (currentFilters.value.nearby) {
      currentFilters.value.sort = 'distance'
    } else if (currentFilters.value.sort === 'distance') {
      currentFilters.value.sort = 'newest'
    }
    handleFilterUpdate(currentFilters.value)
  } else {
    requestLocation()
  }
}

const requestLocation = () => {
  if (!navigator.geolocation) {
    alert(t('products.geoNotSupported'))
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      // Automatically enable nearby filter on first success
      currentFilters.value.nearby = true
      currentFilters.value.sort = 'distance'
      handleFilterUpdate(currentFilters.value)
    },
    (err) => {
      console.error('Konum alınamadı:', err)
      alert(t('products.locationError'))
    }
  )
}

const clearFilters = () => {
  currentFilters.value = {}
  router.push({ query: {} })
  fetchProducts(1, {})
}

const updateQueryParams = (filters: FilterState) => {
  const query: Record<string, string | number | boolean | string[] | undefined> = {}
  Object.keys(filters).forEach(key => {
    if (filters[key]) {
      query[key] = filters[key]
    }
  })
  router.push({ query: query as Record<string, string | string[] | null | undefined> })
}

const syncFiltersFromQuery = () => {
  const newFilters: FilterState = {}
  Object.keys(route.query).forEach(key => {
    newFilters[key] = route.query[key] as string | number | boolean | string[] | undefined
  })
  currentFilters.value = newFilters
  return fetchProducts(1, newFilters)
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    fetchProducts(page, currentFilters.value)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const shouldShowPage = (page: number) => {
  return Math.abs(page - pagination.value.page) <= 2 || page === 1 || page === pagination.value.totalPages
}

const addToCart = async (product: Product) => {
  const targetId = (product.bestListingId || product.id)?.toString()
  if (targetId) {
    await cartStore.addToCart(targetId, 1, undefined, product)
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchCategories(),
    fetchBrands(),
    fetchAvailableSpecs()
  ])
  await syncFiltersFromQuery()
})

watch(
  () => route.query,
  () => {
    syncFiltersFromQuery()
  },
  { deep: true }
)

watch(
  () => currentFilters.value.categorySlug,
  () => {
    fetchAvailableSpecs()
  }
)
</script>

<style scoped>
.spinner {
  border: 3px solid #f3f4f6;
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>