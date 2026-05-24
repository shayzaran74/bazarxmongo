<template>
  <div
    v-if="show === 'true'"
    v-motion
    :initial="{ opacity: 0, y: 32, filter: 'blur(14px)' }"
    :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 750, ease: [0.25, 0.46, 0.45, 0.94] } }"
    class="mx-4 md:mx-6 xl:mx-auto max-w-7xl rounded-[1.5rem] md:rounded-[2rem] bg-neutral-950 py-6 md:py-10 relative overflow-hidden mb-6 md:mb-10 shadow-xl border border-white/5"
  >

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col md:flex-row items-center justify-between mb-12 gap-8">
        <div class="flex items-center gap-6">
          <div
            class="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary-900/40 rotate-12 transition-transform"
          >
            <BoltIcon class="h-10 w-10 text-white animate-pulse" />
          </div>
          <div>
            <div class="flex items-center gap-2 mb-1">
              <SharedGhostBadge variant="primary" glow>
                <template #icon>
                  <span class="w-2 h-2 bg-primary-500 rounded-full animate-ping mr-2" />
                </template>
                {{ $t('auctionsHome.badge') }}
              </SharedGhostBadge>
            </div>
            <h2 class="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
              {{
                $t('home.title') }} <span class="text-primary-400">{{ $t('auctionsHome.subtitle') }}</span>
            </h2>
            <p class="text-slate-400 text-base font-medium mt-1 italic opacity-80">
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
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 3"
          :key="'auction-loading-' + i"
          class="bg-white/5 backdrop-blur-xl animate-pulse rounded-[2rem] h-72 border border-white/10"
        />
      </div>

      <div
        v-else-if="auctions.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
      >
        <div
          v-for="auction in auctions"
          :key="auction.id"
          class="group bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden hover:border-primary-500/50 hover:bg-white/10 transition-all duration-500 flex flex-col h-full active:scale-[0.98]"
          @click="navigateTo(`/auctions/${auction.id}`)"
        >
          <!-- Image Area with Glass Effect -->
          <div class="relative h-48 overflow-hidden">
            <ProductImage
              :src="auction.Product?.image"
              :alt="auction.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />

            <!-- Floating Badges -->
            <div class="absolute top-6 left-6 flex flex-col gap-2">
              <SharedGhostBadge variant="primary" glow custom-class="!bg-primary-600 !text-white !border-primary-500">
                <template #icon>
                  <div class="w-1.5 h-1.5 bg-white rounded-full animate-ping mr-2" />
                </template>
                {{ $t('auctionsHome.live') }}
              </SharedGhostBadge>
            </div>

            <div class="absolute bottom-6 left-6 right-6">
              <div class="flex items-center gap-3 bg-primary-600/20 backdrop-blur-md border border-primary-500/30 px-4 py-2 rounded-2xl">
                <ClockIcon class="h-5 w-5 text-primary-400" />
                <span class="text-primary-100 font-black text-sm uppercase tracking-widest">{{ formatTimeRemaining(auction.endTime, t) }}</span>
              </div>
            </div>
          </div>

          <!-- Content -->
          <div class="p-5 flex flex-col flex-grow">
            <h3 class="text-lg font-black text-white mb-3 line-clamp-2 uppercase italic tracking-tight leading-tight">
              {{ auction.title || auction.listing?.title || auction.listing?.catalogProduct?.name || 'Açık Artırma' }}
            </h3>

            <div class="mt-auto grid grid-cols-2 gap-4">
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{
                  $t('auctionsHome.currentBid') || 'Güncel Teklif' }}</span>
                <span class="text-xl font-black text-primary-400">{{ formatPrice(auction.currentPrice ?? auction.startingPrice ?? 0) }}</span>
              </div>
              <div class="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{
                  $t('auctionsHome.bidCount') || 'Teklif Sayısı' }}</span>
                <span class="text-xl font-black text-white">{{ auction._count?.bids || 0 }}</span>
              </div>
            </div>

            <button
              class="w-full mt-4 py-3 bg-gradient-to-r from-primary-600 to-accent-600 text-white font-black rounded-xl uppercase tracking-widest text-[10px] hover:from-primary-500 hover:to-accent-500 transition-all shadow-xl shadow-primary-900/20"
            >
              {{ $t('auctionsHome.placeBid') || 'TEKLİF VER' }}
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
      auctions.value = data.data.map((auction: any) => {
        const media = auction.listing?.catalogProduct?.media || []
        const image = media.find((m: any) => m.type === 'IMAGE')?.url || media[0]?.url || '/placeholder.png'
        return {
          ...auction,
          Product: {
            image
          }
        }
      })
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
