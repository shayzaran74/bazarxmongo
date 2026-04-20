<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Reklam Yönetimi</h1>
        <p class="text-gray-500 mt-1 font-medium">Tüm satıcı reklam kampanyalarını onaylayın ve performansı izleyin.</p>
      </div>
      <div class="flex gap-3">
        <div class="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CurrencyDollarIcon class="w-6 h-6 text-green-600" />
          </div>
          <div>
            <div class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Platform Geliri</div>
            <div class="text-xl font-black text-gray-900">₺{{ (stats.totalPlatformRevenue || 0).toLocaleString('tr-TR') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <AdvertisingStats :stats="stats" />

    <!-- Tabs & Tables -->
    <AdvertisingTabs
      v-model:activeTab="activeTab"
      v-model:activeFilter="activeFilter"
      v-model:searchQuery="searchQuery"
    />

    <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <AdvertisingCampaignTable
        v-if="activeTab === 'PRODUCT_ADS'"
        :campaigns="filteredCampaigns"
        @view="openDetails"
        @reject="promptReject"
        @update-status="updateStatus($event.id, $event.status)"
      />

      <AdvertisingBannerTable
        v-if="activeTab === 'BANNER_ADS'"
        :banners="filteredBanners"
        @reject="promptReject"
        @update-status="updateBannerStatus($event.id, $event.status)"
      />
    </div>

    <!-- Details Modal -->
    <AdvertisingDetailModal
      v-if="selectedAd"
      :ad="selectedAd"
      :is-rejecting="isRejecting"
      @close="selectedAd = null"
      @approve="handleApprove"
      @confirm-reject="handleConfirmReject"
    />
  </div>
</template>

<script setup>
import { CurrencyDollarIcon } from '@heroicons/vue/24/outline'

// Modüler Bileşenler
import AdvertisingStats from '~/components/admin/advertising/AdvertisingStats.vue'
import AdvertisingTabs from '~/components/admin/advertising/AdvertisingTabs.vue'
import AdvertisingCampaignTable from '~/components/admin/advertising/AdvertisingCampaignTable.vue'
import AdvertisingBannerTable from '~/components/admin/advertising/AdvertisingBannerTable.vue'
import AdvertisingDetailModal from '~/components/admin/advertising/AdvertisingDetailModal.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin'
})

const {
  stats,
  activeTab,
  activeFilter,
  activeBannerFilter,
  searchQuery,
  selectedAd,
  isRejecting,
  fetchCampaigns,
  fetchBanners,
  updateStatus,
  updateBannerStatus,
  rejectAd,
  filteredCampaigns,
  filteredBanners
} = useAdminAdvertising()

// Initial fetch
onMounted(() => {
  fetchCampaigns()
  fetchBanners()
})

// Local UI Logic
const openDetails = (ad) => {
  selectedAd.value = ad
  isRejecting.value = false
}

const promptReject = (ad) => {
  selectedAd.value = ad
  isRejecting.value = true
}

const handleApprove = (id) => {
  if (selectedAd.value.isBanner) {
    updateBannerStatus(id, 'ENABLED')
  } else {
    updateStatus(id, 'ENABLED')
  }
}

const handleConfirmReject = (reason) => {
  rejectAd(selectedAd.value.id, reason, selectedAd.value.isBanner)
}
</script>
