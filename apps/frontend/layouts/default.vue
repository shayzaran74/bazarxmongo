<template>
  <div class="min-h-screen bg-mesh pb-20 lg:pb-0 relative overflow-x-clip">
    <!-- Header -->
    <LayoutHeader
      :currentEcosystem="currentEcosystem"
      :brandName="brandName"
      :brandSubtitle="brandSubtitle"
      :logoUrl="siteLogoUrl ?? undefined"
      :categories="categories"
      :loading="false"
      @navigate="navigateTo($event)"
      @open-search="showAdvancedSearch = true"
      @open-location="locationModalOpen = true"
    />

    <!-- Main Content Grid -->
    <div :class="['relative transition-all duration-300', hideSideAds ? '' : 'flex justify-center']">
      <ClientOnly v-if="!hideSideAds">
        <LayoutPremiumSideAd
          v-if="sideAds.length"
          side="left"
          :ads="sideAds.filter(a => a.side === 'LEFT')"
        />
      </ClientOnly>

      <main
        :class="[
          'w-full py-6 relative z-[1] transition-all duration-300',
          hideSideAds ? 'px-0' : 'px-4 sm:px-6 lg:px-8 max-w-7xl'
        ]"
      >
        <slot />
      </main>

      <ClientOnly v-if="!hideSideAds">
        <LayoutPremiumSideAd
          v-if="sideAds.length"
          side="right"
          :ads="sideAds.filter(a => a.side === 'RIGHT')"
        />
      </ClientOnly>
    </div>

    <!-- Footer & Mobile Nav -->
    <LayoutFooter />
    <LayoutMobileNav :cartCount="cartCount" />

    <!-- Location Modal -->
    <LocationModal
      :is-open="locationModalOpen"
      :selected-city="selectedCity"
      :loading="geoLoading"
      :error="geoError"
      :detected="detectedCity"
      :cities="citiesList"
      @update:selected-city="selectedCity = $event"
      @detect="autoDetectLocation"
      @save="handleSaveLocation"
      @close="locationModalOpen = false"
    />

    <!-- Vendor Upsell Modal -->
    <VendorUpsellModal
      :is-open="showVendorRequiredModal"
      @close="showVendorRequiredModal = false"
      @register="navigateTo('/become-vendor')"
    />

    <!-- Search Overlay -->
    <Transition name="fade">
      <div v-if="showAdvancedSearch" class="fixed inset-0 z-[999] flex items-start justify-center pt-24 p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" @click="showAdvancedSearch = false" />
        <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden animate-slide-up p-8">
          <ProductAdvancedSearch :categories="categories" @filter="handleSearchFilter" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { cities as citiesList } from '@/data/turkey_locations'
import LocationModal from '~/components/layout/LocationModal.vue'
import VendorUpsellModal from '~/components/layout/VendorUpsellModal.vue'

import { useSiteSettingsStore } from '~/stores/siteSettings'

const settingsStore = useSiteSettingsStore()
const route = useRoute()
const hideSideAds = computed(() => {
  const meta = route.meta
  return meta && (meta.hideSideAds === true || (Array.isArray(meta) && meta.some(m => m?.hideSideAds === true)))
})

const {
  currentEcosystem, ecosystemHomeLink, siteLogoUrl,
  brandName, brandSubtitle, categories,
  locationModalOpen, showAdvancedSearch, showVendorRequiredModal,
  selectedCity, geoLoading, geoError, detectedCity, sideAds,
  saveLocation, initLayout, disconnect,
  autoDetectLocation, cartCount
} = useLayoutLogic()

const handleSaveLocation = () => saveLocation(selectedCity.value || detectedCity.value)

const handleSearchFilter = (filters: any) => {
  showAdvancedSearch.value = false
  navigateTo({
    path: '/products',
    query: filters
  })
}

onMounted(initLayout)
onUnmounted(disconnect)
</script>

<style scoped>
.bg-mesh {
  background:
    radial-gradient(circle at 0% 0%, rgba(99, 102, 241, 0.03) 0%, transparent 50%),
    radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.03) 0%, transparent 50%);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.animate-slide-up { animation: slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
@keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
</style>