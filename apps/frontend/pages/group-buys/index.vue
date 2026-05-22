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
            <ProductImage 
              :src="campaign.Product?.image" 
              :alt="campaign.title || campaign.Product?.name"
              class="relative z-10 w-full h-full"
              image-class="object-contain group-hover:scale-105 transition-transform duration-500"
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
                  <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Satın Alınan</p>
                  <p class="text-xl font-black text-primary-600">
                    {{ campaign.currentQuantity || 0 }}
                    <span class="text-xs text-gray-500">/ {{ campaign.targetQuantity || '?' }} Adet</span>
                  </p>
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

            <!-- Mevcut Fiyat -->
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Şu Anki Fiyat</p>
                <p class="text-3xl font-black text-primary-600">{{ toNum(getActiveTierPrice(campaign)).toFixed(2) }} ₺</p>
              </div>
              <div v-if="toNum(campaign.originalPrice) > getActiveTierPrice(campaign)" class="text-right">
                <p class="text-[10px] font-bold text-gray-400 uppercase">Başlangıç</p>
                <p class="text-sm text-gray-400 line-through">{{ toNum(campaign.originalPrice).toFixed(2) }} ₺</p>
              </div>
            </div>

            <!-- Tiers -->
            <div class="flex flex-wrap gap-2 mb-6">
              <div
                v-for="tier in getSortedTiers(campaign)"
                :key="tier.minQuantity"
                class="flex-1 min-w-[30%] border p-2 rounded-xl text-center transition-all"
                :class="(campaign.currentQuantity || 0) >= Number(tier.minQuantity)
                  ? 'bg-primary-50 border-primary-300 shadow-inner'
                  : 'bg-gray-50 border-gray-100'"
              >
                <p class="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{{ tier.minQuantity }}+ Adet</p>
                <p class="text-sm font-black"
                   :class="(campaign.currentQuantity || 0) >= Number(tier.minQuantity) ? 'text-primary-600' : 'text-gray-900'">
                  {{ toNum(tier.price).toFixed(2) }} ₺
                </p>
              </div>
            </div>

            <!-- Action -->
            <div class="mt-auto space-y-2">
              <button
                :disabled="joining[campaign.id]"
                class="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                @click="joinCampaign(campaign)"
              >
                <ShoppingCartIcon v-if="!joining[campaign.id]" class="h-4 w-4" />
                <span v-if="joining[campaign.id]" class="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                {{ joining[campaign.id] ? 'İşleniyor...' : 'Hemen Katıl' }}
              </button>
              <button
                :disabled="joining[campaign.id]"
                class="w-full py-3 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                @click="addToCart(campaign)"
              >
                Sepete Ekle
              </button>
              <button
                class="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                @click="navigateTo(getProductUrl(campaign.Product))"
              >
                Ürünü İncele <ArrowRightIcon class="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { UserGroupIcon, ClockIcon, ArrowRightIcon, ShoppingCartIcon } from '@heroicons/vue/24/outline'
import { useFormat } from '~/composables/useFormat'
import { useCartStore } from '~/stores/cart'
import type { GroupBuyDTO, ApiResponse } from '@barterborsa/shared-types'

useHead({ title: 'Birlikte Al Kampanyaları | BazarX' })

const { $api } = useApi()
const { $toast } = useNuxtApp()
const authStore = useAuthStore()
const cartStore = useCartStore()

const campaigns = ref<GroupBuyDTO[]>([])
const loading = ref(true)
const joining = ref<Record<string, boolean>>({})
let pollTimer: ReturnType<typeof setInterval> | null = null

// Decimal128 veya düz sayı → number
const toNum = (val: unknown): number => {
  if (val == null) return 0
  if (typeof val === 'number') return isNaN(val) ? 0 : val
  if (typeof val === 'string') return parseFloat(val) || 0
  if (typeof val === 'object' && '$numberDecimal' in (val as object))
    return parseFloat((val as { $numberDecimal: string }).$numberDecimal) || 0
  return 0
}

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getSortedTiers = (campaign: GroupBuyDTO) => {
  if (!campaign?.tiers) return []
  return [...campaign.tiers].sort((a, b) => Number(a.minQuantity) - Number(b.minQuantity))
}

const getNextTierQuantity = (campaign: GroupBuyDTO): number => {
  const current = campaign.currentQuantity || 0
  const sorted = getSortedTiers(campaign)
  const next = sorted.find(t => Number(t.minQuantity) > current)
  return next ? Number(next.minQuantity) : (sorted.length ? Math.max(...sorted.map(t => Number(t.minQuantity))) : 100)
}

const getProgressPercent = (campaign: GroupBuyDTO): number => {
  const current = campaign.currentQuantity || 0
  const target = getNextTierQuantity(campaign)
  return target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
}

const getProductUrl = (product: GroupBuyDTO['Product']) => {
  if (!product) return '/'
  return `/products/${(product as { slug?: string; id?: string }).slug || (product as { id?: string }).id}`
}

const getActiveTierPrice = (campaign: GroupBuyDTO): number => {
  const current = campaign.currentQuantity || 0
  const tiers = getSortedTiers(campaign)
  const active = [...tiers].reverse().find(t => current >= Number(t.minQuantity))
  return active ? toNum(active.price) : toNum(campaign.price ?? campaign.originalPrice)
}

const fetchCampaigns = async (silent = false) => {
  if (!silent) loading.value = true
  try {
    const data = await $api<ApiResponse<GroupBuyDTO[]>>('/api/v1/group-buy/all')
    if (data.success && data.data) campaigns.value = data.data
  } catch { /* ignore */ } finally {
    loading.value = false
  }
}

const joinCampaign = async (campaign: GroupBuyDTO) => {
  if (!authStore.isLoggedIn) return navigateTo('/auth/login')
  if (joining.value[campaign.id]) return
  joining.value[campaign.id] = true
  try {
    const productId = campaign.Product?.id || campaign.id
    await cartStore.addToCart(productId, 1, undefined, campaign.Product, undefined, campaign.id)
    $toast.success('Kampanya ürünü sepete eklendi! Ödemeye yönlendiriliyorsunuz...')
    await navigateTo('/cart')
  } catch (e: unknown) {
    $toast.error((e as { data?: { message?: string } })?.data?.message || 'Ekleme başarısız')
  } finally {
    joining.value[campaign.id] = false
  }
}

const addToCart = async (campaign: GroupBuyDTO) => {
  if (!authStore.isLoggedIn) return navigateTo('/auth/login')
  if (joining.value[campaign.id]) return
  joining.value[campaign.id] = true
  try {
    const productId = campaign.Product?.id || campaign.id
    const res = await cartStore.addToCart(productId, 1, undefined, campaign.Product, undefined, campaign.id)
    if (res.success) {
      $toast.success('Sepete eklendi!')
    }
  } catch (e: unknown) {
    $toast.error((e as { data?: { message?: string } })?.data?.message || 'Ekleme başarısız')
  } finally {
    joining.value[campaign.id] = false
  }
}

// Sekme tekrar görünür olduğunda hızlı yenile (örn. /cart'tan dönüş)
const onVisibility = () => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
    fetchCampaigns(true)
  }
}

onMounted(() => {
  fetchCampaigns()
  // 30 saniyede bir sessizce yenile — diğer kullanıcıların alımlarını göster
  pollTimer = setInterval(() => fetchCampaigns(true), 30_000)
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', onVisibility)
  }
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (typeof document !== 'undefined') {
    document.removeEventListener('visibilitychange', onVisibility)
  }
})
</script>
