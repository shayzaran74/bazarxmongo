<template>
  <div class="min-h-screen bg-gray-50 relative overflow-x-hidden">
    <CommonAnnouncementBar page="homepage" />

    <div class="py-2 md:py-3" />

    <!-- Hero Banner -->
    <LayoutHomeBanner
      v-if="settingsStore.homepageSettings.showHomeSlider === 'true'"
      ecosystem="BAZARX"
    />

    <!-- Dörtlü Vitrin (Quad Cards) - Hemen Banner Altında -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <HomeQuadCards :show="settingsStore.homepageSettings.showQuadCards" />
    </div>

    <!-- Quick Access Menu -->
    <HomeQuickMenu :items="quickAccessMenuItems" />

    <!-- Personalized Feed -->
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
      <LayoutPersonalizedFeed v-if="settingsStore.homepageSettings.showPersonalized === 'true'" />
    </div>

    <!-- Main Sections -->
    <div class="space-y-0">
      <HomeGroupBuy :show="settingsStore.homepageSettings.showGroupBuy" />
      <HomeSpecialOffers :show="settingsStore.homepageSettings.showSpecialOffers" />
      <HomeFlashSales :show="settingsStore.homepageSettings.showFlashSales" />

      <!-- Best Sellers Sections (Dynamic Category Highlights) -->
      <HomeCategoryHighlights />

      <HomeBarterPool :show="settingsStore.homepageSettings.showBarterPool" />
      <HomePersonalizedProducts :show="settingsStore.homepageSettings.showPersonalizedProducts" />
      
      <!-- Middle Banner Slider -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <LayoutMiddleBanner ecosystem="BAZARX" />
      </div>

      <HomePerformanceShowcase :show="settingsStore.homepageSettings.showPerformance" />

      <HomeAuctions :show="settingsStore.homepageSettings.showAuctions" />
      <HomeLotteries :show="settingsStore.homepageSettings.showLotteries" />
      <HomeVendors :show="settingsStore.homepageSettings.showVendors" />
      <HomeRestaurants :show="settingsStore.homepageSettings.showRestaurants" />
      <HomeBrands :show="settingsStore.homepageSettings.showBrands" />
      <HomeNewsletter :show="settingsStore.homepageSettings.showNewsletter" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSiteSettingsStore } from '~/stores/siteSettings'
import { useHomeMenuItems } from '~/composables/useHomeMenu'

const settingsStore = useSiteSettingsStore()
const quickAccessMenuItems = useHomeMenuItems()

onMounted(async () => {
  await settingsStore.fetchSettings()
})

definePageMeta({
  layout: 'default'
})

useHead({
  title: computed(() => settingsStore.siteTitle),
  meta: [
    { name: 'description', content: computed(() => settingsStore.siteDescription) }
  ]
})
</script>