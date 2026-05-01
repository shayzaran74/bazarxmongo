<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Page Header -->
      <div class="mb-12 text-center">
        <h1 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">Birlikte Al <span class="text-primary-600">Kampanyaları</span></h1>
        <p class="mt-4 text-gray-500 font-medium">Toplu alım gücüyle daha fazla indirim kazanın. Katılım arttıkça fiyat düşer!</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!campaigns || campaigns.length === 0" class="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
        <UserGroupIcon class="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 class="text-xl font-bold text-gray-900 mb-2">Şu an aktif kampanya bulunmuyor</h3>
        <p class="text-gray-500 mb-6">Yeni Birlikte Al fırsatları çok yakında burada olacak.</p>
        <button @click="navigateTo('/')" class="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">
          Ana Sayfaya Dön
        </button>
      </div>

      <!-- Campaigns Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          v-for="campaign in campaigns" 
          :key="campaign.id"
          class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
        >
          <!-- Product Image & Badge -->
          <div class="relative h-64 bg-gray-50 p-6 flex justify-center items-center overflow-hidden">
            <div class="absolute inset-0 bg-primary-900/5 group-hover:bg-primary-900/10 transition-colors"></div>
            <img 
              :src="campaign.Product?.image || 'https://placehold.co/600x600?text=PRODUCT'" 
              :alt="campaign.title"
              class="relative z-10 w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
            />
            <div class="absolute top-4 left-4 z-20">
              <span class="bg-red-500 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-md">
                Günün Fırsatı
              </span>
            </div>
          </div>

          <!-- Content -->
          <div class="p-6 flex-1 flex flex-col">
            <div class="flex items-center gap-2 mb-3">
              <ClockIcon class="h-4 w-4 text-primary-500" />
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Son Gün: {{ formatDate(campaign.endDate) }}</span>
            </div>

            <h2 class="text-2xl font-black text-gray-900 leading-tight mb-2 uppercase">{{ campaign.title || campaign.Product?.name }}</h2>
            <p class="text-sm font-medium text-gray-500 mb-6 line-clamp-2">{{ campaign.Product?.name }}</p>

            <!-- Progress -->
            <div class="mb-6 bg-gray-50 p-4 rounded-2xl">
              <div class="flex justify-between items-end mb-2">
                <div>
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mevcut Katılım</p>
                  <p class="text-xl font-black text-primary-600">{{ campaign.currentQuantity || 0 }} <span class="text-xs text-gray-500">Adet</span></p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Sıradaki Hedef</p>
                  <p class="text-sm font-bold text-gray-700">{{ getNextTierQuantity(campaign) }} Adet</p>
                </div>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-primary-500 h-2 rounded-full" :style="{ width: getProgressPercent(campaign) + '%' }"></div>
              </div>
            </div>

            <!-- Tiers -->
            <div class="flex flex-wrap gap-2 mb-8">
              <div 
                v-for="tier in getSortedTiers(campaign)" 
                :key="tier.minQuantity"
                class="flex-1 min-w-[30%] bg-gray-50 border border-gray-100 p-2 rounded-xl text-center"
                :class="{ 'bg-primary-50 border-primary-200 shadow-inner': (campaign.currentQuantity || 0) >= tier.minQuantity }"
              >
                <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{{ tier.minQuantity }}+ Adet</p>
                <p class="text-sm font-black text-gray-900" :class="{ 'text-primary-600': (campaign.currentQuantity || 0) >= tier.minQuantity }">
                  ₺{{ formatPrice(tier.price) }}
                </p>
              </div>
            </div>

            <!-- Action -->
            <div class="mt-auto">
              <button 
                @click="navigateTo(getProductUrl(campaign.Product))"
                class="w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
              >
                Kampanyaya Katıl
                <ArrowRightIcon class="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { UserGroupIcon, ClockIcon, ArrowRightIcon } from '@heroicons/vue/24/outline'
import { useFormat } from '~/composables/useFormat'
import type { GroupBuyDTO, ApiResponse } from '@barterborsa/shared-types'

useHead({
  title: 'Birlikte Al Kampanyaları | BazarX'
})

const campaigns = ref<GroupBuyDTO[]>([])
const loading = ref(true)
const { formatPrice } = useFormat()

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getSortedTiers = (campaign: any) => {
  if (!campaign?.tiers) return []
  return [...campaign.tiers].sort((a: any, b: any) => a.minQuantity - b.minQuantity)
}

const getNextTierQuantity = (campaign: any) => {
  if (!campaign?.tiers) return 100
  const current = campaign.currentQuantity || 0
  const sortedTiers = getSortedTiers(campaign)
  const nextTier = sortedTiers.find((t: any) => t.minQuantity > current)
  return nextTier ? nextTier.minQuantity : Math.max(...sortedTiers.map((t: any) => t.minQuantity))
}

const getProgressPercent = (campaign: any) => {
  const current = campaign.currentQuantity || 0
  const target = getNextTierQuantity(campaign)
  return Math.min(Math.round((current / target) * 100), 100)
}

const getProductUrl = (product: any) => {
  if (!product) return '/'
  return `/products/${product.slug || product.id}`
}

const fetchCampaigns = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const data = await $api('/api/group-buy/all') as ApiResponse<GroupBuyDTO[]>
    if (data.success && data.data) {
      campaigns.value = data.data
    }
  } catch (error) {
    console.error('Failed to fetch group buys', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCampaigns()
})
</script>
