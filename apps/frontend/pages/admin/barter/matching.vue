<template>
  <div class="p-8 max-w-7xl mx-auto min-h-screen bg-neutral-50/30">
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4 italic uppercase">
          <div class="p-4 bg-indigo-50 rounded-[1.5rem] shadow-inner transform rotate-6">🔄</div>
          Akıllı Takas Eşleştirme
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest italic">
          Sistemdeki ihtiyaçlar ve fazlalıklar arasında döngüsel takas zincirleri oluşturun.
        </p>
      </div>
      <button
        :disabled="detecting"
        class="group relative h-16 px-12 bg-gray-900 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 active:scale-95 disabled:opacity-30 italic"
        @click="detectCycles"
      >
        <span v-if="detecting" class="flex items-center gap-3">
          <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ANALİZ EDİLYOR...
        </span>
        <span v-else class="flex items-center gap-2">🚀 YENİ EŞLEŞMELERİ BUL</span>
      </button>
    </div>

    <!-- Search & Filter -->
    <div class="mb-10 bg-white p-6 rounded-[2.5rem] border border-neutral-100 shadow-sm flex items-center gap-6">
      <div class="relative flex-1">
        <div class="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-300" />
        </div>
        <input
          v-model="searchQuery"
          type="text"
          class="w-full pl-16 pr-8 h-14 bg-neutral-50/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white transition-all outline-none text-[10px] font-black uppercase tracking-widest italic placeholder-gray-300"
          placeholder="ŞİRKET, ÜRÜN VEYA ZİNCİR ID ARA..."
          @input="debouncedSearch"
        >
      </div>
      <select
        v-model="itemsPerPage"
        class="h-14 px-6 bg-neutral-50/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 font-black text-[10px] uppercase italic outline-none transition-all"
        @change="fetchChains"
      >
        <option :value="10">10 BAŞINA</option>
        <option :value="20">20 BAŞINA</option>
        <option :value="50">50 BAŞINA</option>
      </select>
    </div>

    <!-- Stats -->
    <MatchingStats
      :total="pagination.total"
      :count="chains.length"
      :page="currentPage"
      :totalPages="pagination.totalPages"
    />

    <!-- Loading -->
    <div v-if="loading && !chains.length" class="flex flex-col items-center justify-center py-32 opacity-30 italic">
      <div class="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6" />
      <p class="text-[10px] font-black uppercase tracking-widest">VERİLER YAKALANIYOR</p>
    </div>

    <!-- Empty -->
    <div v-else-if="chains.length === 0" class="bg-white rounded-[3.5rem] p-32 text-center border-2 border-dashed border-neutral-100">
      <div class="text-6xl mb-8 transform -rotate-12">🔭</div>
      <h3 class="text-2xl font-black text-gray-900 uppercase italic tracking-tighter">Henüz Takas Zinciri Bulunamadı</h3>
      <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-widest italic">Arama kriterlerinize uygun zincir bulunamadı.</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-12">
      <MatchingChainItem
        v-for="chain in chains"
        :key="chain.id"
        :chain="chain"
        @view="showChainDetails"
        @delete="deleteDraft"
        @approve="approveChain"
      />

      <!-- Pagination -->
      <div class="mt-12 flex justify-center">
        <nav class="inline-flex gap-2 p-3 bg-white rounded-[2rem] border border-neutral-100 shadow-sm font-black text-[10px]">
          <button
            v-for="p in pagination.totalPages"
            :key="p"
            :disabled="p === currentPage"
            class="w-12 h-12 rounded-xl transition-all uppercase tracking-widest disabled:bg-indigo-600 disabled:text-white hover:bg-neutral-50"
            @click="changePage(p)"
          >
            {{ p }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Details -->
    <MatchingDetailModal
      :is-open="isModalOpen"
      :chain="selectedChain"
      @close="isModalOpen = false"
      @approve="id => { approveChain(id); isModalOpen = false }"
    />
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import MatchingStats from '~/components/admin/barter/MatchingStats.vue'
import MatchingChainItem from '~/components/admin/barter/MatchingChainItem.vue'
import MatchingDetailModal from '~/components/admin/barter/MatchingDetailModal.vue'

definePageMeta({
    layout: 'admin',
    middleware: 'auth'
})

const {
  chains, loading, detecting, isModalOpen, selectedChain,
  currentPage, itemsPerPage, searchQuery, pagination,
  fetchChains, debouncedSearch, changePage, detectCycles, approveChain, deleteDraft,
  showChainDetails
} = useMatching()

onMounted(() => fetchChains())
</script>

<style scoped>
.font-pj { font-family: 'Outfit', sans-serif; }
</style>
