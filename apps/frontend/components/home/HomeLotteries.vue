<template>
  <div
    v-if="show === 'true'"
    class="w-full bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-900 py-12 md:py-20 relative overflow-hidden mb-10 md:mb-16"
  >
    <div class="absolute inset-0 opacity-20 pointer-events-none">
      <div class="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-30" />
      <div class="absolute -top-48 -left-48 w-96 h-96 bg-primary-500 rounded-full blur-[150px] animate-pulse" />
    </div>

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col lg:flex-row items-center justify-between mb-12 gap-10">
        <div class="text-center lg:text-left">
          <div
            class="inline-flex items-center gap-3 px-5 py-2 bg-white/10 border border-white/20 rounded-full text-white text-xs font-black uppercase tracking-[0.3em] mb-6 backdrop-blur-xl"
          >
            <TicketIcon class="h-4 w-4" />
            {{ $t('lotteriesHome.badge') }}
          </div>
          <h2 class="text-4xl md:text-6xl font-black text-white mb-6 tracking-tighter uppercase italic leading-[0.8]">
            {{ $t('lotteriesHome.title') }}
            <span
              class="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-purple-400 mt-2"
            >{{ $t('lotteriesHome.subtitle') }}</span>
          </h2>
          <p class="text-indigo-200 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-medium opacity-80 italic">
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
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <div
          v-for="i in 3"
          :key="'lottery-loading-' + i"
          class="aspect-[4/5] bg-white/5 backdrop-blur-md rounded-[3rem] animate-pulse border border-white/10"
        />
      </div>

      <div
        v-else-if="lotteries.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in"
      >
        <div
          v-for="lottery in lotteries"
          :key="lottery.id"
          class="group relative bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 overflow-hidden hover:border-primary-500/50 transition-all duration-700 h-[30rem] flex flex-col cursor-pointer active:scale-95"
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
          <div class="relative z-10 p-10 flex flex-col h-full">
            <div class="flex justify-between items-start mb-6">
              <div :class="['px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest', getLotteryStatusBadgeClass(lottery.status || 'Active')]">
                {{ getLotteryStatusText(lottery.status || 'Active') }}
              </div>
              <div class="bg-black/40 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center">
                <span class="text-xs font-black text-white leading-none">{{ lottery.totalTickets - (lottery._count?.participants || 0) }}</span>
                <span class="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{{ $t('lotteriesHome.remaining') }}</span>
              </div>
            </div>

            <div class="mt-auto">
              <h3 class="text-2xl font-black text-white mb-4 line-clamp-2 uppercase italic leading-tight group-hover:text-primary-400 transition-colors">
                {{ lottery.title }}
              </h3>

              <div class="flex items-center gap-4 py-6 border-y border-white/10 mb-6">
                <div class="flex-grow">
                  <div class="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-2">
                    <span>{{ lottery._count?.participants || 0 }} {{ $t('lotteriesHome.entries') }}</span>
                    <span>{{ lottery.totalTickets }} {{ $t('lotteriesHome.limit') }}</span>
                  </div>
                  <div class="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-primary-600 to-indigo-500"
                      :style="{ width: ((lottery._count?.participants || 0) / lottery.totalTickets * 100) + '%' }"
                    />
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{ $t('lotteriesHome.ticketPrice') }}</span>
                  <span class="text-2xl font-black text-white">{{ formatPrice(lottery.ticketPrice) }}</span>
                </div>
                <div class="text-right">
                  <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{{ $t('lotteriesHome.drawDate') }}</span>
                  <span class="text-xs font-black text-indigo-300 uppercase italic">{{ formatDate(lottery.drawDate) }}</span>
                </div>
              </div>
            </div>
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
      lotteries.value = data.data
    }
  } catch (error) {
    console.error('Fetch lotteries error:', error)
  } finally {
    loading.value = false
  }
}

const getLotteryStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-500 text-white'
    case 'Completed': return 'bg-blue-500 text-white'
    case 'Cancelled': return 'bg-red-500 text-white'
    default: return 'bg-gray-500 text-white'
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
