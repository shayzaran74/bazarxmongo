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

    <!-- Recent Orders -->
    <div class="mt-8">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-sm font-black text-gray-900 uppercase tracking-widest">Son Siparişler</h3>
        <NuxtLink to="/orders" class="text-xs font-bold text-indigo-600 hover:text-indigo-700">Tümünü Gör</NuxtLink>
      </div>

      <div v-if="recentOrders.length > 0" class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div 
          v-for="order in recentOrders" :key="order.id"
          class="flex items-center justify-between p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <ShoppingBagIcon class="w-5 h-5" />
            </div>
            <div>
              <p class="text-xs font-black text-gray-900">#{{ order.orderNumber || order.id.slice(0, 8).toUpperCase() }}</p>
              <p class="text-[10px] text-gray-400 font-bold uppercase">{{ new Date(order.createdAt).toLocaleDateString('tr-TR') }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <span 
              class="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter"
              :class="getStatusClass(order.status)"
            >
              {{ order.status }}
            </span>
            <span class="text-xs font-black text-gray-900">{{ formatPrice(order.totalAmount || order.total) }}</span>
          </div>
        </div>
      </div>
      <div v-else class="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-100">
        <p class="text-xs text-gray-400 font-bold uppercase tracking-widest">Henüz siparişiniz bulunmuyor</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { 
  ShoppingBagIcon, 
  BanknotesIcon, 
  CheckBadgeIcon, 
  ArrowPathIcon,
  TicketIcon
} from '@heroicons/vue/24/outline'
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
    default: () => ({
      totalOrders: 0,
      totalSpent: 0,
      loyaltyPoints: 0
    })
  },
  recentOrders: {
    type: Array,
    default: () => []
  },
  formatPrice: {
    type: Function,
    default: (val) => val
  }
})

const getStatusClass = (status) => {
  switch (status) {
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-green-100 text-green-700'
    case 'PENDING':
    case 'PROCESSING':
      return 'bg-yellow-100 text-yellow-700'
    case 'CANCELLED':
    case 'FAILED':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}
</script>
