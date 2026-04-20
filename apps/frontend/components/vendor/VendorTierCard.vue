<script setup lang="ts">
import TierHeader from './tier/TierHeader.vue'
import TierStats from './tier/TierStats.vue'
import TierBenefits from './tier/TierBenefits.vue'
import TierProgress from './tier/TierProgress.vue'
import RegionalCampaign from './tier/RegionalCampaign.vue'
import TierFeaturesList from './tier/TierFeaturesList.vue'

const props = defineProps({
  tierData: { type: Object, default: () => ({}) },
  progress: { type: Object, default: null },
  stats: { type: Object, default: null },
  regional: { type: Object, default: null },
  currentCommissionRate: { type: Number, default: 10 }
})

const { tierFeatures, commissionDisplay, formatCurrency } = useVendorTier(props)
const tierColor = computed(() => props.tierData?.color || '#4CAF50')
</script>

<template>
  <div class="bg-white rounded-[3.5rem] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden" :style="{ '--tier-color': tierColor }">
    <!-- Header Section -->
    <TierHeader :tierData="tierData" :commissionDisplay="commissionDisplay" />

    <!-- Stats Summary -->
    <TierStats v-if="stats" :stats="stats" :tierColor="tierColor" />

    <!-- Regional Campaign -->
    <RegionalCampaign :regional="regional" />

    <!-- Progress Tracker -->
    <TierProgress :progress="progress" :tierColor="tierColor" />

    <!-- Benefits & Features Split -->
    <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-50 bg-white">
       <TierBenefits :features="tierFeatures" />
       <TierFeaturesList :tierData="tierData" />
    </div>

    <!-- Limits Quick View -->
    <div v-if="tierData?.limits" class="grid grid-cols-3 gap-1 p-6 bg-gray-50/50 border-t border-gray-100">
       <div v-for="(val, lbl) in {
         'Ürün Limiti': tierData.limits.maxProducts === -1 ? 'Sınırsız' : tierData.limits.maxProducts,
         'Öne Çıkan': tierData.limits.featuredProductSlots,
         'Günlük Çekim': formatCurrency(tierData.limits.dailyWithdraw)
       }" :key="lbl" class="text-center">
          <span class="text-[8px] font-black uppercase text-gray-400 tracking-tighter block mb-1">{{ lbl }}</span>
          <span class="text-[10px] font-black text-gray-900 italic">{{ val }}</span>
       </div>
    </div>

    <!-- Footer Action -->
    <NuxtLink to="/tier-info?type=vendor" class="block py-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-primary-600 hover:bg-gray-50 transition-all border-t border-gray-50">
       Tüm Tier Avantajlarını Karşılaştır →
    </NuxtLink>
  </div>
</template>

<style scoped>
/* Scoped styles kept minimal as we use Tailwind classes for the new design */
</style>
