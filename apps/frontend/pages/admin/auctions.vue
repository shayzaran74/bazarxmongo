<script setup lang="ts">
import { PlusIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'
import AuctionStatsView from '~/components/admin/auctions/AuctionStatsView.vue'
import AuctionFilters from '~/components/admin/auctions/AuctionFilters.vue'
import AuctionTable from '~/components/admin/auctions/AuctionTable.vue'
import AuctionParticipationsTable from '~/components/admin/auctions/AuctionParticipationsTable.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({ title: 'Açık Artırma Kontrol Merkezi - BazarX Admin' })

const { 
  loading, participationsLoading, activeTab, categories, filters,
  filteredAuctions, participations, stats,
  init, fetchAuctions, approveParticipation, rejectParticipation, advanceWinner, deleteAuction
} = useAdminAuctions()

const showCreateModal = ref(false)
const editingAuction = ref<any>(null)

const handleEdit = (auction: any) => {
  editingAuction.value = auction
  showCreateModal.value = true
}

const handleCloseModal = () => {
  showCreateModal.value = false
  editingAuction.value = null
}

const handleCreated = () => {
  fetchAuctions()
  handleCloseModal()
}

onMounted(() => init())
</script>

<template>
  <div class="space-y-10">
    <!-- Premium Header -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-gray-50/50">
      <div class="flex items-center gap-6">
        <div class="w-16 h-16 rounded-[2rem] bg-gray-900 flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-transparent"></div>
          <ArrowPathIcon class="w-8 h-8 relative z-10" :class="{ 'animate-spin': loading }" />
        </div>
        <div>
          <h1 class="text-3xl font-black text-gray-900 italic tracking-tighter uppercase leading-none mb-2">Açık Artırma Merkezi</h1>
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Etkinlikler, Talepler ve Finansal Kontrol</p>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <button class="bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all" @click="fetchAuctions" :disabled="loading">Yenile</button>
        <button class="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-gray-200 transition-all flex items-center gap-2" @click="showCreateModal = true">
          <PlusIcon class="w-4 h-4" /> Yeni Etkinlik
        </button>
      </div>
    </div>

    <!-- Stats View -->
    <AuctionStatsView :stats="stats" />

    <!-- Navigation Tabs -->
    <div class="flex bg-gray-100/50 p-1.5 rounded-[2rem] w-fit border border-gray-200/20">
      <button 
        :class="activeTab === 'auctions' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900'"
        class="px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all"
        @click="activeTab = 'auctions'"
      >
        Açık Artırmalar
      </button>
      <button 
        :class="activeTab === 'participations' ? 'bg-white text-gray-900 shadow-xl' : 'text-gray-500 hover:text-gray-900'"
        class="px-8 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
        @click="activeTab = 'participations'"
      >
        Katılım Talepleri
        <span v-if="stats.pendingParticipations > 0" class="flex w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
      </button>
    </div>

    <!-- Main Content Area -->
    <div class="min-h-[600px]">
      <div v-if="activeTab === 'auctions'" class="space-y-6">
        <AuctionFilters 
          v-model:filters="filters" 
          :categories="categories" 
          @reset="filters = { status: '', category: '', search: '' }" 
        />
        <AuctionTable 
          :auctions="filteredAuctions" 
          :loading="loading"
          @edit="handleEdit"
          @view="id => navigateTo(`/auctions/${id}`)"
          @delete="deleteAuction"
          @advance="advanceWinner"
        />
      </div>

      <div v-if="activeTab === 'participations'" class="animate-in fade-in slide-in-from-top-4 duration-500">
        <AuctionParticipationsTable 
          :participations="participations" 
          :loading="participationsLoading"
          @approve="approveParticipation"
          @reject="rejectParticipation"
        />
      </div>
    </div>

    <!-- Modal - Already external, reuse -->
    <ModalsCreateAuctionModal
      v-if="showCreateModal"
      :auction="editingAuction"
      :is-edit="!!editingAuction"
      @close="handleCloseModal"
      @created="handleCreated"
      @updated="handleCreated"
    />
  </div>
</template>