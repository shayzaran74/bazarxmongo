<template>
  <div class="min-h-screen bg-gray-50/50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header Section -->
      <div class="mb-10">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <h1 class="text-5xl font-black text-gray-900 mb-3 italic tracking-tighter">🔥 AÇIK ARTIRMALAR</h1>
            <p class="text-sm font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">ÖZEL PROTOKOLLER & TEKLİF YARIŞI</p>
          </div>
          <div class="flex gap-3">
            <button v-if="authStore.user?.isAdmin" class="px-6 py-3 bg-primary-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-primary-700 shadow-xl shadow-primary-900/20 transition-all active:scale-95" @click="showCreateModal = true">
              + YENİ PROTOKOL
            </button>
            <NuxtLink to="/auctions/my" class="px-6 py-3 bg-white border border-gray-200 text-gray-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all active:scale-95">
              KATILDIĞIM İLANLAR
            </NuxtLink>
          </div>
        </div>

        <!-- Filters Component -->
        <AuctionFilters
          v-model:search-query="searchQuery"
          v-model:selected-category="selectedCategory"
          v-model:status-filter="statusFilter"
          v-model:sort-by="sortBy"
          :categories="categories"
          @update:search-query="debounceSearch"
          @update:selected-category="fetchAuctions"
          @update:status-filter="fetchAuctions"
          @update:sort-by="fetchAuctions"
        />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center h-80">
        <div class="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-100 rounded-3xl p-6 mb-10 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
          <div>
            <p class="text-sm font-black text-red-900 uppercase tracking-tight">İşlem Başarısız</p>
            <p class="text-xs font-bold text-red-600 opacity-80">{{ error }}</p>
          </div>
        </div>
        <button class="px-5 py-2.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-700 transition-all" @click="fetchAuctions">TEKRAR DENE</button>
      </div>

      <!-- Content Grid -->
      <div v-else-if="auctions.length > 0" class="space-y-10">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AuctionCard
            v-for="auction in auctions"
            :key="auction.id"
            :auction="auction"
            :status-badge-class="getStatusBadgeClass(auction.status)"
            :status-text="getStatusText(auction.status)"
            :format-price="formatPrice"
          />
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex justify-center items-center gap-2 mt-12 bg-white p-2 rounded-2xl border border-gray-100 w-fit mx-auto shadow-sm">
          <button :disabled="currentPage <= 1" class="p-3 text-gray-400 hover:text-primary-600 disabled:opacity-30 transition-colors" @click="changePage(currentPage - 1)">
            <ChevronLeftIcon class="w-5 h-5" />
          </button>
          <div class="flex gap-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              :class="['px-5 py-2.5 text-xs font-black rounded-xl transition-all', page === currentPage ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/20' : 'text-gray-500 hover:bg-gray-50']"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
          </div>
          <button :disabled="currentPage >= totalPages" class="p-3 text-gray-400 hover:text-primary-600 disabled:opacity-30 transition-colors" @click="changePage(currentPage + 1)">
            <ChevronRightIcon class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <AuctionEmptyState
        v-else
        :is-admin="authStore.user?.isAdmin"
        @clear-filters="clearFilters"
        @create="showCreateModal = true"
      />
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
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import { useAuctionOverview } from '~/composables/useAuctionOverview'

// Page Logic
definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({
  title: 'Açık Artırma Protokolleri | BazarX',
  meta: [{ name: 'description', content: 'Geleceğin ticaretine katılın. Gerçek zamanlı açık artırma protokolleri.' }]
})

const authStore = useAuthStore()
const {
  auctions, loading, error, categories, searchQuery, selectedCategory,
  statusFilter, sortBy, showCreateModal, currentPage, totalPages, visiblePages,
  fetchAuctions, changePage, clearFilters, debounceSearch, formatPrice,
  getStatusBadgeClass, getStatusText
} = useAuctionOverview()

const onAuctionCreated = () => {
  showCreateModal.value = false
  sortBy.value = 'created_desc'
  currentPage.value = 1
  fetchAuctions()
}
</script>