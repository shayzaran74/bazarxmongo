<template>
  <div
    v-if="show !== 'false'"
    v-motion
    :initial="{ opacity: 0, y: 32, filter: 'blur(14px)' }"
    :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 750, ease: [0.25, 0.46, 0.45, 0.94] } }"
    class="w-full bg-md3-primary py-6 md:py-10 relative overflow-hidden mb-6 md:mb-8"
  >
    <!-- Animated Background Decorations -->
    <div class="absolute inset-0 opacity-15 pointer-events-none">
      <div class="absolute -top-20 -right-20 w-[400px] h-[400px] bg-accent-500/15 rounded-full blur-[120px] animate-pulse" />
      <div
        class="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-[120px] animate-pulse delay-700"
      />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row items-center justify-between mb-6 gap-6 text-white">
        <div class="flex items-center gap-4">
          <div
            class="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30 shadow-2xl"
          >
            <span class="text-2xl animate-bounce">⚡</span>
          </div>
          <div class="text-center lg:text-left">
            <h2 class="text-xl md:text-2xl font-black tracking-tight uppercase italic">
              {{
                $t('specialOffers.flashSales')
              }}
            </h2>
            <p class="text-white/80 text-xs md:text-sm font-medium opacity-80">
              {{ $t('specialOffers.flashSubtitle') }}
            </p>
          </div>
        </div>

        <!-- Countdown - Compact -->
        <div class="bg-black/20 backdrop-blur-md rounded-2xl px-6 py-3 border border-white/10 shadow-2xl flex items-center gap-4">
          <span class="text-[9px] font-black uppercase tracking-widest text-white/60">{{
            $t('specialOffers.timeLeft') }}</span>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1">
              <div class="bg-white/10 px-2 py-1 rounded-lg font-black text-lg min-w-[2.5rem] text-center">
                {{ String(hours).padStart(2, '0') }}
              </div>
              <span class="text-[8px] font-bold opacity-60">h</span>
            </div>
            <span class="font-black text-white/30">:</span>
            <div class="flex items-center gap-1">
              <div class="bg-white/10 px-2 py-1 rounded-lg font-black text-lg min-w-[2.5rem] text-center">
                {{ String(minutes).padStart(2, '0') }}
              </div>
              <span class="text-[8px] font-bold opacity-60">m</span>
            </div>
            <span class="font-black text-white/30">:</span>
            <div class="flex items-center gap-1">
              <div class="bg-white/10 px-2 py-1 rounded-lg font-black text-lg min-w-[2.5rem] text-center text-yellow-300">
                {{ String(seconds).padStart(2, '0') }}
              </div>
              <span class="text-[8px] font-bold opacity-60">s</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Density Improved Grid/Scroll -->
      <div
        v-if="flashSaleLoading"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="i in 6"
          :key="'flash-loading-' + i"
          class="aspect-[3/4] bg-white/10 backdrop-blur-md animate-pulse rounded-2xl border border-white/5"
        />
      </div>
      <div
        v-else-if="flashSaleProducts.length > 0"
        class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        <div
          v-for="(product, idx) in flashSaleProducts.slice(0, 6)"
          :key="'flash-' + product.id"
          v-motion
          :initial="{ opacity: 0, y: 24, filter: 'blur(10px)' }"
          :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 600, delay: idx * 70, ease: [0.25, 0.46, 0.45, 0.94] } }"
        >
          <ProductCard
            :product="{ ...product, isFlashSale: true }"
            :badges="getProductBadges({ ...product, isFlashSale: true })"
            @click="navigateTo(getProductUrl(product))"
            @add-to-cart="(p) => cartStore.addToCart(String(p.bestListingId || p.id), 1, undefined, p)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTimer } from '~/composables/useTimer'
import type { Product, ApiResponse } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const { getProductBadges } = useProductBadges()
const cartStore = useCartStore()

const flashSaleProducts = ref<Product[]>([])
const flashSaleLoading = ref(false)

// Use global timer targeting end of day
const endOfDay = new Date()
endOfDay.setHours(23, 59, 59, 999)
const { hours, minutes, seconds } = useTimer(endOfDay)

const fetchFlashSales = async () => {
  flashSaleLoading.value = true
  try {
    const { $api } = useApi()
    const res = await $api<{ success: boolean; data: { items: Product[] } }>('/api/v1/listings/marketplace', {
      query: { isFlashSale: 'true', limit: 6, vendorType: 'COMMERCE' }
    })
    flashSaleProducts.value = res?.data?.items ?? []
  } catch {
    // sessizce geç — bölüm gizlenir
  } finally {
    flashSaleLoading.value = false
  }
}

onMounted(() => {
  fetchFlashSales()
})
</script>
