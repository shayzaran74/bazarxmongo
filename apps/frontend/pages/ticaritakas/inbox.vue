<template>
  <div class="min-h-screen">
    <TtAccessBarrier v-if="!isVendor" />
    <div :class="{ 'blur-md pointer-events-none': !isVendor }" class="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 italic uppercase">
      <div>
        <h1 class="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3 italic">
          TAKAS PANELİ <span class="text-indigo-600">/</span> {{ authStore.fullName }}
        </h1>
        <p class="text-[10px] font-black text-gray-400 tracking-widest leading-none">
          TİCARİ FAZLASI ÜRÜNLERİNİZİ VE AKILLI TAKAS SÜREÇLERİNİZİ YÖNETİN.
        </p>
      </div>

      <div class="flex items-center gap-4">
        <button
          class="w-16 h-16 bg-white border border-gray-100 rounded-[1.5rem] shadow-sm hover:shadow-xl transition-all text-gray-400 hover:text-indigo-600 flex items-center justify-center shrink-0"
          title="YENİLE"
          @click="handleRefresh"
        >
          <svg class="h-7 w-7" :class="{ 'animate-spin': loading }" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>
        <button
          class="h-16 px-12 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center gap-4 shrink-0"
          @click="openCreateModal"
        >
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          YENİ İLAN EKLE
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div v-if="myCompany" class="flex flex-wrap gap-3 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm w-fit mb-12 italic font-black text-[10px] tracking-widest">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
        class="px-8 py-4 rounded-[1.5rem] transition-all"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Firma gereksinim uyarısı -->
    <div v-if="!loading && !myCompany" class="bg-white rounded-[3.5rem] p-20 border border-gray-100 shadow-sm mb-12 flex flex-col items-center text-center italic">
      <div class="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-12 shadow-inner">
        <svg class="h-10 w-10 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
        </svg>
      </div>
      <h3 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic leading-none">FİRMA PROFİLİNİZ BULUNMUYOR</h3>
      <p class="text-[11px] font-black text-gray-400 max-w-sm mb-12 uppercase tracking-widest leading-loose">TAKAS PLATFORMUNDA İŞLEM YAPABİLMEK İÇİN ÖNCE FİRMA PROFİLİ OLUŞTURMANIZ GEREKLİDİR.</p>
      <button class="bg-gray-900 text-white rounded-2xl px-14 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200" @click="showCompanyModal = true">
        FİRMA OLUŞTUR
      </button>
    </div>

    <!-- Yükleme iskelet -->
    <div v-else-if="loading && !items.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <div v-for="i in 3" :key="i" class="h-96 bg-white rounded-[3.5rem] border border-gray-100 animate-pulse shadow-sm" />
    </div>

    <!-- İlanlar -->
    <div v-else-if="activeTab === 'listings'" class="animate-in">
      <div v-if="items?.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <SurplusItemCard
          v-for="item in items"
          :key="item.id"
          :item="item"
          :has-chain="!!getItemChain(item.id)"
          @edit="openEditModal"
          @delete="deleteItem"
          @reactivate="reactivateItem"
          @viewChain="showChainDetails(getItemChain(item.id))"
        />
      </div>
      <div v-else class="text-center py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 italic">
        <div class="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner transform -rotate-6">
          <svg class="h-10 w-10 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
          </svg>
        </div>
        <h3 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">HENÜZ İLANINIZ BULUNMUYOR</h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-loose">FAZLA STOKLARINIZI İHTİYACINIZ OLAN FARKLI BİR MALA DÖNÜŞTÜRMEK İÇİN HEMEN BAŞLAYIN.</p>
      </div>
    </div>

    <!-- Teklifler (gelen / giden) -->
    <div v-else-if="activeTab === 'received' || activeTab === 'sent'" class="animate-in space-y-6">
      <div v-if="offers?.length" class="space-y-6">
        <InboxOfferItem
          v-for="offer in offers"
          :key="offer.id"
          :offer="offer"
          :active-tab="activeTab"
          :my-company-id="myCompany?.id"
          @accept="acceptOffer"
          @reject="rejectOffer"
        />
      </div>
      <div v-else class="text-center py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 italic">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📭</div>
        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">HENÜZ BİR TEKLİF HAREKETİ BULUNMUYOR</p>
      </div>
    </div>

    <!-- Modaller -->
    <SurplusChainModal :is-open="isTradeModalOpen" :chain="selectedChain" @close="isTradeModalOpen = false" />
    <CreateSurplusModal v-if="showCreateModal" :item="selectedItem" @close="showCreateModal = false" @success="fetchItems" />
    <CreateCompanyModal v-if="showCompanyModal" @close="showCompanyModal = false" @success="fetchMyCompany" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SurplusItemCard from '~/components/ticaritakas/SurplusItemCard.vue'
import InboxOfferItem from '~/components/ticaritakas/inbox/InboxOfferItem.vue'
import SurplusChainModal from '~/components/ticaritakas/SurplusChainModal.vue'
import CreateSurplusModal from '~/components/modals/CreateSurplusModal.vue'
import CreateCompanyModal from '~/components/modals/CreateCompanyModal.vue'

import TtAccessBarrier from '~/components/ticaritakas/TtAccessBarrier.vue'

definePageMeta({ middleware: ['auth'], hideSideAds: true })

const authStore = useAuthStore()
const surplus = useSurplus()

const isVendor = computed(() => {
  return authStore.isAuthenticated && (authStore.user?.role === 'VENDOR' || authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN')
})

const tabs = [
  { id: 'listings', label: 'İLANLARIM' },
  { id: 'received', label: 'GELEN TEKLİFLER' },
  { id: 'sent',     label: 'GİDEN TEKLİFLER' },
]

const {
  items, offers, myCompany, activeTab, loading,
  showCreateModal, showCompanyModal, isTradeModalOpen, selectedItem, selectedChain,
  fetchMyCompany, fetchItems, deleteItem, reactivateItem, acceptOffer, rejectOffer,
  handleRefresh, openCreateModal, openEditModal, showChainDetails, getItemChain,
} = surplus

onMounted(async () => {
  await authStore.init()
  if (authStore.isAuthenticated) {
    await surplus.fetchMyCompany()
  } else {
    await navigateTo('/login')
  }
})
</script>

<style scoped>
.animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
