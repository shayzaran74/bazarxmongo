<template>
  <div class="min-h-screen bg-gray-50 relative overflow-x-hidden">
    <AnnouncementBar page="homepage" />
    <BazarXHero />

    <div class="py-3" />
    <HomeBanner v-if="homeSettings.showHomeSlider === 'true'" ecosystem="TICARITAKAS" />

    <div class="max-w-[1400px] mx-auto px-4 py-8">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 class="text-4xl font-black text-gray-900 tracking-tight italic flex items-center">
              <SparklesIcon class="h-10 w-10 mr-4 text-primary-600 animate-pulse" />
              TİCARİ TAKAS
            </h1>
            <p class="text-gray-500 text-sm font-bold mt-1 tracking-wider uppercase opacity-80">
              {{ pagination.total || 0 }} Aktif İlan Yayında
            </p>
          </div>
        </div>
      </div>

      <div class="flex gap-8">
        <!-- Sidebar Filters -->
        <aside class="w-72 flex-shrink-0 bg-white rounded-[2rem] shadow-sm p-6 h-fit sticky top-6 border border-gray-100">
          <SurplusFilters
            :categories="categories"
            :cities="cities"
            :specs="availableSpecs"
            :current-filters="currentFilters"
            @update:filters="updateFilters"
            @clear:filters="updateFilters({})"
          />
        </aside>

        <!-- Product Grid -->
        <main class="flex-1 space-y-6">
          <div class="bg-white rounded-3xl shadow-sm p-5 flex items-center justify-between border border-gray-100">
            <span class="text-xs font-black uppercase tracking-widest text-gray-400">Sıralama</span>
            <select
              v-model="currentFilters.sort"
              class="px-5 py-2.5 bg-gray-50 border-none rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary-500"
              @change="updateFilters(currentFilters)"
            >
              <option value="">Önerilen</option>
              <option value="newest">En Yeni</option>
              <option value="quantityDesc">En Yüksek Miktar</option>
              <option value="quantityAsc">En Düşük Miktar</option>
            </select>
          </div>

          <!-- Loading / Grid / Empty States -->
          <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div v-for="i in 8" :key="i" class="h-[420px] bg-white rounded-[2rem] animate-pulse border border-gray-50 shadow-sm" />
          </div>

          <div v-else-if="items.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <SurplusProductCard 
              v-for="item in items" 
              :key="item.id" 
              :item="item" 
              :format-price="formatPrice"
              :get-main-image="getMainImage"
            />
          </div>

          <div v-else class="text-center py-24 bg-white rounded-[3rem] shadow-sm border-2 border-dashed border-gray-100">
            <ArchiveBoxXMarkIcon class="mx-auto h-20 w-20 text-gray-200 mb-6" />
            <h3 class="text-xl font-black text-gray-900 mb-2 uppercase italic">Henüz ilan bulunamadı</h3>
            <p class="text-sm text-gray-400 font-medium mb-8">Kriterlerinizi değiştirerek daha fazla fırsat keşfedebilirsiniz.</p>
            <button class="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em]" @click="updateFilters({})">
              FİLTRELERİ SIFIRLA
            </button>
          </div>

          <!-- Componentized Showcases -->
          <SurplusShowcase 
            :showcase="showcase" 
            :home-settings="homeSettings"
            :get-badges="getProductBadges"
            :get-url="getProductUrl"
          />

          <SurplusGroupBuySection 
            v-if="homeSettings.showGroupBuy === 'true' && showcase.activeGroupBuy"
            :active-group-buy="showcase.activeGroupBuy"
            :can-join="canJoinGroupBuy"
            :max-discount="calculateMaxDiscount()"
            @join="navigateTo(getProductUrl(showcase.activeGroupBuy.Product))"
            @view="navigateTo(getProductUrl(showcase.activeGroupBuy.Product))"
          />

          <MiddleBanner ecosystem="TICARITAKAS" class="mt-20" />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SparklesIcon, ArchiveBoxXMarkIcon } from '@heroicons/vue/24/outline'
import { getProductUrl } from '~/utils/product-url'
import { iller } from '~/assets/css/data/component/iller'
import { useSurplusList } from '~/composables/useSurplusList'

// Modüler Bileşenler
import SurplusProductCard from '~/components/surplus/SurplusProductCard.vue'
import SurplusShowcase from '~/components/surplus/SurplusShowcase.vue'
import SurplusGroupBuySection from '~/components/surplus/SurplusGroupBuySection.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'TicariTakas - Fazla Mal Platformu', meta: [{ name: 'description', content: 'Endüstriyel stok fazlası ve takas platformu.' }] })

const {
  items, categories, availableSpecs, loading, pagination, currentFilters,
  showcase, homeSettings,
  fetchItems, fetchShowcaseData, fetchHomeSettings, fetchCategoriesAndSpecs,
  updateFilters, syncFilters
} = useSurplusList()

const { getProductBadges } = useProductBadges()
const { resolveImageUrl } = useAppImage()

const cities = computed(() => Object.keys(iller).sort())

// Helpers
const formatPrice = (val) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(val)
const getMainImage = (item) => {
  const img = item.images?.[0]
  return resolveImageUrl(typeof img === 'string' ? img : img?.url, 'product')
}
const calculateMaxDiscount = () => {
  const gb = showcase.value.activeGroupBuy
  if (!gb?.Tiers || !gb.Product?.price) return 0
  const minPrice = Math.min(...gb.Tiers.map(t => t.price))
  return Math.round(((gb.Product.price - minPrice) / gb.Product.price) * 100)
}
const canJoinGroupBuy = computed(() => showcase.value.activeGroupBuy?.status === 'Active' && showcase.value.activeGroupBuy.remainingQuantity > 0)

onMounted(async () => {
  await Promise.all([fetchCategoriesAndSpecs(), fetchHomeSettings(), fetchShowcaseData()])
  syncFilters()
})

watch(() => useRoute().query, syncFilters, { deep: true })
</script>

<style scoped>
@keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
.animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
</style>
