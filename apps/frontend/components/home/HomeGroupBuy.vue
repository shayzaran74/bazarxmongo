<template>
  <div
    v-if="show !== 'false' && activeGroupBuy"
    class="w-full bg-md3-primary py-8 md:py-16 relative overflow-hidden group mb-8 md:mb-12"
  >
    <!-- Animated background patterns -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <div class="absolute -top-24 -left-24 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px] animate-pulse" />
      <div class="absolute -bottom-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-10">
      <!-- Left side: Product Visuals -->
      <div class="w-full lg:w-1/2 flex justify-center">
        <div class="relative group-hover:scale-105 transition-transform duration-700">
          <div class="absolute inset-0 bg-primary-500/20 rounded-[3rem] blur-3xl -rotate-6" />
          <ProductImage
            :src="activeGroupBuy.Product?.image"
            :alt="activeGroupBuy.Product?.name"
            class="relative w-48 h-48 md:w-[300px] md:h-[300px]"
            image-class="object-cover rounded-2xl md:rounded-[2.5rem] shadow-2xl border-4 border-white/10"
          />
          <div
            class="absolute -top-6 -right-6 bg-red-600 text-white font-black text-2xl w-24 h-24 rounded-full flex flex-col items-center justify-center rotate-12 shadow-2xl border-4 border-md3-primary animate-bounce"
          >
            <span class="text-xs md:text-sm">-%{{ calculateMaxDiscount() }}</span>
            <span class="text-base uppercase">{{ $t('specialOffers.dealOfDay') }}</span>
          </div>
        </div>
      </div>

      <!-- Right side: Content & Tiers -->
      <div class="w-full lg:w-1/2 text-white space-y-8">
        <div>
          <div class="inline-flex items-center bg-primary-500/20 px-4 py-2 rounded-full border border-primary-500/30 mb-4">
            <UserGroupIcon class="h-5 w-5 text-primary-400 mr-2" />
            <span class="text-xs font-black tracking-[0.2em] uppercase">{{ $t('groupBuy.title') }}</span>
          </div>
          <h2 class="text-xl md:text-4xl font-black mb-3 leading-none">
            {{ activeGroupBuy.title ||
              activeGroupBuy.Product?.name }}
          </h2>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10">
            <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2 flex items-center">
              <ClockIcon class="h-3 w-3 mr-1" /> {{ $t('groupBuy.timeLeft') }}
            </p>
            <div class="flex space-x-4 font-black text-lg md:text-2xl">
              <div class="flex flex-col items-center">
                <span>{{ days }}</span><span
                  class="text-[8px] text-white/60"
                >{{ $t('groupBuy.days') }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span>{{ hours }}</span><span
                  class="text-[8px] text-white/60"
                >{{ $t('groupBuy.hours') }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span>{{ minutes }}</span><span
                  class="text-[8px] text-white/60"
                >{{ $t('groupBuy.minutes') }}</span>
              </div>
              <div class="flex flex-col items-center">
                <span>{{ seconds }}</span><span
                  class="text-[8px] text-white/60"
                >{{ $t('groupBuy.seconds') }}</span>
              </div>
            </div>
          </div>
          <div class="bg-white/5 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/10">
            <p class="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-2">
              {{
                $t('home.targetProgress') }}
            </p>
            <div class="relative pt-1">
              <div class="overflow-hidden h-3 text-xs flex rounded-full bg-black/30">
                <div
                  :style="{ width: getProgressPercent() + '%' }"
                  class="bg-gradient-to-r from-primary-500 to-md3-secondary transition-all duration-1000"
                />
              </div>
              <div class="flex justify-between text-xs font-bold mt-2">
                <span>{{ activeGroupBuy.currentQuantity }} {{ $t('groupBuy.sold') }}</span>
                <span>{{ getNextTierQuantity() }} {{ $t('groupBuy.target') }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(tier, idx) in sortedTiers"
            :key="idx"
            class="p-4 rounded-3xl border transition-all duration-500"
            :class="isTierReached(tier.minQuantity) ? 'bg-primary-600 border-primary-400 shadow-xl shadow-primary-900/40 -translate-y-2' : 'bg-white/5 border-white/10 opacity-60'"
          >
            <p class="text-[10px] font-black uppercase tracking-tighter mb-1">
              {{ tier.minQuantity }}+ {{
                $t('groupBuy.qty') }}
            </p>
            <p class="text-xl md:text-2xl font-black leading-none">
              {{ formatPrice(tier.price) }}
            </p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 mt-6">
          <button
            class="flex-1 bg-primary-500 hover:bg-primary-400 text-white py-5 rounded-[2rem] font-black text-[16px] md:text-xl shadow-2xl transition-all flex items-center justify-center group/btn active:scale-95"
            @click="navigateTo(activeGroupBuy?.Product ? getProductUrl(activeGroupBuy.Product) : '/')"
          >
            {{ $t('groupBuy.joinGroup') }}
            <ArrowRightIcon class="h-6 w-6 ml-3 group-hover/btn:translate-x-2 transition-transform" />
          </button>
          
          <button
            class="sm:flex-none px-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-5 rounded-[2rem] font-black text-[16px] transition-all flex items-center justify-center group/btn2 active:scale-95"
            @click="navigateTo('/group-buys')"
          >
            Tümünü Keşfet
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { UserGroupIcon, ClockIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useFormat } from '~/composables/useFormat'
import { useTimer } from '~/composables/useTimer'
import type { GroupBuyDTO, ApiResponse, GroupBuyTier } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const activeGroupBuy = ref<GroupBuyDTO | null>(null)
const { formatPrice } = useFormat()
const { days, hours, minutes, seconds, startTimer } = useTimer()

const sortedTiers = computed(() => {
  if (!activeGroupBuy.value?.tiers) return []
  return [...activeGroupBuy.value.tiers].sort((a: GroupBuyTier, b: GroupBuyTier) => a.minQuantity - b.minQuantity)
})

const calculateMaxDiscount = () => {
  if (!activeGroupBuy.value?.tiers) return 0
  const basePrice = activeGroupBuy.value.originalPrice || 0
  if (!basePrice) return 0
  const minPrice = Math.min(...activeGroupBuy.value.tiers.map((t: GroupBuyTier) => t.price))
  return Math.round(((basePrice - minPrice) / basePrice) * 100)
}

const getProgressPercent = () => {
  if (!activeGroupBuy.value) return 0
  const current = activeGroupBuy.value.currentQuantity || 0
  const target = getNextTierQuantity()
  return Math.min(Math.round((current / target) * 100), 100)
}

const getNextTierQuantity = () => {
  if (!activeGroupBuy.value?.tiers) return 100
  const current = activeGroupBuy.value.currentQuantity || 0
  const nextTier = sortedTiers.value.find((t: GroupBuyTier) => t.minQuantity > current)
  return nextTier ? nextTier.minQuantity : Math.max(...sortedTiers.value.map((t: GroupBuyTier) => t.minQuantity))
}

const isTierReached = (minQty: number) => {
  return (activeGroupBuy.value?.currentQuantity || 0) >= minQty
}

const getProductUrl = (product: any) => {
  if (!product) return '/'
  return `/products/${product.slug || product.id}`
}

const fetchActiveGroupBuy = async () => {
  try {
    const { $api } = useApi()
    const data = await $api('/api/group-buy/active') as ApiResponse<GroupBuyDTO>
    if (data.success && data.data) {
      activeGroupBuy.value = data.data
      if (data.data.endDate) {
        startTimer(data.data.endDate)
      }
    }
  } catch (error) {
    console.error('Group Buy error:', error)
  }
}

onMounted(() => {
  fetchActiveGroupBuy()
})
</script>
