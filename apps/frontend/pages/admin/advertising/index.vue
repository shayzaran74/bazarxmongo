<template>
  <div class="min-h-screen bg-gray-50 p-6 lg:p-10">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight italic uppercase">
          📣 Reklam <span class="text-indigo-600">Yönetimi</span>
        </h1>
        <p class="text-gray-500 mt-1 font-medium italic opacity-70">Tüm satıcı reklam kampanyalarını onaylayın ve performansı izleyin.</p>
      </div>
      <div class="flex gap-3">
        <button class="p-3 bg-white hover:bg-gray-50 rounded-2xl shadow-sm border border-gray-100 transition-all" @click="fetchAll">
          <ArrowPathIcon class="h-6 w-6 text-indigo-600" />
        </button>
      </div>
    </div>

    <!-- Summary Stats -->
    <AdvertisingStats :stats="stats" />

    <!-- Tabs & Filter Control -->
    <AdvertisingTabs 
      v-model:active-tab="activeTab"
      v-model:active-filter="currentActiveFilter"
      v-model:search-query="searchQuery"
    />

    <!-- Tables -->
    <div v-show="activeTab === 'PRODUCT_ADS'">
      <AdvertisingCampaignTable 
        :campaigns="filteredCampaigns"
        :format-currency="formatCurrency"
        :format-number="formatNumber"
        :get-status-label="getStatusLabel"
        :get-status-class="getStatusClass"
        @details="openDetails"
        @approve="updateAdStatus($event, 'ENABLED')"
        @reject-prompt="handleRejectPrompt"
        @update-status="updateAdStatus"
      />
    </div>

    <div v-show="activeTab === 'BANNER_ADS'">
      <AdvertisingBannerTable 
        :banners="filteredBanners"
        :get-status-label="getStatusLabel"
        :get-status-class="getStatusClass"
        @approve="updateBannerStatus($event, 'ENABLED')"
        @reject-prompt="handleRejectPrompt"
      />
    </div>

    <!-- Review Modal -->
    <AdvertisingDetailModal 
      :ad="selectedAd"
      :is-rejecting="isRejectingInternal"
      @close="selectedAd = null"
      @approve="handleApprove"
      @confirm-reject="confirmRejectAction"
    />
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import { useAdminAdvertising } from '~/composables/useAdminAdvertising'

// Modüler Bileşenler
import AdvertisingStats from '~/components/admin/advertising/AdvertisingStats.vue'
import AdvertisingTabs from '~/components/admin/advertising/AdvertisingTabs.vue'
import AdvertisingCampaignTable from '~/components/admin/advertising/AdvertisingCampaignTable.vue'
import AdvertisingBannerTable from '~/components/admin/advertising/AdvertisingBannerTable.vue'
import AdvertisingDetailModal from '~/components/admin/advertising/AdvertisingDetailModal.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Reklam Yönetimi - BazarX Admin' })

const {
  stats, activeTab, activeFilter, activeBannerFilter, searchQuery,
  filteredCampaigns, filteredBanners,
  fetchAll, updateAdStatus, updateBannerStatus
} = useAdminAdvertising()

const currentActiveFilter = computed({
  get: () => activeTab.value === 'PRODUCT_ADS' ? activeFilter.value : activeBannerFilter.value,
  set: (val) => {
    if (activeTab.value === 'PRODUCT_ADS') activeFilter.value = val
    else activeBannerFilter.value = val
  }
})

const selectedAd = ref(null)
const isRejectingInternal = ref(false)

// Actions
const openDetails = (ad) => {
  selectedAd.value = ad
  isRejectingInternal.value = false
}

const handleRejectPrompt = (ad) => {
  selectedAd.value = ad
  isRejectingInternal.value = true
}

const handleApprove = async (id) => {
  const success = selectedAd.value?.isBanner 
    ? await updateBannerStatus(id, 'ENABLED')
    : await updateAdStatus(id, 'ENABLED')
  if (success) selectedAd.value = null
}

const confirmRejectAction = async (reason) => {
  if (!selectedAd.value) return
  const success = selectedAd.value.isBanner
    ? await updateBannerStatus(selectedAd.value.id, 'REJECTED', reason)
    : await updateAdStatus(selectedAd.value.id, 'REJECTED', reason)
  if (success) selectedAd.value = null
}

// Helpers
const formatCurrency = (val) => Number(val).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const formatNumber = (val) => Number(val).toLocaleString('tr-TR')
const getStatusLabel = (s) => ({
  'PENDING': 'Bekliyor', 'ENABLED': 'Aktif', 'PAUSED': 'Durduruldu', 'REJECTED': 'Reddedildi', 'ARCHIVED': 'Arşivlendi'
})[s] || s

const getStatusClass = (s) => ({
  'PENDING': 'bg-amber-50 text-amber-700 border border-amber-100',
  'ENABLED': 'bg-green-50 text-green-700 border border-green-100',
  'PAUSED': 'bg-gray-100 text-gray-700 border border-gray-200',
  'REJECTED': 'bg-red-50 text-red-700 border border-red-100'
})[s] || 'bg-gray-100 text-gray-700'

onMounted(fetchAll)
</script>
