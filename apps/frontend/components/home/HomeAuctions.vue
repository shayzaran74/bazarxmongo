<template>
  <div
    v-if="show === 'true'"
    class="w-full bg-slate-950 py-10 md:py-16 relative overflow-hidden mb-8 md:mb-12"
  >
    <!-- High-tech Grid Background -->
    <div class="absolute inset-0 opacity-10 pointer-events-none">
      <div
        class="absolute inset-0 bg-[url('/grid-white.svg')] bg-[length:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      />
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div class="flex items-center gap-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-red-600 to-rose-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-900/40 rotate-12 transition-transform"
          >
            <BoltIcon class="h-10 w-10 text-white animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <GhostBadge variant="rose" glow>
                <template #icon>
                  <span class="w-2 h-2 bg-rose-500 rounded-full animate-ping mr-2" />
                </template>
                {{ $t('auctionsHome.badge') }}
              </GhostBadge>
            </div>
            <h2 class="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
              {{
                $t('auctionsHome.title') }} <span class="text-red-500">{{ $t('auctionsHome.subtitle') }}</span>
            </h2>
            <p class="text-slate-400 text-lg font-medium mt-1 italic opacity-80">
              {{ $t('auctionsHome.description') }}
            </p>
          </div>
        </div>

        <NuxtLink
          to="/auctions"
          class="flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all backdrop-blur-xl group/link"
        >
          {{ $t('auctionsHome.seeAll') }}
          <ArrowRightIcon class="h-5 w-5 group-hover/link:translate-x-3 transition-transform duration-500" />
        </NuxtLink>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="i in 3"
          :key="'auction-loading-' + i"
          class="bg-white/5 backdrop-blur-xl animate-pulse rounded-[2.5rem] h-96 border border-white/10"
        />
      </div>

      <div
        v-else-if="auctions.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in"
      >
        <div
          v-for="auction in auctions"
          :key="auction.id"
          class="group bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden hover:border-red-500/50 hover:bg-white/10 transition-all duration-500 flex flex-col h-full active:scale-[0.98]"
          @click="navigateTo(`/auctions/${auction.id}`)"
        >
          <!-- Image Area with Glass Effect -->
          <div class="relative h-64 overflow-hidden">
            <ProductImage
              :src="auction.Product?.image"
              :alt="auction.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

            <!-- Floating Badges -->
            <div class="absolute top-6 left-6 flex flex-col gap-2">
              <GhostBadge variant="rose" glow custom-class="!bg-rose-600 !text-white !border-rose-500">
                <template #icon>
                  <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-2" />
                </template>
                {{ $t('auctionsHome.live') }}
              </GhostBadge>
            </div>

            <div class="absolute bottom-6 left-6 right-6">
              <div class="flex items-center gap-3 bg-red-600/20 backdrop-blur-md border border-red-500/30 px-4 py-2 rounded-2xl">
                <ClockIcon class="h-5 w-5 text-red-400" />
                <span class="text-red-100 font-black text-sm uppercase tracking-widest">{{ formatTimeRemaining(auction.endDate, t) }}</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-8 flex flex-col flex-grow">
            <h3 class="text-xl font-black text-white mb-4 line-clamp-2 uppercase italic tracking-tight leading-tight">
              {{ auction.title }}
            </h3>

            <div class="mt-auto grid grid-cols-2 gap-4">
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{
                  $t('auctionsHome.currentBid') }}</span>
                <span class="text-xl font-black text-primary-400">{{ formatPrice(auction.currentBid ||
                  auction.startBid) }}</span>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{
                  $t('auctionsHome.totalBids') }}</span>
                <span class="text-xl font-black text-white">{{ auction._count?.bids || 0 }}</span>
              </div>
            </div>

            <button
              class="w-full mt-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white font-black rounded-2xl uppercase tracking-widest text-xs hover:from-red-500 hover:to-rose-600 transition-all shadow-xl shadow-red-900/20"
            >
              {{ $t('auctionsHome.placeBid') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n, useApi, navigateTo } from '#imports'
import { useFormat } from '~/composables/useFormat'
import BoltIcon from '@heroicons/vue/24/outline/BoltIcon'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
import ClockIcon from '@heroicons/vue/24/outline/ClockIcon'
import type { HomeAuction, ApiResponse } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const auctions = ref<HomeAuction[]>([])
const loading = ref(false)
const { t } = useI18n()
const { formatPrice, formatTimeRemaining } = useFormat()

const fetchAuctions = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/auctions', {
      query: { limit: 6, status: 'Active' }
    }) as ApiResponse<HomeAuction[]>
    if (data.success && data.data) {
      auctions.value = data.data
    }
  } catch (error) {
    console.error('Fetch auctions error:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAuctions()
})
</script>
