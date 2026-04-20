<template>
  <div class="min-h-screen bg-[#fcfcfc] py-16 px-4 sm:px-6 lg:px-8 font-sans">
    <div class="max-w-7xl mx-auto space-y-16 italic">
      <!-- Header Module -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-10">
        <div class="space-y-6">
          <nav class="flex items-center space-x-4 text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">
            <NuxtLink to="/dashboard" class="hover:text-blue-600 transition-colors">DASHBOARD</NuxtLink>
            <span class="text-gray-300">/</span>
            <span class="text-blue-600 tracking-tighter">İHALE YÖNETİMİ</span>
          </nav>
          <div class="space-y-2">
            <h1 class="text-5xl md:text-8xl font-black text-gray-900 tracking-tightest leading-[0.85] uppercase drop-shadow-sm">
              AÇIK ARTIRMA<br><span class="text-blue-600">PROTOKOLÜ</span>
            </h1>
            <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-2">KİŞİSEL SATIŞ VE TEKLİF YÖNETİM MERKEZİ</p>
          </div>
        </div>

        <div class="hidden lg:block">
          <div class="p-8 bg-white rounded-[2.5rem] border border-neutral-100 shadow-2xl shadow-black/[0.02]">
            <div class="flex items-center gap-6">
              <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <TrophyIcon class="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest">AKTİF İSTATİSTİK</p>
                <p class="text-xl font-black text-gray-900 uppercase tracking-tighter">LİDERLİK TABLOSU</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <MyAuctionsTabs
        v-model:active-tab="activeTab"
        :created-count="createdAuctions.length"
        :bids-count="myBids.length"
        :won-count="0"
      />

      <!-- Tab Content Grid -->
      <div class="animate-in">
        <!-- Created Auctions Tab -->
        <MyAuctionsCreatedList
          v-if="activeTab === 'created'"
          :auctions="createdAuctions"
          :loading="loadingCreated"
          :is-admin="!!authStore.user?.isAdmin"
          @create="showCreateModal = true"
          @edit="editAuction"
          @end="endAuction"
        />

        <!-- My Bids Tab -->
        <MyAuctionsBidsList
          v-if="activeTab === 'bids'"
          :bids="myBids"
          :loading="loadingBids"
          @increase="(id) => navigateTo(`/auctions/${id}`)"
        />

        <!-- Won Auctions Tab -->
        <MyAuctionsWonList
          v-if="activeTab === 'won'"
        />
      </div>
    </div>

    <!-- Create Auction Modal Overlay -->
    <CreateAuctionModal
      v-if="showCreateModal"
      :auction="editingAuction"
      :is-edit="!!editingAuction"
      @close="closeModal"
      @created="onAuctionCreated"
      @updated="onAuctionUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { TrophyIcon } from '@heroicons/vue/24/outline'
import MyAuctionsTabs from '~/components/auction/my/MyAuctionsTabs.vue'
import MyAuctionsCreatedList from '~/components/auction/my/MyAuctionsCreatedList.vue'
import MyAuctionsBidsList from '~/components/auction/my/MyAuctionsBidsList.vue'
import MyAuctionsWonList from '~/components/auction/my/MyAuctionsWonList.vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

useHead({
  title: 'İHALE YÖNETİMİ // BAZARX'
})

const {
  activeTab, createdAuctions, myBids, loadingCreated, loadingBids,
  showCreateModal, editingAuction, authStore,
  endAuction, editAuction, closeModal, onAuctionCreated, onAuctionUpdated
} = useMyAuctions()
</script>

<style scoped>
.animate-in { 
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.tracking-tightest { letter-spacing: -0.06em; }
</style>