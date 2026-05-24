<template>
  <div
    v-if="show === 'true'"
    v-motion
    :initial="{ opacity: 0, y: 32, filter: 'blur(14px)' }"
    :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 750, ease: [0.25, 0.46, 0.45, 0.94] } }"
    class="mx-4 md:mx-6 xl:mx-auto max-w-7xl rounded-[1.5rem] md:rounded-[2rem] bg-neutral-800 py-6 md:py-10 relative overflow-hidden mb-6 md:mb-10 shadow-xl border border-white/5"
  >

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col lg:flex-row items-center justify-between mb-12 gap-10">
        <div class="text-center lg:text-left">
          <SharedGhostBadge variant="ghost" glow custom-class="!bg-white/10 !border-white/20 !text-white px-5 py-2 text-xs mb-6 backdrop-blur-xl gap-3">
            <template #icon>
              <TicketIcon class="h-4 w-4" />
            </template>
            {{ $t('lotteriesHome.badge') }}
          </SharedGhostBadge>
          <h2 class="text-3xl md:text-4xl font-black text-white mb-4 tracking-tighter uppercase italic leading-[0.8]">
            {{ $t('lotteriesHome.title') }}
            <span
              class="block text-accent-500 mt-2"
            >{{ $t('lotteriesHome.subtitle') }}</span>
          </h2>
          <p class="text-white/70 text-base md:text-lg max-w-xl mx-auto lg:mx-0 font-medium opacity-80 italic">
            {{ $t('lotteriesHome.description') }}
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-6">
          <NuxtLink
            to="/lotteries"
            class="px-12 py-5 bg-white text-slate-950 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:bg-primary-500 hover:text-white transition-all shadow-[0_20px_60px_rgba(255,255,255,0.15)] flex items-center justify-center group/lot"
          >
            {{ $t('lotteriesHome.joinNow') }}
            <ArrowRightIcon class="h-5 w-5 ml-3 group-hover/lot:translate-x-3 transition-transform" />
          </NuxtLink>
        </div>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="i in 3"
          :key="'lottery-loading-' + i"
          class="aspect-[4/5] bg-white/5 backdrop-blur-md rounded-[2rem] animate-pulse border border-white/10"
        />
      </div>

      <div
        v-else-if="lotteries.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in"
      >
        <SharedGlassCard
          v-for="lottery in lotteries"
          :key="lottery.id"
          variant="watchtower"
          :glow="true"
          custom-class="group flex flex-col h-[20rem] cursor-pointer hover:border-primary-500/50 active:scale-95"
          @click="navigateTo(`/lotteries/${lottery.id}`)"
        >
          <!-- Background Image with Overlay -->
          <div class="absolute inset-0 z-0">
            <ProductImage
              :src="lottery.Product?.image"
              :alt="lottery.title"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div
              class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent group-hover:via-slate-950/40 transition-all duration-700"
            />
          </div>

          <!-- Content Wrapper -->
          <div class="relative z-10 p-5 flex flex-col h-full">
            <div class="flex justify-between items-start mb-6">
              <SharedGhostBadge :variant="getLotteryStatusVariant(lottery.status || 'Active')" glow>
                {{ getLotteryStatusText(lottery.status || 'Active') }}
              </SharedGhostBadge>
              <div class="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center">
                <span class="text-xs font-black text-white leading-none">{{ lottery.totalTickets - (lottery._count?.participants || 0) }}</span>
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{{ $t('lotteriesHome.remaining') || 'KALAN' }}</span>
              </div>
            </div>

            <div class="mt-auto">
              <h3 class="text-lg font-black text-white mb-3 line-clamp-2 uppercase italic leading-tight group-hover:text-primary-400 transition-colors">
                {{ lottery.title }}
              </h3>

              <div class="flex items-center gap-4 py-4 border-y border-white/10 mb-4">
                <div class="flex-grow">
                  <div class="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>{{ lottery._count?.participants || 0 }} {{ $t('lotteriesHome.entries') || 'Katılım' }}</span>
                    <span>{{ lottery.totalTickets }} {{ $t('lotteriesHome.limit') || 'Limit' }}</span>
                  </div>
                  <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-500 to-md3-secondary"
                      :style="{ width: ((lottery._count?.participants || 0) / lottery.totalTickets * 100) + '%' }"
                    />
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{ $t('lotteriesHome.ticketPrice') || 'Bilet Fiyatı' }}</span>
                  <span class="text-2xl font-black text-white">{{ formatPrice(lottery.ticketPrice || 0) }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{ $t('lotteriesHome.drawDate') || 'Çekiliş Tarihi' }}</span>
                  <span class="text-xs font-black text-white/60 uppercase italic">{{ formatDate(lottery.drawDate) }}</span>
                </div>
              </div>
            </div>
          </div>
          </SharedGlassCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n, useApi, navigateTo } from '#imports'
import { useFormat } from '~/composables/useFormat'
import TicketIcon from '@heroicons/vue/24/outline/TicketIcon'
import ArrowRightIcon from '@heroicons/vue/24/outline/ArrowRightIcon'
import type { HomeLottery, ApiResponse } from '@barterborsa/shared-types'

defineProps<{
  show?: string
}>()

const lotteries = ref<HomeLottery[]>([])
const loading = ref(false)
const { t } = useI18n()
const { formatPrice, formatDate } = useFormat()

const fetchLotteries = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/lotteries', {
      query: { limit: 6, status: 'Active' }
    }) as ApiResponse<HomeLottery[]>
    if (data.success && data.data) {
      lotteries.value = data.data.map((lottery: any) => {
        const image = lottery.Product?.image || '/placeholder.png'
        return {
          ...lottery,
          Product: { ...lottery.Product, image },
          title: lottery.title || lottery.Product?.name || 'Çekiliş'
        }
      })
    }
  } catch (error) {
    console.error('Fetch lotteries error:', error)
  } finally {
    loading.value = false
  }
}

const getLotteryStatusVariant = (status: string): 'emerald' | 'blue' | 'rose' | 'ghost' => {
  switch (status) {
    case 'Active': return 'emerald'
    case 'Completed': return 'blue'
    case 'Cancelled': return 'rose'
    default: return 'ghost'
  }
}

const getLotteryStatusText = (status: string) => {
  switch (status) {
    case 'Active': return `🟢 ${t('home.status.active')}`
    case 'Completed': return `✅ ${t('home.status.completed')}`
    case 'Cancelled': return `❌ ${t('home.status.cancelled')}`
    default: return status
  }
}

onMounted(() => {
  fetchLotteries()
})
</script>
