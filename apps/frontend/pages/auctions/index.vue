<template>
  <div class="min-h-screen bg-background font-body-md text-on-background pb-20">
    <!-- Hero / Header Section -->
    <div class="bg-md3-primary text-white py-16 relative overflow-hidden">
      <!-- High-tech Grid Background -->
      <div class="absolute inset-0 opacity-5 pointer-events-none">
        <div class="absolute inset-0 bg-[url('/grid-white.svg')] bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>

      <div class="max-w-screen-2xl mx-auto px-6 relative z-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <span class="bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-secondary/20">
                <span class="material-symbols-outlined text-[14px]" style="font-variation-settings: 'FILL' 1;"></span>
                {{ $t('auctionsHome.badge') || 'CANLI TEKLİFLER' }}
              </span>
            </div>
            <h1 class="text-display-lg font-black tracking-tighter uppercase italic mb-2">
              {{ $t('auctionsHome.title') || 'AÇIK' }} <span class="text-primary-fixed-dim">{{ $t('auctionsHome.subtitle') || 'ARTIRMA' }}</span>
            </h1>
            <p class="text-primary-fixed opacity-70 text-lg font-medium max-w-2xl italic">
              {{ $t('auctionsHome.description') || 'En iyi teklifi sen ver, benzersiz ürünleri kazanan sen ol.' }}
            </p>
          </div>
          
          <div class="flex gap-4">
            <button 
              v-if="authStore.user?.isAdmin"
              @click="showCreateModal = true"
              class="px-8 py-4 bg-secondary-fixed text-on-secondary-fixed rounded-xl font-black text-sm uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-secondary/20"
            >
              + YENİ PROTOKOL
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Listing Area -->
    <div class="max-w-screen-2xl mx-auto px-6 -mt-8 relative z-20">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-2xl shadow-xl border border-surface-variant mb-12 flex flex-col lg:flex-row items-center gap-4">
        <div class="relative flex-1 w-full lg:w-auto">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input 
            v-model="searchQuery"
            class="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-md3-primary transition-all text-sm font-bold"
            placeholder="Ürün, kategori veya lot ara..."
            @input="debounceSearch"
          />
        </div>
        
        <div class="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
          <button 
            v-for="cat in ['HEPSİ', 'SAAT', 'ELEKTRONİK', 'ANTİKA', 'GAYRİMENKUL']" 
            :key="cat"
            class="px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border"
            :class="selectedCategory === cat ? 'bg-md3-primary text-white border-md3-primary shadow-lg shadow-md3-primary/20' : 'bg-surface-container-low text-outline border-transparent hover:border-outline-variant'"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div v-for="i in 8" :key="i" class="h-96 bg-white rounded-xl animate-pulse ambient-shadow" />
      </div>

      <!-- Content Grid -->
      <div v-else-if="auctions.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <NuxtLink 
          v-for="auction in auctions" 
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

      <!-- Empty State -->
      <div v-else class="text-center py-32 bg-white rounded-2xl border-2 border-dashed border-outline-variant/30">
        <span class="material-symbols-outlined text-5xl text-outline mb-4">gavel</span>
        <h2 class="text-xl font-black text-md3-primary uppercase mb-2">Aktif Protokol Bulunmuyor</h2>
        <p class="text-outline text-sm font-medium mb-8">Aradığınız kriterlerde aktif bir açık artırma şu an bulunmamaktadır.</p>
        <button @click="clearFilters" class="px-8 py-3 bg-md3-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest">TÜMÜNÜ GÖR</button>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center items-center gap-3 mt-20">
        <button 
          :disabled="currentPage <= 1"
          @click="changePage(currentPage - 1)"
          class="w-12 h-12 rounded-xl bg-white border border-surface-variant flex items-center justify-center text-outline hover:text-md3-primary disabled:opacity-30 transition-all"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <button 
          v-for="page in visiblePages" 
          :key="page"
          @click="changePage(page)"
          class="w-12 h-12 rounded-xl font-black text-xs transition-all"
          :class="page === currentPage ? 'bg-md3-primary text-white shadow-xl shadow-md3-primary/20' : 'bg-white border border-surface-variant text-outline hover:bg-slate-50'"
        >
          {{ page }}
        </button>
        <button 
          :disabled="currentPage >= totalPages"
          @click="changePage(currentPage + 1)"
          class="w-12 h-12 rounded-xl bg-white border border-surface-variant flex items-center justify-center text-outline hover:text-md3-primary disabled:opacity-30 transition-all"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
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

const authStore = useAuthStore()
const {
  auctions, loading, error, searchQuery, selectedCategory,
  showCreateModal, currentPage, totalPages, visiblePages,
  fetchAuctions, changePage, clearFilters, debounceSearch, formatPrice,
  onAuctionCreated
} = useAuctionOverview()

definePageMeta({ layout: 'default' })
useHead({ title: 'AÇIK ARTIRMALAR // BAZARX' })
</script>

<style>
.ambient-shadow {
  box-shadow: 0 20px 25px -5px rgba(26, 58, 92, 0.05), 0 8px 10px -6px rgba(26, 58, 92, 0.05);
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>