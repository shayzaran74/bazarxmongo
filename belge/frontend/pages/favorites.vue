<template>
  <div class="container mx-auto py-8 px-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-800">
        Favorilerim
      </h1>
      <span
        v-if="wishlistStore.itemCount > 0"
        class="text-lg text-gray-600"
      >
        {{ wishlistStore.itemCount }} ürün
      </span>
    </div>

    <div
      v-if="wishlistStore.loading"
      class="text-center py-20"
    >
      <p class="text-gray-500">
        Favoriler yükleniyor...
      </p>
      <!-- İsteğe bağlı: Spinner animasyonu eklenebilir -->
    </div>

    <div
      v-else-if="wishlistStore.items.length === 0"
      class="text-center py-20 bg-gray-50 rounded-lg"
    >
      <HeartIcon class="mx-auto h-12 w-12 text-gray-400" />
      <h3 class="mt-2 text-sm font-medium text-gray-900">
        Favori ürününüz yok
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Beğendiğiniz ürünleri favorilerinize ekleyebilirsiniz.
      </p>
      <div class="mt-6">
        <NuxtLink
          to="/products"
          class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          Alışverişe Başla
        </NuxtLink>
      </div>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div
          v-for="favoriteItem in wishlistStore.items"
          :key="favoriteItem.id || favoriteItem.productId"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
        >
          <NuxtLink
            :to="`/item/${favoriteItem.Product?.id || favoriteItem.productId}`"
            class="block"
          >
            <div class="relative w-full aspect-square overflow-hidden bg-gray-50">
              <img
                :src="resolveImageUrl(favoriteItem.Product?.image)"
                :alt="favoriteItem.Product?.name || 'Ürün'"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                @error="handleImageError"
              >

              <!-- Favorite Button -->
              <div class="absolute top-2 right-2">
                <FavoriteButton :product-id="favoriteItem.Product?.id || favoriteItem.productId" />
              </div>
            </div>

            <div class="p-4 flex flex-col justify-between h-[120px]">
              <div>
                <h3 class="text-xs font-bold text-gray-900 mb-2 line-clamp-2 min-h-[2.5rem] flex items-center">
                  {{ favoriteItem.Product?.name || 'Ürün Adı' }}
                </h3>
              </div>
              <div>
                <p class="text-base font-black text-primary-600">
                  {{ formatPrice(favoriteItem.Product?.price || 0) }}
                </p>
                <p
                  v-if="favoriteItem.Product?.stock !== undefined"
                  class="text-[10px] text-gray-400 mt-1"
                >
                  Stok: {{ favoriteItem.Product.stock }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { HeartIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '~/stores/auth'
import { useWishlistStore } from '~/stores/wishlist'

definePageMeta({
  middleware: 'auth' // Bu sayfanın sadece giriş yapmış kullanıcılar tarafından görülmesini sağlar
})

const wishlistStore = useWishlistStore()
const authStore = useAuthStore()
const { resolveImageUrl } = useAppImage()

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price)
}

// Handle image error
const handleImageError = (event) => {
  if (event?.target) {
    event.target.onerror = null
    event.target.src = 'https://placehold.co/300x300?text=Ürün+Resmi'
  }
}

// Fetch favorites on mount
onMounted(async () => {
  await authStore.init()
  if (authStore.isLoggedIn) {
    await wishlistStore.fetchWishlist()
  }
})
</script>