<template>
  <div class="space-y-6">
    <!-- Tier / Loyalty Card -->
    <div class="mb-6">
      <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
        {{ user?.vendor ? $t('profile.tierLevel') : $t('profile.loyaltyLevel') || 'Sadakat Seviyesi' }}
      </h3>

      <template v-if="user?.vendor">
        <TierBenefitsCard
          :tier-data="tierData?.currentTier"
          :progress="tierData?.progress"
        />
      </template>
      <template v-else>
        <LoyaltyProgressCard :loyalty-data="loyaltyData" />
      </template>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="bg-blue-50 p-4 rounded-xl">
        <p class="text-sm text-blue-600">
          {{ $t('profile.totalOrders') }}
        </p>
        <p class="text-2xl font-bold text-blue-800">
          {{ stats.totalOrders || 0 }}
        </p>
      </div>
      <div class="bg-green-50 p-4 rounded-xl">
        <p class="text-sm text-green-600">
          {{ $t('profile.totalSpent') }}
        </p>
        <p class="text-2xl font-bold text-green-800">
          {{ formatPrice(stats.totalSpent || 0) }}
        </p>
      </div>
      <div class="bg-purple-50 p-4 rounded-xl">
        <p class="text-sm text-purple-600">
          {{ $t('profile.level') }}
        </p>
        <p class="text-2xl font-bold text-purple-800">
          {{ stats.level || 1 }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import TierBenefitsCard from '~/components/loyalty/TierBenefitsCard.vue'
import LoyaltyProgressCard from '~/components/loyalty/LoyaltyProgressCard.vue'

defineProps({
  user: {
    type: Object,
    default: () => ({})
  },
  tierData: {
    type: Object,
    default: () => ({})
  },
  loyaltyData: {
    type: Object,
    default: () => ({})
  },
  stats: {
    type: Object,
    default: () => ({})
  },
  formatPrice: {
    type: Function,
    default: (val) => val
  }
})
</script>
