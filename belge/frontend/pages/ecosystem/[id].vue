<template>
  <div class="min-h-screen bg-gray-50 pb-12">
    <!-- Ecosystem Header -->
    <div class="bg-indigo-700 text-white py-12 shadow-inner">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center space-x-6">
          <div
            class="h-24 w-24 bg-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-indigo-400"
          >
            <span class="text-3xl font-bold text-indigo-700">{{ ecosystem?.name?.charAt(0) }}</span>
          </div>
          <div>
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-extrabold">
                {{ ecosystem?.name }}
              </h1>
              <span class="bg-indigo-500 text-xs px-2 py-1 rounded-full border border-indigo-300">Resmi
                Bayi Portalı</span>
            </div>
            <p class="mt-2 text-indigo-100 max-w-2xl">
              {{ displayDescription }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-full lg:w-64 space-y-6">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FunnelIcon class="h-5 w-5 text-indigo-600" />
              Katalog Filtreleri
            </h3>

            <div class="space-y-4">
              <div>
                <label
                  class="text-xs font-bold text-gray-400 uppercase tracking-wider"
                >Görünürlük</label>
                <div class="mt-2 space-y-2">
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input
                      v-model="filters.showPrivate"
                      type="checkbox"
                      class="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    >
                    <span class="text-sm text-gray-600 group-hover:text-indigo-600">Özel
                      Ürünler</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer group">
                    <input
                      v-model="filters.showPublic"
                      type="checkbox"
                      class="rounded text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    >
                    <span class="text-sm text-gray-600 group-hover:text-indigo-600">Genel
                      Ürünler</span>
                  </label>
                </div>
              </div>

              <div>
                <label class="text-xs font-bold text-gray-400 uppercase tracking-wider">Stok
                  Durumu</label>
                <select
                  v-model="filters.stockStatus"
                  class="mt-2 w-full bg-gray-50 border-gray-200 rounded-xl text-sm focus:ring-indigo-500"
                >
                  <option value="Tümü">
                    Tümü
                  </option>
                  <option value="Sadece Stoktakiler">
                    Sadece Stoktakiler
                  </option>
                  <option value="Kritik Seviye">
                    Kritik Seviye
                  </option>
                </select>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
            <h4 class="text-indigo-900 font-bold text-sm mb-3">
              Bayi Destek
            </h4>
            <p class="text-xs text-indigo-700 mb-4 leading-relaxed">
              Katalogla ilgili sorularınız için marka temsilcinizle iletişime geçin.
            </p>
            <button
              class="w-full bg-white text-indigo-700 py-2 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow"
              @click="contactSupport"
            >
              Mesaj Gönder
            </button>
          </div>
        </aside>

        <!-- Product Grid -->
        <main class="flex-1">
          <div
            v-if="loading"
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="i in 6"
              :key="i"
              class="animate-pulse bg-white rounded-2xl h-96 shadow-sm border border-gray-100"
            />
          </div>

          <div
            v-else-if="filteredProducts.length === 0"
            class="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-300 shadow-sm"
          >
            <div class="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full mb-6">
              <ShoppingBagIcon class="h-10 w-10 text-gray-300" />
            </div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">
              Henüz Ürün Yok
            </h3>
            <p class="text-gray-500 max-w-sm mx-auto">
              Bu markaya ait listelenmiş veya filtrelenmiş herhangi bir ürün bulunamadı.
            </p>
          </div>

          <div
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              v-for="product in filteredProducts"
              :key="product.id"
              class="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
            >
              <!-- Private Badge -->
              <div
                v-if="product.visibility === 'PRIVATE_ECOSYSTEM'"
                class="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1"
              >
                <LockClosedIcon class="h-3 w-3" />
                BAYİYE ÖZEL
              </div>

              <!-- Product Image -->
              <div class="aspect-square bg-gray-100 overflow-hidden">
                <img
                  :src="resolveImageUrl(product.image)"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                >
              </div>

              <!-- Product Content -->
              <div class="p-5">
                <div class="text-xs font-bold text-indigo-500 mb-1 uppercase tracking-wider">
                  {{ product.category?.name || 'Genel' }}
                </div>
                <h4
                  class="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 min-h-[3rem]"
                >
                  {{ product.name }}
                </h4>

                <div class="mt-4 flex items-end justify-between">
                  <div>
                    <span class="text-2xl font-black text-gray-900">₺{{ formatPrice(product.price)
                    }}</span>
                    <p
                      v-if="product.minMarketPrice"
                      class="text-[10px] text-gray-400 mt-1"
                    >
                      Taban Satış Fiyatı: ₺{{ formatPrice(product.minMarketPrice) }}
                    </p>
                  </div>

                  <button
                    class="bg-gray-900 text-white p-3 rounded-xl hover:bg-indigo-600 transition-colors shadow-lg"
                    @click="addToCart(product)"
                  >
                    <PlusIcon class="h-6 w-6" />
                  </button>
                </div>

                <div
                  v-if="product.maxPurchasePerMember"
                  class="mt-4 pt-4 border-t border-gray-50"
                >
                  <div class="flex items-center justify-between text-[11px]">
                    <span class="text-gray-500">Kalan Kota:</span>
                    <span class="text-indigo-600 font-bold">{{ product.maxPurchasePerMember }}
                      Adet</span>
                  </div>
                  <div class="mt-1 w-full bg-gray-100 rounded-full h-1">
                    <div class="bg-indigo-500 h-1 rounded-full w-1/3" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
    FunnelIcon,
    ShoppingBagIcon,
    LockClosedIcon,
    PlusIcon,
        
} from '@heroicons/vue/24/outline'
import type { BrandEcosystem, Product, ApiResponse } from '@barterborsa/shared-types';

const route = useRoute()
const { $api } = useApi()
const cartStore = useCartStore()
const { resolveImageUrl } = useAppImage()

const loading = ref(true)
const ecosystem = ref<BrandEcosystem | null>(null)
const products = ref<Product[]>([])
const error = ref<string | null>(null)

const filters = ref({
    showPrivate: true,
    showPublic: true,
    stockStatus: 'Tümü'
})

const filteredProducts = computed(() => {
    return products.value.filter(product => {
        // Visibility filter
        const isPrivate = product.visibility === 'PRIVATE_ECOSYSTEM'

        if (isPrivate && !filters.value.showPrivate) return false
        if (!isPrivate && !filters.value.showPublic) return false

        // Stock filter
        const stock = product.stock || 0
        if (filters.value.stockStatus === 'Sadece Stoktakiler' && stock <= 0) return false
        if (filters.value.stockStatus === 'Kritik Seviye' && (stock <= 0 || stock > 10)) return false

        return true
    })
})

const displayDescription = computed(() => {
    return ecosystem.value?.description || 'Bu markanın özel bayi kataloğuna hoş geldiniz.'
})

const fetchEcosystem = async () => {
    try {
        const ecosystemId = route.params.id
        const response = await $api(`/api/ecosystem/${ecosystemId}`) as ApiResponse<BrandEcosystem>
        if (response.success) {
            ecosystem.value = response.data || null
        }
    } catch (err: unknown) {
        console.error('Ekosistem yüklenemedi:', err)
        const fetchError = err as { data?: { error?: string }, status?: number }
        error.value = fetchError.data?.error || 'Bu sayfaya erişim yetkiniz bulunmuyor.'
        useNuxtApp().$toast.error(error.value)
        if (fetchError.status === 403) {
            // Redirect after a short delay if unauthorized
            setTimeout(() => navigateTo('/'), 3000)
        }
    }
}

const fetchProducts = async () => {
    try {
        const response = await $api('/api/products', {
            query: {
                ecosystemId: route.params.id,
                limit: 50
            }
        }) as ApiResponse<Product[]>
        if (response.success) {
            products.value = response.data || []
        }
    } catch (err) {
        console.error('Ürünler yüklenemedi:', err)
    } finally {
        loading.value = false
    }
}

const formatPrice = (price: number | string) => {
    return Number(price || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const addToCart = async (product: Product) => {
    await cartStore.addToCart(String(product.bestListingId || product.id), 1, undefined, {
        ...product,
        id: String(product.id),
        image: resolveImageUrl(product.image),
        stock: product.stock || 99
    })
}

const contactSupport = () => {
    if (ecosystem.value?.owner?.user?.email) {
        window.location.href = `mailto:${ecosystem.value.owner.user.email}?subject=Katalog hakkında soru`
    } else {
        useNuxtApp().$toast.info('Mesaj sistemi şu an yapılandırma aşamasında. Çok yakında devreye alınacaktır.')
    }
}

onMounted(async () => {
    await fetchEcosystem()
    if (!error.value) {
        fetchProducts()
    }
})
</script>
