<template>
  <div class="px-8 max-w-7xl mx-auto space-y-12 min-h-screen bg-[#fcfcfc] py-16 font-sans italic">
    <!-- Header Protocol -->
    <div
      class="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-10 rounded-[3.5rem] border border-neutral-100 shadow-2xl shadow-black/[0.02] relative overflow-hidden group"
    >
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      <div class="relative z-10">
        <h1
          class="text-4xl md:text-6xl font-black text-gray-900 uppercase tracking-tightest leading-none"
        >
          BİRLİKTE AL<br><span class="text-blue-600">KONTROL PANELİ</span>
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-4 uppercase tracking-[0.4em] ml-1">GRUP ALIMI VE İNDİRİM STRATEJİ YÖNETİMİ v2.1</p>
      </div>
      <div class="relative z-10">
        <button
          class="px-10 py-5 bg-gray-900 hover:bg-black text-white font-black text-[11px] uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95"
          @click="openModal()"
        >
          🚀 YENİ KAMPANYA BAŞLAT
        </button>
      </div>
    </div>

    <!-- Active Campaigns / List Section -->
    <div v-if="campaigns.length > 0">
      <AdminGroupBuyList
        :campaigns="campaigns"
        @edit="openModal"
        @delete="deleteCampaign"
      />
    </div>

    <!-- Empty State Section -->
    <AdminGroupBuyEmpty
      v-else
      @create="openModal()"
    />

    <!-- Configuration Modal -->
    <AdminGroupBuyModal
      v-model="form"
      v-model:product-search="productSearch"
      :is-open="showModal"
      :is-editing="!!editingCampaign"
      :saving="saving"
      :search-results="searchResults"
      :selected-product="selectedProductData"
      @close="showModal = false"
      @save="saveCampaign"
      @select-product="selectProduct"
      @change-product="form.productId = ''; selectedProductData = null"
      @add-tier="addTier"
      @remove-tier="removeTier"
    />
  </div>
</template>

<script setup lang="ts">
import AdminGroupBuyList from '~/components/admin/group-buy/AdminGroupBuyList.vue'
import AdminGroupBuyEmpty from '~/components/admin/group-buy/AdminGroupBuyEmpty.vue'
import AdminGroupBuyModal from '~/components/admin/group-buy/AdminGroupBuyModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

useHead({
  title: 'BİRLİKTE AL YÖNETİMİ // BAZARX'
})

const {
  campaigns, showModal, saving, editingCampaign, productSearch, searchResults, selectedProductData, form,
  searchProducts, selectProduct, addTier, removeTier, openModal, saveCampaign, deleteCampaign
} = useAdminGroupBuy()

// Search watch trigger
watch(productSearch, () => {
  searchProducts()
})
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.06em; }
</style>
