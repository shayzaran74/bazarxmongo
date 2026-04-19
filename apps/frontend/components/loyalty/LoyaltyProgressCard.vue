<template>
  <div
    class="relative overflow-hidden bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 group transition-all duration-500 h-full flex flex-col"
  >
    <!-- Top accent line -->
    <div
      class="absolute top-0 left-0 right-0 h-1.5 transition-colors duration-500"
      :class="currentTierStyle.gradient"
    />

    <!-- Background Flairs -->
    <div
      class="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br opacity-10 dark:opacity-20 rounded-full blur-3xl pointer-events-none transition-colors duration-500"
      :class="currentTierStyle.gradient"
    />

    <!-- Header Section -->
    <div class="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
      <div class="flex items-center gap-5">
        <div
          class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl transition-all duration-500 group-hover:scale-105 group-hover:-rotate-3"
          :class="[currentTierStyle.bg, currentTierStyle.shadow]"
        >
          {{ currentTierStyle.emoji }}
        </div>
        <div>
          <h3
            class="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic leading-none drop-shadow-sm"
          >
            {{ formatTier(loyaltyData?.tier) }}
          </h3>
          <div class="flex items-center gap-2 mt-2">
            <span
              class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest"
              :class="currentTierStyle.badge"
            >
              Sadakat Seviyesi
            </span>
          </div>
        </div>
      </div>

      <div class="text-left sm:text-right">
        <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1">
          Mevcut XP
        </p>
        <div class="flex items-end gap-1 sm:justify-end">
          <span
            class="text-3xl font-black tabular-nums leading-none"
            :class="currentTierStyle.text"
          >
            {{ formatNumber(loyaltyData?.xp || 0) }}
          </span>
          <span class="text-sm font-bold text-gray-400 dark:text-gray-500 mb-1">XP</span>
        </div>
      </div>
    </div>

    <!-- Progress Section -->
    <div class="px-6 sm:px-8 py-2 relative z-10">
      <div class="flex items-end justify-between mb-3">
        <div>
          <p class="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5">
            Sonraki
            Seviye
          </p>
          <p
            class="text-sm font-black uppercase tracking-widest"
            :class="nextTierStyle.text"
          >
            {{ formatTier(loyaltyData?.nextTier) }}
          </p>
        </div>
        <div class="text-right">
          <span class="text-xs font-black text-gray-900 dark:text-white tabular-nums">{{
            Math.floor(loyaltyData?.progress || 0) }}%</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div
        class="relative h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full overflow-hidden border border-gray-200/50 dark:border-gray-600/50 shadow-inner"
      >
        <div
          class="h-full rounded-full transition-all duration-1000 ease-out relative"
          :class="currentTierStyle.gradient"
          :style="{ width: `${Math.min(loyaltyData?.progress || 0, 100)}%` }"
        >
          <!-- Shine effect -->
          <div
            class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-[200%] animate-[progressShimmer_2s_infinite]"
          />
        </div>
      </div>

      <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mt-4 text-center px-4">
        {{ loyaltyData?.message || 'Profilini tamamla, ilan ver ve etkinliklere katılarak XP kazan!' }}
      </p>
    </div>

    <!-- Advantages Section -->
    <div
      class="px-6 sm:px-8 py-6 mt-2 relative z-10 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700/50 flex-1"
    >
      <h4
        class="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2"
      >
        <SparklesIcon class="w-4 h-4 text-yellow-500" />
        Seviye Avantajların
      </h4>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="p-2 rounded-xl"
            :class="currentTierStyle.iconBg"
          >
            <TruckIcon
              class="w-5 h-5"
              :class="currentTierStyle.iconText"
            />
          </div>
          <div>
            <p class="text-xs font-bold text-gray-900 dark:text-white">
              {{ currentAdvantages.shipping.title }}
            </p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              {{
                currentAdvantages.shipping.desc }}
            </p>
          </div>
        </div>

        <div
          class="bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow"
        >
          <div
            class="p-2 rounded-xl"
            :class="currentTierStyle.iconBg"
          >
            <ShoppingBagIcon
              class="w-5 h-5"
              :class="currentTierStyle.iconText"
            />
          </div>
          <div>
            <p class="text-xs font-bold text-gray-900 dark:text-white">
              Sepet XP Limiti
            </p>
            <p class="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">
              Sipariş tutarının <b>{{
                currentAdvantages.discountLimit }}'sine</b> kadarını XP ile öde.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Action -->
    <div class="p-6 sm:p-8 pt-0 bg-gray-50/50 dark:bg-gray-800/50 relative z-10 rounded-b-3xl">
      <NuxtLink
        to="/help/loyalty-system"
        class="w-full flex items-center justify-center gap-2 py-3.5 bg-gray-900 dark:bg-gray-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 dark:hover:bg-primary-500 transition-colors duration-300 shadow-md"
      >
        Nasıl Daha Çok XP Kazanırım?
        <ArrowRightIcon class="h-4 w-4" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { computed } from '#imports'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
import SparklesIcon from '@heroicons/vue/24/outline/SparklesIcon'
import TruckIcon from '@heroicons/vue/24/outline/TruckIcon'
import ShoppingBagIcon from '@heroicons/vue/24/outline/ShoppingBagIcon'

const props = defineProps({
  loyaltyData: {
    type: Object,
    default: () => ({ tier: 'BEGINNER', nextTier: 'SILVER', progress: 0, xp: 0 })
  }
})

// Styles definition per tier
const tierStyles = {
  BEGINNER: {
    emoji: '🌱',
    gradient: 'from-emerald-400 to-teal-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    text: 'text-emerald-500',
    shadow: 'shadow-emerald-500/10',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconText: 'text-emerald-600 dark:text-emerald-400'
  },
  SILVER: {
    emoji: '🥈',
    gradient: 'from-gray-300 to-gray-500',
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-300',
    shadow: 'shadow-gray-500/10',
    badge: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    iconBg: 'bg-gray-100 dark:bg-gray-700',
    iconText: 'text-gray-700 dark:text-gray-300'
  },
  GOLD: {
    emoji: '🥇',
    gradient: 'from-yellow-400 to-amber-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/30',
    text: 'text-yellow-600 dark:text-yellow-500',
    shadow: 'shadow-yellow-500/20',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-400',
    iconBg: 'bg-yellow-50 dark:bg-yellow-900/30',
    iconText: 'text-yellow-600 dark:text-yellow-500'
  },
  PLATINUM: {
    emoji: '💎',
    gradient: 'from-indigo-400 via-purple-500 to-pink-500',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-400',
    shadow: 'shadow-indigo-500/20',
    badge: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-400',
    iconBg: 'bg-indigo-50 dark:bg-indigo-900/30',
    iconText: 'text-indigo-600 dark:text-indigo-400'
  }
}

// Advantages map based on tier
const tierAdvantages = {
  BEGINNER: {
    shipping: { title: 'Standart Kargo', desc: 'Siparişlerinizde normal kargo ücreti uygulanır.' },
    discountLimit: '%5'
  },
  SILVER: {
    shipping: { title: 'Standart Kargo', desc: 'Siparişlerinizde normal kargo ücreti uygulanır.' },
    discountLimit: '%10'
  },
  GOLD: {
    shipping: { title: 'Ücretsiz Kargo', desc: 'Yurtiçi tüm alışverişlerinizde kargo bedava!' },
    discountLimit: '%15'
  },
  PLATINUM: {
    shipping: { title: 'VIP Ücretsiz Kargo', desc: 'Öncelikli kargo işlemleri ve ücretsiz teslimat.' },
    discountLimit: '%25'
  }
}

const currentTierStyle = computed(() => {
  const t = props.loyaltyData?.tier?.toUpperCase() || 'BEGINNER'
  return tierStyles[t] || tierStyles.BEGINNER
})

const nextTierStyle = computed(() => {
  const t = props.loyaltyData?.nextTier?.toUpperCase() || 'BEGINNER'
  return tierStyles[t] || tierStyles.BEGINNER
})

const currentAdvantages = computed(() => {
  const t = props.loyaltyData?.tier?.toUpperCase() || 'BEGINNER'
  return tierAdvantages[t] || tierAdvantages.BEGINNER
})

const formatTier = (tier) => {
  if (!tier) return 'Başlangıç'
  const mapping = {
    'BEGINNER': 'Başlangıç',
    'SILVER': 'Silver',
    'GOLD': 'Gold',
    'PLATINUM': 'Platinum VIP'
  }
  return mapping[tier.toUpperCase()] || tier
}

const formatNumber = (num) => {
  return new Intl.NumberFormat('tr-TR').format(Math.floor(num))
}
</script>

<style scoped>
@keyframes progressShimmer {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}
</style>
