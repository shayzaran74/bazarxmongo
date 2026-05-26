<template>
  <div class="min-h-screen bg-background font-body-md text-on-background pb-20">

    <!-- Hero / Header Section -->
    <div class="bg-md3-primary text-white py-10 relative overflow-hidden">
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute inset-0 bg-[url('/grid-white.svg')] bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>
      <div class="w-full px-6 relative z-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-secondary/20">
                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;"></span>
                {{ $t('auctionsHome.badge') || 'CANLI TEKLİFLER' }}
              </span>
            </div>
            <h1 class="text-display-lg font-black tracking-tighter uppercase italic mb-1">
              {{ $t('auctionsHome.title') || 'AÇIK' }} <span class="text-primary-fixed-dim">{{ $t('auctionsHome.subtitle') || 'ARTIRMA' }}</span>
            </h1>
            <p class="text-primary-fixed opacity-70 text-base font-medium max-w-2xl italic">
              {{ $t('auctionsHome.description') || 'En iyi teklifi sen ver, benzersiz ürünleri kazanan sen ol.' }}
            </p>
          </div>
          <button
            v-if="authStore.user?.isAdmin"
            @click="showCreateModal = true"
            class="px-6 py-3 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-secondary/20"
          >
            + YENİ PROTOKOL
          </button>
        </div>
      </div>
    </div>

    <!-- Content: Sidebar + Grid -->
    <div class="w-full px-6 -mt-6 relative z-20 flex gap-6 items-start">

      <!-- Sol Arama Sidebar -->
      <aside v-show="isSidebarOpen" class="w-72 flex-shrink-0 bg-white rounded-2xl ambient-shadow border border-surface-variant/30 overflow-hidden sticky top-24">
        <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-[18px] text-md3-primary">Açık Artırma</span>
            <span class="font-black text-sm text-md3-primary">Filtrele & Ara</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              v-if="hasActiveFilters"
              class="text-[10px] font-black text-md3-primary uppercase tracking-widest hover:opacity-70 transition-opacity"
              type="button"
              @click="clearAllFilters"
            >
              Temizle
            </button>
            <button @click="isSidebarOpen = false" class="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors" title="Filtreleri Gizle">
              <Bars3Icon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="p-5 space-y-5">

          <!-- Arama -->
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Anahtar Kelime</label>
            <div class="relative">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Ürün, lot ara..."
                class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-md3-primary/20 focus:border-md3-primary transition-all placeholder:text-slate-400"
                @input="debounceSearch"
              />
            </div>
          </div>

          <!-- Kategori -->
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="cat in categories"
                :key="cat.value"
                type="button"
                class="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all"
                :class="selectedCategory === cat.value
                  ? 'bg-md3-primary text-white border-md3-primary shadow-md shadow-md3-primary/20'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-md3-primary/50 hover:text-md3-primary'"
                @click="selectedCategory = cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <!-- Fiyat Aralığı -->
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Güncel Teklif (TL)</label>
            <div class="flex gap-2">
              <input
                v-model="sideFilters.minPrice"
                type="number"
                placeholder="Min"
                min="0"
                class="w-1/2 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-md3-primary/20 focus:border-md3-primary transition-all placeholder:text-slate-400"
              />
              <input
                v-model="sideFilters.maxPrice"
                type="number"
                placeholder="Max"
                min="0"
                class="w-1/2 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-md3-primary/20 focus:border-md3-primary transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <!-- Sıralama -->
          <div>
            <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sıralama</label>
            <div class="space-y-1.5">
              <label
                v-for="opt in sortOptions"
                :key="opt.value"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                :class="sideFilters.sort === opt.value ? 'bg-blue-50 text-md3-primary' : 'hover:bg-slate-50 text-slate-600'"
              >
                <input type="radio" v-model="sideFilters.sort" :value="opt.value" class="accent-md3-primary" />
                <span class="text-xs font-semibold">{{ opt.label }}</span>
              </label>
            </div>
          </div>

        </div>

        <!-- Sonuç Sayısı -->
        <div class="px-5 py-3 bg-slate-50 border-t border-slate-100">
          <p class="text-[11px] text-slate-500">
            <span class="font-black text-md3-primary">{{ filteredAuctions.length }}</span>
            artırma listelendi
          </p>
        </div>
      </aside>

      <!-- Ana İçerik -->
      <div class="flex-1 min-w-0">
        <div v-if="!isSidebarOpen" class="mt-6 mb-4">
          <button @click="isSidebarOpen = true" class="p-2 bg-white text-slate-700 border border-slate-200 shadow-sm rounded-lg hover:bg-slate-50 flex items-center gap-2 font-bold transition-colors">
            <Bars3Icon class="w-5 h-5" />
            <span class="text-sm">Kategoriler / Filtreler</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-6">
          <div v-for="i in 8" :key="i" class="h-80 bg-white rounded-xl animate-pulse ambient-shadow" />
        </div>

        <!-- Grid -->
        <div v-else-if="filteredAuctions.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 mt-6">
          <NuxtLink
            v-for="auction in filteredAuctions"
            :key="auction.id"
            :to="`/auctions/${auction.id}`"
            class="bg-white rounded-xl overflow-hidden ambient-shadow group hover:-translate-y-2 transition-all duration-500 border border-surface-variant/20"
          >
            <div class="aspect-video relative overflow-hidden bg-surface-container">
              <img
                :src="auction.Product?.image || '/placeholder.png'"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Auction product"
              />
              <div class="absolute top-3 left-3 bg-error text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg shadow-error/20">
                {{ $t('auctionsHome.live') || 'CANLI' }}
              </div>
              <div class="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/60 to-transparent">
                <div class="flex items-center gap-1.5 text-white">
                  <span class="material-symbols-outlined text-xs animate-pulse">timer</span>
                  <span class="text-[10px] font-black tracking-widest tabular-nums uppercase">AKTİF</span>
                </div>
              </div>
            </div>
            <div class="p-5 space-y-4">
              <h3 class="font-bold text-md3-primary truncate uppercase italic tracking-tight">{{ auction.title }}</h3>
              <div class="flex justify-between items-end pt-4 border-t border-slate-50">
                <div class="space-y-0.5">
                  <span class="text-[9px] font-bold text-outline uppercase">{{ $t('auctionsHome.currentBid') || 'Güncel Teklif' }}</span>
                  <p class="text-xl font-black text-md3-primary tabular-nums">{{ formatPrice(auction.currentPrice ?? auction.startingPrice ?? 0) }}</p>
                </div>
                <div class="text-right">
                  <span class="text-[8px] font-bold text-outline uppercase block">Toplam</span>
                  <span class="text-xs font-black text-secondary uppercase">{{ (auction._count?.bids || 0) }} {{ $t('auctionsHome.bidCount') || 'Teklif' }}</span>
                </div>
              </div>
              <button class="w-full py-3 bg-surface-container-high text-md3-primary font-black rounded-lg uppercase tracking-widest text-[10px] group-hover:bg-md3-primary group-hover:text-white transition-all">
                {{ $t('auctionsHome.placeBid') || 'TEKLİF VER' }}
              </button>
            </div>
          </NuxtLink>
        </div>

        <!-- Boş Durum -->
        <div v-else class="mt-6 text-center py-32 bg-white rounded-2xl border-2 border-dashed border-outline-variant/30">
          <span class="material-symbols-outlined text-5xl text-outline mb-4">gavel</span>
          <h2 class="text-xl font-black text-md3-primary uppercase mb-2">Aktif Protokol Bulunmuyor</h2>
          <p class="text-outline text-sm font-medium mb-8">Aradığınız kriterlerde aktif bir açık artırma şu an bulunmamaktadır.</p>
          <button @click="clearAllFilters" class="px-8 py-3 bg-md3-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest">TÜMÜNÜ GÖR</button>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-16">
          <button
            :disabled="currentPage <= 1"
            @click="changePage(currentPage - 1)"
            class="w-11 h-11 rounded-xl bg-white border border-surface-variant flex items-center justify-center text-outline hover:text-md3-primary disabled:opacity-30 transition-all"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            class="w-11 h-11 rounded-xl font-black text-xs transition-all"
            :class="page === currentPage ? 'bg-md3-primary text-white shadow-xl shadow-md3-primary/20' : 'bg-white border border-surface-variant text-outline hover:bg-slate-50'"
          >
            {{ page }}
          </button>
          <button
            :disabled="currentPage >= totalPages"
            @click="changePage(currentPage + 1)"
            class="w-11 h-11 rounded-xl bg-white border border-surface-variant flex items-center justify-center text-outline hover:text-md3-primary disabled:opacity-30 transition-all"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>

      </div>
    </div>

    <!-- Create Modal -->
    <CreateAuctionModal
      v-if="showCreateModal"
      @close="showCreateModal = false"
      @created="onAuctionCreated"
    />
  </div>
</template>

<script setup>
import { useAuctionOverview } from '~/composables/useAuctionOverview'
import { Bars3Icon } from '@heroicons/vue/24/outline'

const isSidebarOpen = ref(true)

const authStore = useAuthStore()
const {
  auctions, loading, error, searchQuery, selectedCategory,
  showCreateModal, currentPage, totalPages, visiblePages,
  fetchAuctions, changePage, clearFilters, debounceSearch, formatPrice,
  onAuctionCreated
} = useAuctionOverview()

definePageMeta({ layout: 'default', hideSideAds: true })
useHead({ title: 'AÇIK ARTIRMALAR // BAZARX' })

const categories = [
  { value: 'HEPSİ', label: 'Hepsi' },
  { value: 'SAAT', label: 'Saat' },
  { value: 'ELEKTRONİK', label: 'Elektronik' },
  { value: 'ANTİKA', label: 'Antika' },
  { value: 'GAYRİMENKUL', label: 'Gayrimenkul' },
]

const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Artan' },
  { value: 'price_desc', label: 'Fiyat: Azalan' },
  { value: 'most_bids', label: 'En Çok Teklif' },
]

const sideFilters = ref({ minPrice: '', maxPrice: '', sort: 'newest' })

const hasActiveFilters = computed(() =>
  !!(searchQuery.value || (selectedCategory.value && selectedCategory.value !== 'HEPSİ') ||
     sideFilters.value.minPrice || sideFilters.value.maxPrice || sideFilters.value.sort !== 'newest')
)

const filteredAuctions = computed(() => {
  let result = [...auctions.value]
  if (sideFilters.value.minPrice) {
    result = result.filter(a => parseFloat(a.currentPrice ?? a.startingPrice ?? 0) >= parseFloat(sideFilters.value.minPrice))
  }
  if (sideFilters.value.maxPrice) {
    result = result.filter(a => parseFloat(a.currentPrice ?? a.startingPrice ?? 0) <= parseFloat(sideFilters.value.maxPrice))
  }
  if (sideFilters.value.sort === 'price_asc') result.sort((a, b) => (a.currentPrice ?? a.startingPrice ?? 0) - (b.currentPrice ?? b.startingPrice ?? 0))
  else if (sideFilters.value.sort === 'price_desc') result.sort((a, b) => (b.currentPrice ?? b.startingPrice ?? 0) - (a.currentPrice ?? a.startingPrice ?? 0))
  else if (sideFilters.value.sort === 'most_bids') result.sort((a, b) => (b._count?.bids ?? 0) - (a._count?.bids ?? 0))
  return result
})

const clearAllFilters = () => {
  clearFilters()
  sideFilters.value = { minPrice: '', maxPrice: '', sort: 'newest' }
}
</script>

<style>
.ambient-shadow {
  box-shadow: 0 20px 25px -5px rgba(26, 58, 92, 0.05), 0 8px 10px -6px rgba(26, 58, 92, 0.05);
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>
