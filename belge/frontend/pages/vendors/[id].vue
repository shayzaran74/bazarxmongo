<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Side Advertisements -->
    <template v-if="vendor?.showAd">
      <!-- Left Ad -->
      <div class="hidden 2xl:flex absolute left-0 top-[450px] bottom-0 w-60 flex-col px-4 pointer-events-none z-10">
        <div class="sticky top-32 pointer-events-auto flex flex-col gap-6">
          <!-- Custom Left Ad Product -->
          <div
            v-if="vendor?.adProductLeft"
            class="w-full h-[550px] bg-gradient-to-b from-primary-100 to-white rounded-3xl border-4 border-dashed border-primary-300 flex flex-col items-center justify-center p-6 text-center shadow-xl hover:border-primary-500 hover:scale-105 transition-all cursor-pointer group overflow-hidden shrink-0"
          >
            <div
              class="w-full h-full flex flex-col items-center justify-center"
              @click="navigateToProduct(vendor.adProductLeft.id)"
            >
              <NuxtImg
                :src="getImageUrl(vendor.adProductLeft)"
                :alt="vendor.adProductLeft.name"
                fit="cover"
                class="w-full h-48 object-contain mb-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg bg-white/50"
                placeholder
              />
              <p
                class="text-sm font-black text-primary-900 uppercase tracking-tighter mb-2 line-clamp-2 px-1 leading-tight"
              >
                {{ vendor.adProductLeft.name }}
              </p>
              <div class="flex items-center gap-2 mb-4">
                <span class="text-lg font-black text-primary-600">{{ formatPrice(vendor.adProductLeft.price) }}</span>
              </div>
              <button
                class="px-6 py-2 bg-primary-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-primary-700 transition-colors"
                @click.stop="addToCart(vendor.adProductLeft)"
              >
                İNCELE
              </button>
            </div>
          </div>

          <!-- Fallback Image Ad -->
          <div
            v-else-if="vendor?.adImageUrlLeft"
            class="group relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-500"
          >
            <a
              :href="vendor.adLinkUrlLeft || '#'"
              target="_blank"
              class="block"
            >
              <NuxtImg
                :src="vendor.adImageUrlLeft"
                class="w-full h-auto"
                placeholder
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Right Ad -->
      <div class="hidden 2xl:flex absolute right-0 top-[450px] bottom-0 w-60 flex-col px-4 pointer-events-none z-10">
        <div class="sticky top-32 pointer-events-auto flex flex-col gap-6">
          <!-- Custom Right Ad Product -->
          <div
            v-if="vendor?.adProductRight"
            class="w-full h-[550px] bg-gradient-to-b from-purple-100 to-white rounded-3xl border-4 border-dashed border-purple-300 flex flex-col items-center justify-center p-6 text-center shadow-xl hover:border-purple-500 hover:scale-105 transition-all cursor-pointer group overflow-hidden shrink-0"
          >
            <div
              class="w-full h-full flex flex-col items-center justify-center"
              @click="navigateToProduct(vendor.adProductRight.id)"
            >
              <NuxtImg
                :src="getImageUrl(vendor.adProductRight)"
                :alt="vendor.adProductRight.name"
                fit="cover"
                class="w-full h-48 object-contain mb-6 rounded-2xl group-hover:scale-110 transition-transform shadow-lg bg-white/50"
                placeholder
              />
              <p
                class="text-sm font-black text-purple-900 uppercase tracking-tighter mb-2 line-clamp-2 px-1 leading-tight"
              >
                {{ vendor.adProductRight.name }}
              </p>
              <div class="flex items-center gap-2 mb-4">
                <span class="text-lg font-black text-purple-600">{{ formatPrice(vendor.adProductRight.price) }}</span>
              </div>
              <button
                class="px-6 py-2 bg-purple-600 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-purple-700 transition-colors"
                @click.stop="addToCart(vendor.adProductRight)"
              >
                HEMEN KATIL
              </button>
            </div>
          </div>

          <!-- Fallback Image Ad -->
          <div
            v-else-if="vendor?.adImageUrlRight"
            class="group relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white transform hover:scale-105 transition-all duration-500"
          >
            <a
              :href="vendor.adLinkUrlRight || '#'"
              target="_blank"
              class="block"
            >
              <NuxtImg
                :src="vendor.adImageUrlRight"
                class="w-full h-auto"
                placeholder
              />
            </a>
          </div>
        </div>
      </div>
    </template>
    <!-- Home Banner Slider - Full Width -->
    <VendorBannerSlider :vendor-id="(route.params.id as string)" />
    <!-- Vendor Header / Hero Section -->
    <div class="relative">
      <!-- Cover Image -->
      <div class="h-64 md:h-80 w-full overflow-hidden relative">
        <NuxtImg
          :src="vendor?.coverImageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop'"
          class="w-full h-full object-cover"
          alt="Vendor Cover"
          placeholder
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
      </div>

      <!-- Vendor Info Overlay -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-8">
        <div
          class="bg-white rounded-3xl shadow-xl p-6 md:p-8 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 overflow-hidden relative border border-gray-100"
        >
          <div class="flex flex-col md:flex-row items-center md:items-end gap-6">
            <!-- Logo -->
            <div
              class="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white p-1 shadow-2xl overflow-hidden -mt-16 border-4 border-white"
            >
              <NuxtImg
                :src="vendor?.logoUrl || 'https://placehold.co/200x200?text=' + vendor?.businessName"
                class="w-full h-full object-contain rounded-xl"
                placeholder
                @error="handleLogoError"
              />
            </div>

            <div class="text-center md:text-left">
              <div class="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h1 class="text-3xl font-black text-gray-900 tracking-tight">
                  {{ vendor?.businessName }}
                </h1>
                <CheckBadgeIcon
                  v-if="vendor?.status === 'APPROVED'"
                  class="h-6 w-6 text-blue-500"
                />
              </div>
              <p class="text-gray-500 mb-3 line-clamp-2 max-w-xl">
                {{ vendor?.description || 'En kaliteli ürünlerle hizmetinizdeyiz.' }}
              </p>

              <div class="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div
                  class="flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
                >
                  <StarIcon class="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  {{ vendor?.averageRating?.toFixed(1) || '0.0' }} Mağaza Puanı
                </div>
                <div
                  class="flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
                >
                  <ShoppingBagIcon class="h-4 w-4 text-primary-600 mr-1" />
                  {{ vendor?._count?.listings || 0 }} Ürün
                </div>
                <div
                  class="flex items-center text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100"
                >
                  <CalendarDaysIcon class="h-4 w-4 text-gray-400 mr-1" />
                  {{ formatDate(vendor?.createdAt as string) }}'den beri üye
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="flex items-center gap-3">
            <button
              class="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
              :class="{ 'bg-green-600 hover:bg-green-700': isFollowing }"
              @click="followVendor"
            >
              <component
                :is="isFollowing ? CheckBadgeIcon : UserPlusIcon"
                class="h-5 w-5"
              />
              {{ isFollowing ? 'Takip Ediliyor' : 'Takip Et' }}
            </button>
            <button
              class="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-xl transition-all"
              @click="shareVendor"
            >
              <ShareIcon class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Tabs Switcher -->
      <div class="flex items-center space-x-2 mb-10 p-1 bg-gray-100 rounded-[2rem] w-fit border border-gray-200">
        <button
          class="px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
          :class="activeMainTab === 'products' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'"
          @click="activeMainTab = 'products'"
        >
          Ürünler
        </button>
        <button
          class="px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
          :class="activeMainTab === 'reviews' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'"
          @click="activeMainTab = 'reviews'"
        >
          Değerlendirmeler ({{ vendor?._count?.receivedReviews || 0 }})
        </button>
      </div>

      <!-- Detailed Search & Filters (Custom for this Vendor) -->
      <div
        v-show="activeMainTab === 'products'"
        class="mb-12"
      >
        <AdvancedSearch
          :is-vendor-store="true"
          :categories="vendor?.categories?.map(vc => vc.category)"
          :brands="vendor?.brands"
          @filter="handleFilter"
        />
      </div>

      <div class="flex flex-col gap-12">
        <!-- Flash Sales Section -->
        <div
          v-if="vendor?.showFlashSales && (vendor?.flashProducts?.length || 0) > 0"
          class="mb-12"
        >
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-sm">
                <BoltIcon class="h-7 w-7 text-amber-600" />
              </div>
              <div>
                <h2 class="text-3xl font-black text-gray-900 tracking-tight italic">
                  FLAŞ FIRSATLAR
                </h2>
                <p class="text-sm font-bold text-amber-600 uppercase tracking-widest">
                  Sınırlı Süre & Sınırlı Stok
                </p>
              </div>
            </div>
            <div class="hidden sm:flex items-center gap-2">
              <div class="px-4 py-2 bg-white border border-gray-100 rounded-xl shadow-sm">
                <span class="text-xs font-black text-gray-400 uppercase tracking-widest block">Bitişe</span>
                <span class="text-sm font-black text-gray-900">02:45:12</span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div
              v-for="product in vendor.flashProducts"
              :key="'flash-' + product.id"
              class="group bg-white rounded-[2rem] border-2 border-amber-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col hover:-translate-y-2 relative"
            >
              <!-- Flash Product Badge -->
              <div class="absolute top-3 right-3 z-10 bg-amber-500 text-white p-1.5 rounded-lg shadow-lg">
                <BoltIcon class="h-4 w-4" />
              </div>

              <!-- Product Image -->
              <div
                class="aspect-square overflow-hidden relative cursor-pointer"
                @click="navigateToProduct(product.id)"
              >
                <NuxtImg
                  :src="getImageUrl(product) || '/images/placeholder.png'"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  placeholder
                />
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

                <div
                  class="absolute bottom-3 left-3 right-3 translate-y-12 group-hover:translate-y-0 transition-transform duration-300"
                >
                  <button
                    class="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                    @click.stop="addToCart(product)"
                  >
                    <ShoppingCartIcon class="h-4 w-4" />
                    Sepete Ekle
                  </button>
                </div>
              </div>

              <!-- Info -->
              <div class="p-4 flex-1 flex flex-col">
                <h3
                  class="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[40px] leading-tight group-hover:text-amber-600 transition-colors"
                >
                  {{ product.name }}
                </h3>
                <div class="mt-auto flex items-end justify-between">
                  <div class="flex flex-col">
                    <span class="text-[10px] text-gray-400 line-through">{{ formatPrice(product.compareAtPrice ||
                      product.price * 1.5) }}</span>
                    <span class="text-lg font-black text-amber-600">{{ formatPrice(product.price) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Products Section -->
        <div
          v-show="activeMainTab === 'products'"
          id="products-list"
        >
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
            <h2 class="text-2xl font-black text-gray-900">
              Mağaza Ürünleri
              <span class="text-sm font-medium text-gray-400 ml-2">({{ products.length }} ürün bulundu)</span>
            </h2>
          </div>

          <!-- Loading State -->
          <div
            v-if="productsLoading"
            class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <div
              v-for="i in 8"
              :key="i"
              class="animate-pulse"
            >
              <div class="aspect-square bg-gray-200 rounded-2xl mb-4" />
              <div class="h-4 bg-gray-200 rounded w-3/4 mb-2" />
              <div class="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-else-if="products.length === 0"
            class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200"
          >
            <ShoppingBagIcon class="h-16 w-16 text-gray-200 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-900">
              Ürün Bulunamadı
            </h3>
            <p class="text-gray-500">
              Arama kriterlerinize uygun ürün bulunamadı veya henüz ürün eklenmemiş.
            </p>
          </div>

          <!-- Products Grid -->
          <div
            v-else
            class="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <div
              v-for="product in products"
              :key="product.id"
              class="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col h-full hover:-translate-y-2 relative"
            >
              <!-- Product Image -->
              <div
                class="aspect-square overflow-hidden relative cursor-pointer"
                @click="navigateToProduct(product.id)"
              >
                <div
                  v-if="product.badgeText"
                  class="absolute top-2 left-2 px-2 py-1 rounded text-[10px] font-bold text-white shadow-sm z-10"
                  :style="{ backgroundColor: product.badgeColor || '#ef4444' }"
                >
                  {{ product.badgeText }}
                </div>
                <NuxtImg
                  :src="getImageUrl(product) || '/images/placeholder.png'"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  placeholder
                />

                <div
                  class="absolute bottom-4 left-4 right-4 translate-y-12 group-hover:translate-y-0 transition-transform duration-300 flex gap-2"
                >
                  <button
                    class="flex-1 bg-white hover:bg-primary-600 hover:text-white text-gray-900 py-2.5 rounded-xl font-bold shadow-xl flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
                    @click.stop="addToCart(product)"
                  >
                    <ShoppingCartIcon class="h-4 w-4" />
                    Ekle
                  </button>
                </div>
              </div>

              <!-- Product Info -->
              <div
                class="p-4 flex-1 flex flex-col cursor-pointer"
                @click="navigateToProduct(product.id)"
              >
                <h3
                  class="text-sm font-bold text-gray-900 mb-2 line-clamp-2 min-h-[40px] leading-tight group-hover:text-primary-600 transition-colors"
                >
                  {{ product.name }}
                </h3>
                <div class="mt-auto flex items-end justify-between gap-2">
                  <div class="flex flex-col">
                    <span
                      v-if="product.compareAtPrice"
                      class="text-[10px] text-gray-400 line-through"
                    >
                      {{ formatPrice(product.compareAtPrice) }}
                    </span>
                    <span class="text-lg font-black text-gray-900 tracking-tight">
                      {{ formatPrice(product.price) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Load More Button -->
          <div
            v-if="hasMore"
            class="mt-12 text-center"
          >
            <button
              class="px-8 py-3 bg-white border border-gray-200 text-gray-900 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:shadow-md transition-all flex items-center gap-2 mx-auto"
              :disabled="productsLoading"
              @click="loadMore"
            >
              <span
                v-if="productsLoading"
                class="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"
              />
              <span v-else>Daha Fazla Ürün Göster ({{ totalProducts - products.length }})</span>
            </button>
          </div>
        </div>

        <!-- Reviews Section -->
        <div
          v-show="activeMainTab === 'reviews'"
          class="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div class="lg:col-span-1">
            <UserReviewStats :user-id="vendor?.userId as string" />
          </div>
          <div class="lg:col-span-2">
            <UserReviewList :user-id="vendor?.userId as string" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVendorService } from '~/services/api/VendorService'
import {
  StarIcon,
  ShoppingBagIcon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  UserPlusIcon,
  ShareIcon,
    ShoppingCartIcon,
    BoltIcon
} from '@heroicons/vue/24/solid'
import UserReviewStats from '~/components/trade/UserReviewStats.vue'
import UserReviewList from '~/components/trade/UserReviewList.vue'
import { useAuthStore } from '~/stores/auth'
import type { Vendor, Product, VendorAdProduct } from '@barterborsa/shared-types'

const route = useRoute()
const vendorService = useVendorService()
const cartStore = useCartStore()
const authStore = useAuthStore()
const toast = useNuxtApp().$toast

const vendor = ref<Vendor | null>(null)
const loading = ref(true)
const isFollowing = ref(false)
const followLoading = ref(false)
const activeMainTab = ref('products')

// Products filtering & Pagination
const products = ref<Product[]>([])
const productsLoading = ref(false)
const currentFilters = ref<Record<string, unknown>>({})
const page = ref(1)
const limit = ref(12)
const totalProducts = ref(0) // Backend total count

const hasMore = computed(() => {
  return products.value.length < totalProducts.value
})

const fetchVendor = async () => {
  loading.value = true
  try {
    const response = await vendorService.getVendorPublic(route.params.id as string)
    if (response.success && response.data) {
      vendor.value = response.data
      // If products are already in vendor data and list is empty, populate it
      if (response.data.products && products.value.length === 0) {
        products.value = response.data.products
        totalProducts.value = response.data._count?.listings || response.data.products.length
      }
    }
  } catch (error) {
    console.error('Fetch vendor error:', error)
    toast.error('Satıcı profili yüklenemedi')
  } finally {
    loading.value = false
  }
}

const fetchProducts = async (params: Record<string, unknown> = {}, append = false) => {
  productsLoading.value = true
  try {
    const queryParams: Record<string, unknown> = {
      vendorId: route.params.id,
      ...params
    }

    // Convert named parameters
    if (queryParams.category) {
      queryParams.categorySlug = queryParams.category
      delete queryParams.category
    }

    // Reset pagination if not appending (new filter applied)
    if (!append) {
      page.value = 1
    }

    // Backend doesn't like empty strings
    const cleanParams: Record<string, unknown> = {}
    Object.keys(queryParams).forEach(key => {
      const val = queryParams[key]
      if (val !== undefined && val !== null && val !== '') {
        cleanParams[key] = val
      }
    })

    // Add pagination params
    cleanParams.page = page.value
    cleanParams.limit = limit.value

    const response = await vendorService.getVendorProducts(route.params.id as string, cleanParams)

    if (response.success && response.data) {
      console.log('Fetched products:', response.data.length, 'items', 'Total:', response.pagination?.total)

      if (append) {
        products.value = [...products.value, ...response.data]
      } else {
        products.value = response.data
      }

      totalProducts.value = response.pagination?.total || 0
    } else {
      console.log('Product fetch failed:', response)
    }
  } catch (error) {
    console.error('Fetch products error:', error)
  } finally {
    productsLoading.value = false
  }
}

const loadMore = () => {
  page.value++
  fetchProducts(currentFilters.value, true)
}

const handleFilter = (filters: Record<string, unknown>) => {
  currentFilters.value = filters
  fetchProducts(filters, false) // false means reset list

  // Scroll to products if on mobile
  if (process.client) {
    const el = document.getElementById('products-list')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price || 0)
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).getFullYear()
}

const navigateToProduct = (id: string | number) => {
  navigateTo(`/products/${id}`)
}

const getImageUrl = (product: Product | VendorAdProduct | null | undefined) => {
  if (!product?.image) return '/images/placeholder.png'
  if (typeof product.image === 'string') return product.image
  return (product.image as { url: string })?.url || '/images/placeholder.png'
}

const addToCart = async (product: Product | VendorAdProduct) => {
  const res = await cartStore.addToCart(product.id.toString(), 1)
  if (res.success) {
    toast.success(`${product.name} sepete eklendi!`)
  }
}

const followVendor = async () => {
  if (!authStore.isLoggedIn) {
    toast.info('Takip etmek için giriş yapmalısınız')
    return navigateTo('/login')
  }

  if (followLoading.value) return
  followLoading.value = true

  try {
    const res = isFollowing.value
      ? await vendorService.unfollowVendor(route.params.id as string)
      : await vendorService.followVendor(route.params.id as string)

    if (res.success) {
      isFollowing.value = !isFollowing.value
      toast.success(res.message || 'İşlem başarılı')
    }
  } catch (err) {
    console.error('Follow error:', err)
    toast.error('İşlem başarısız oldu')
  } finally {
    followLoading.value = false
  }
}

const checkFollowStatus = async () => {
  if (!authStore.isLoggedIn) return
  try {
    const res = await vendorService.checkFollowStatus(route.params.id as string)
    if (res.success && res.data) {
      isFollowing.value = (res.data as { isFollowing: boolean }).isFollowing
    }
  } catch (err) {
    console.error('Check follow error:', err)
  }
}

const shareVendor = () => {
  if (navigator.share) {
    navigator.share({
      title: vendor.value?.businessName || 'Satıcı',
      url: window.location.href
    }).catch(console.error)
  } else {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Bağlantı kopyalandı!')
  }
}

const handleLogoError = (e: string | Event) => {
  if (e && typeof e !== 'string' && e.target) {
    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200?text=' + (vendor.value?.businessName || 'Store')
  }
}



onMounted(() => {
  fetchVendor()
  fetchProducts() // Initial products fetch
  checkFollowStatus()
})

useHead({
  title: computed(() => vendor.value ? `${vendor.value.businessName} Mağazası` : 'Yükleniyor...'),
  meta: [
    { name: 'description', content: computed(() => vendor.value?.description || 'Satıcı Profil Sayfası') }
  ]
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
