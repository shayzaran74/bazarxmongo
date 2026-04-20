<template>
  <div class="py-12 lg:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-screen">
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
          <ArrowPathIcon class="h-7 w-7" :class="{ 'animate-spin': loading }" />
        </button>
        <button
          class="h-16 px-12 bg-gray-900 text-white rounded-[1.5rem] font-black text-[10px] tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200 flex items-center gap-4 shrink-0"
          @click="openCreateModal"
        >
          <PlusIcon class="h-5 w-5" />
          YENİ İLAN EKLE
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div v-if="myCompany" class="flex flex-wrap gap-3 bg-white p-2 rounded-[2rem] border border-gray-100 shadow-sm w-fit mb-12 italic font-black text-[10px] tracking-widest">
      <button
        v-for="tab in [{ id: 'listings', label: 'İLANLARIM' }, { id: 'received', label: 'GELEN TEKLİFLER' }, { id: 'sent', label: 'GİDEN TEKLİFLER' }]"
        :key="tab.id"
        :class="activeTab === tab.id ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'"
        class="px-8 py-4 rounded-[1.5rem] transition-all"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
      </button>
      <div class="w-px bg-gray-100 mx-2 hidden md:block" />
      <NuxtLink
        to="/my/offers"
        class="flex items-center gap-2 bg-indigo-50 text-indigo-700 px-8 py-4 rounded-[1.5rem] hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
      >
        <ChatBubbleLeftRightIcon class="h-5 w-5 mr-1" />
        SOHBETLER
      </NuxtLink>
    </div>

    <!-- Company Status Guard -->
    <div v-if="!loading && !myCompany" class="bg-white rounded-[3.5rem] p-20 border border-gray-100 shadow-sm mb-12 flex flex-col items-center text-center italic">
      <div class="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mb-10 transform -rotate-12 shadow-inner">
        <BuildingOfficeIcon class="h-10 w-10 text-indigo-600" />
      </div>
      <h3 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic leading-none">FİRMA PROFİLİNİZ BULUNMUYOR</h3>
      <p class="text-[11px] font-black text-gray-400 max-w-sm mb-12 uppercase tracking-widest leading-loose">TAKAS PLATFORMUNDA İŞLEM YAPABİLMEK İÇİN ÖNCE BİREYSEL/TİCARİ FİRMA PROFİLİ OLUŞTURMANIZ GEREKLİDİR.</p>
      <button class="bg-gray-900 text-white rounded-2xl px-14 py-5 text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-2xl shadow-gray-200" @click="showCompanyModal = true">FİRMA OLUŞTUR</button>
    </div>

    <!-- Main List View -->
    <div v-else-if="loading && !items.length" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      <div v-for="i in 3" :key="i" class="h-96 bg-white rounded-[3.5rem] border border-gray-100 animate-pulse shadow-sm" />
    </div>

    <div v-else-if="activeTab === 'listings'" class="animate-in">
      <div v-if="items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
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
          <ArchiveBoxIcon class="h-10 w-10 text-gray-300" />
        </div>
        <h3 class="text-3xl font-black text-gray-900 mb-4 uppercase tracking-tighter italic">HENÜZ İLANINIZ BULUNMUYOR</h3>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest max-w-xs mx-auto leading-loose">FAZLA STOKLARINIZI İHTİYACINIZ OLAN FARKLI BİR MALA DÖNÜŞTÜRMEK İÇİN HEMEN BAŞLAYIN.</p>
      </div>
    </div>

    <!-- Offers Section -->
    <div v-else-if="activeTab === 'received' || activeTab === 'sent'" class="animate-in space-y-6">
      <div v-if="offers.length > 0" class="space-y-6">
        <SurplusOfferItem
          v-for="offer in offers"
          :key="offer.id"
          :offer="offer"
          :active-tab="activeTab"
          @accept="acceptOffer"
          @reject="rejectOffer"
        />
      </div>
      <div v-else class="text-center py-40 bg-white rounded-[4rem] border border-dashed border-gray-100 italic">
        <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">📭</div>
        <p class="text-[11px] font-black text-gray-400 uppercase tracking-widest italic">HENÜZ BİR TEKLİF HAREKETİ BULUNMUYOR</p>
      </div>
    </div>

    <!-- Modals -->
    <SurplusChainModal
      :is-open="isTradeModalOpen"
      :chain="selectedChain"
      @close="isTradeModalOpen = false"
    />
    <CreateSurplusModal
      v-if="showCreateModal"
      :item="selectedItem"
      @close="showCreateModal = false"
      @success="fetchItems"
    />
    <CreateCompanyModal
      v-if="showCompanyModal"
      @close="showCompanyModal = false"
      @success="fetchMyCompany"
    />
  </div>
</template>

<script setup>
import {
  BuildingOfficeIcon, PlusIcon, ArchiveBoxIcon,
  ArrowPathIcon, ChatBubbleLeftRightIcon
} from '@heroicons/vue/24/outline'
import SurplusItemCard from '~/components/my/surplus/SurplusItemCard.vue'
import SurplusOfferItem from '~/components/my/surplus/SurplusOfferItem.vue'
import SurplusChainModal from '~/components/my/surplus/SurplusChainModal.vue'

const authStore = useAuthStore()
const {
  items, offers, myChains, myCompany, activeTab, loading,
  showCreateModal, showCompanyModal, isTradeModalOpen, selectedItem, selectedChain,
  fetchMyCompany, fetchItems, fetchOffers, deleteItem, reactivateItem, acceptOffer, rejectOffer,
  handleRefresh, openCreateModal, openEditModal, showChainDetails, getItemChain
} = useSurplus()

onMounted(async () => {
  await authStore.init()
  if (authStore.isAuthenticated) {
    fetchMyCompany()
  } else {
    loading.value = false
    useRouter().push('/login')
  }
})
</script>

<style scoped>
.animate-in { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
