<template>
  <div class="min-h-screen bg-slate-50 pt-20 pb-12">
    <!-- Header Section -->
    <section class="relative py-12 px-4 overflow-hidden bg-slate-900 mb-8">
      <!-- Grid Background -->
      <div class="absolute inset-0 opacity-10 pointer-events-none">
        <div class="absolute inset-0 bg-[url('/grid-white.svg')] bg-[length:40px_40px]" />
      </div>

      <div class="max-w-7xl mx-auto relative z-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <nav class="flex items-center gap-2 mb-4">
              <NuxtLink
                to="/"
                class="text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
              >
                Ana Sayfa
              </NuxtLink>
              <ChevronRightIcon class="h-3 w-3 text-slate-600" />
              <span class="text-indigo-400 text-xs font-black uppercase tracking-widest">Keşfet</span>
            </nav>
            <h1
              class="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none"
            >
              Keşfet <span class="text-indigo-500">&</span> Trendler
            </h1>
            <p class="text-slate-400 text-lg font-medium mt-4 max-w-2xl">
              Platformumuzdaki en popüler, en yeni ve en çok değerlendirilen ürünleri tek bir yerden
              keşfedin.
            </p>
          </div>

          <div class="flex items-center gap-4">
            <div
              class="bg-white/5 backdrop-blur-xl border border-white/10 p-4 rounded-[2rem] flex items-center gap-6"
            >
              <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-slate-500 uppercase">Toplam Ürün</span>
                <span class="text-xl font-black text-white">{{ totalProducts }}</span>
              </div>
              <div class="h-8 w-px bg-white/10" />
              <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-slate-500 uppercase">Aktif Kategori</span>
                <span class="text-xl font-black text-indigo-400">{{ categories.length }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- High Density Tabs -->
      <div class="sticky top-20 z-30 mb-8">
        <div
          class="bg-white/80 backdrop-blur-2xl border border-slate-200 p-2 rounded-3xl shadow-xl shadow-slate-200/50 flex flex-wrap gap-2 overflow-x-auto no-scrollbar"
        >
          <button
            v-for="tab in discoverTabs"
            :key="tab.id"
            class="px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2"
            :class="activeTab === tab.id
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
              : 'text-slate-500 hover:bg-slate-100'"
            @click="activeTab = tab.id"
          >
            <component
              :is="tab.icon"
              class="h-4 w-4"
            />
            {{ tab.label }}
          </button>
        </div>
      </div>

      <!-- Main Discovery Grid -->
      <div class="space-y-12">
        <div
          v-if="loading"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
        >
          <div
            v-for="i in 12"
            :key="i"
            class="aspect-[3/4] bg-white animate-pulse rounded-[2.5rem] border border-slate-100 shadow-sm"
          />
        </div>

        <div
          v-else-if="products.length > 0"
          class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 animate-fade-in"
        >
          <ProductCard
            v-for="product in products"
            :key="product.id"
            :product="product"
            :badges="getProductBadges(product)"
            @click="navigateTo(getProductUrl(product))"
            @add-to-cart="(p) => cartStore.addToCart(p.bestListingId || p.id, 1, undefined, p)"
          />
        </div>

        <!-- Empty State -->
        <div
          v-else
          class="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200"
        >
          <div class="text-6xl mb-6">
            🔍
          </div>
          <h2 class="text-2xl font-black text-slate-900 uppercase italic tracking-tight">
            Ürün Bulunamadı
          </h2>
          <p class="text-slate-500 mt-2">
            Bu filtre için şu an uygun ürün bulunmuyor. Diğer kategorilere göz
            atın.
          </p>
        </div>

        <!-- Pagination or Load More -->
        <div
          v-if="hasMore && !loading"
          class="flex justify-center pt-8"
        >
          <button
            class="px-12 py-5 bg-white border-2 border-slate-100 rounded-[2rem] text-slate-900 font-black text-sm uppercase tracking-widest hover:border-indigo-600 hover:text-indigo-600 transition-all shadow-xl hover:shadow-indigo-100 flex items-center gap-3 group"
            @click="loadMore"
          >
            DAHA FAZLA YÜKLE
            <ArrowPathIcon class="h-5 w-5 group-hover:rotate-180 transition-transform duration-700" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    ChevronRightIcon,
    SparklesIcon,
    FireIcon,
    ClockIcon,
    HeartIcon,
    StarIcon,
    ShoppingBagIcon,
    ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { $api } = useApi()
const cartStore = useCartStore()
const { getProductBadges } = useProductBadges()
import { getProductUrl } from '~/utils/product-url'

// State
const activeTab = ref('best_sellers')
const products = ref([])
const loading = ref(true)
const page = ref(1)
const hasMore = ref(true)
const totalProducts = ref(0)
const categories = ref([])

const discoverTabs = [
    { id: 'best_sellers', label: 'En Çok Satılanlar', icon: FireIcon },
    { id: 'created_desc', label: 'Yeni Gelenler', icon: ClockIcon },
    { id: 'most_visited', label: 'En Çok Ziyaret Edilenler', icon: SparklesIcon },
    { id: 'most_favorited', label: 'En Çok Favorilenenler', icon: HeartIcon },
    { id: 'most_rated', label: 'En Çok Değerlendirilenler', icon: StarIcon },
    { id: 'all', label: 'Tüm Ürünler', icon: ShoppingBagIcon },
]

// Computed metadata based on active tab
const fetchProducts = async (reset = false) => {
    if (reset) {
        page.value = 1
        products.value = []
    }

    loading.value = true
    try {
        const query = {
            limit: 24,
            page: page.value
        }

        if (activeTab.value !== 'all') {
            query.sort = activeTab.value
        }

        const data = await $api('/api/products', {
            query
        })

        if (data.success) {
            products.value = reset ? data.data : [...products.value, ...data.data]
            totalProducts.value = data.total || products.value.length
            hasMore.value = data.data.length === 24
        }
    } catch (err) {
        console.error('Error fetching discovery products:', err)
    } finally {
        loading.value = false
    }
}

const fetchCategories = async () => {
    try {
        const data = await $api('/api/categories')
        if (data.success) categories.value = data.data
    } catch (err) { /* ignore */ }
}

const loadMore = () => {
    page.value++
    fetchProducts()
}

watch(activeTab, () => {
    fetchProducts(true)
})

onMounted(() => {
    fetchProducts()
    fetchCategories()
})

useHead({
    title: 'Keşfet - En Popüler Ürünler | TicariTakas',
    meta: [
        { name: 'description', content: 'TicariTakas platformundaki en çok satan, en yeni ve en beğenilen ürünleri keşfedin.' }
    ]
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}

.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
