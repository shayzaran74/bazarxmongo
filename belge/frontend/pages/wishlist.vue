<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 flex items-center">
          <HeartIcon class="h-8 w-8 text-red-500 mr-3" />
          Favorilerim
        </h1>
        <p class="mt-2 text-gray-600">
          Beğendiğiniz ürünleri buradan takip edebilirsiniz
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="loading"
        class="flex justify-center items-center py-12"
      >
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
      >
        <ExclamationTriangleIcon class="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-red-800 mb-2">
          Bir hata oluştu
        </h3>
        <p class="text-red-600 mb-4">
          {{ error }}
        </p>
        <button
          class="btn-primary"
          @click="fetchWishlist"
        >
          Tekrar Dene
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="isEmpty"
        class="text-center py-12"
      >
        <HeartIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Henüz favori ürününüz yok
        </h3>
        <p class="text-gray-500 mb-6">
          Beğendiğiniz ürünleri favorilerinize ekleyerek daha sonra kolayca bulabilirsiniz
        </p>
        <NuxtLink
          to="/products"
          class="btn-primary"
        >
          Ürünleri Keşfet
        </NuxtLink>
      </div>

      <!-- Wishlist Grid -->
      <div v-else>
        <div class="mb-6 flex justify-between items-center">
          <p class="text-gray-600">
            {{ itemCount }} ürün favorilerinizde
          </p>
          <button
            class="text-red-600 hover:text-red-800 text-sm font-medium"
            @click="clearWishlist"
          >
            Tümünü Temizle
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <div
            v-for="item in items"
            :key="item.id"
            class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <!-- Product Image -->
            <div class="relative aspect-square">
              <NuxtImg
                :src="resolveImageUrl(item.Product.ProductImage?.[0]?.url || item.Product.image)"
                :alt="item.Product.name"
                class="w-full h-full object-cover"
                placeholder
              />
              
              <!-- Remove from Wishlist Button -->
              <button
                class="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 text-red-500 hover:text-red-700"
                title="Favorilerden Çıkar"
                @click="removeFromWishlist(item.Product.id)"
              >
                <XMarkIcon class="h-4 w-4" />
              </button>

              <!-- Product Labels -->
              <div
                v-if="item.Product.tags"
                class="absolute top-2 left-2 flex flex-wrap gap-1"
              >
                <span
                  v-for="tag in item.Product.tags.split(',').slice(0, 2)"
                  :key="tag"
                  class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                >
                  {{ tag.trim() }}
                </span>
              </div>
            </div>

            <!-- Product Info -->
            <div class="p-4 flex flex-col flex-grow justify-between min-h-[180px]">
              <div>
                <h3 class="font-bold text-gray-900 line-clamp-2 min-h-[2.5rem] flex items-center">
                  {{ item.Product.name }}
                </h3>
                <p
                  v-if="item.Product.Category"
                  class="text-xs text-gray-500"
                >
                  {{ item.Product.Category.name }}
                </p>

                <!-- Reviews -->
                <div
                  v-if="item.Product.Review?.length"
                  class="flex items-center mt-2 mb-2"
                >
                  <div class="flex items-center">
                    <StarIcon
                      v-for="star in 5"
                      :key="star"
                      :class="[
                        'h-3 w-3',
                        star <= averageRating(item.Product.Review) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      ]"
                    />
                  </div>
                  <span class="ml-2 text-xs text-gray-400">
                    ({{ item.Product._count?.Review || 0 }})
                  </span>
                </div>
              </div>

              <div>
                <!-- Price -->
                <div class="flex items-center justify-between mt-2">
                  <span class="text-lg font-black text-primary-600">
                    {{ formatPrice(item.Product.price) }}
                  </span>
                </div>

                <!-- Action Buttons -->
                <div class="mt-4 flex gap-2">
                  <NuxtLink
                    :to="`/products/${item.Product.id}`"
                    class="flex-1 text-center py-2 px-2 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-colors duration-200 uppercase tracking-tighter"
                  >
                    Detay
                  </NuxtLink>
                  <button
                    class="flex-1 py-2 px-2 bg-primary-600 text-white rounded-lg text-[10px] font-bold hover:bg-primary-700 transition-colors duration-200 uppercase tracking-tighter"
                    @click="addToCart(item.Product)"
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HeartIcon, XMarkIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

// SEO
useHead({
  title: 'Favorilerim - E-Commerce Platform',
  meta: [
    { name: 'description', content: 'Favori ürünlerinizi görüntüleyin ve yönetin' }
  ]
})

// Stores
const wishlistStore = useWishlistStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

// Utils
const { resolveImageUrl } = useAppImage()

// State
const { items, loading, error, itemCount, isEmpty } = storeToRefs(wishlistStore)

// Methods
const { fetchWishlist, removeFromWishlist, clearWishlist } = wishlistStore

// Computed
const averageRating = (reviews) => {
  if (!reviews || reviews.length === 0) return 0
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Math.round(sum / reviews.length)
}

const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Actions
const addToCart = async (product) => {
  await cartStore.addToCart(product.id, 1)
}

// Auth check
onMounted(() => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login')
    return
  }
  
  fetchWishlist()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>