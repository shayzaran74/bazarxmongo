<template>
  <div class="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 pb-20">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-4xl md:text-5xl font-black text-gray-900 uppercase tracking-tighter">
          Birlikte Al <span class="text-primary-600">Kampanyaları</span>
        </h1>
        <p class="mt-2 text-gray-500 font-medium">Toplu alım gücüyle daha fazla indirim kazanın. Katılım arttıkça fiyat düşer!</p>
      </div>

      <!-- İçerik: Sidebar + Grid -->
      <div class="flex gap-6 items-start">

        <!-- Sol Arama Sidebar -->
        <aside v-show="isSidebarOpen" class="w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24 relative">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UserGroupIcon class="w-4 h-4 text-primary-600" />
              <span class="font-black text-sm text-gray-900">Filtrele & Ara</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="sideFilters.search || sideFilters.progress !== 'all' || sideFilters.sort !== 'newest'"
                class="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:opacity-70"
                type="button"
                @click="sideFilters = { search: '', progress: 'all', sort: 'newest' }"
              >
                Temizle
              </button>
              <button @click="isSidebarOpen = false" class="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Filtreleri Gizle">
                <Bars3Icon class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="p-5 space-y-5">
            <!-- Arama -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ürün Ara</label>
              <div class="relative">
                <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="sideFilters.search"
                  type="text"
                  placeholder="Kampanya adı ara..."
                  class="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <!-- İlerleme Durumu -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Doluluk</label>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="p in progressOptions"
                  :key="p.value"
                  type="button"
                  class="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all border"
                  :class="sideFilters.progress === p.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600'"
                  @click="sideFilters.progress = p.value"
                >
                  {{ p.label }}
                </button>
              </div>
            </div>

            <!-- Sıralama -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Sıralama</label>
              <div class="space-y-1.5">
                <label
                  v-for="opt in sortOptions"
                  :key="opt.value"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                  :class="sideFilters.sort === opt.value ? 'bg-primary-50 text-primary-700' : 'hover:bg-gray-50 text-gray-600'"
                >
                  <input type="radio" v-model="sideFilters.sort" :value="opt.value" class="accent-primary-600" />
                  <span class="text-xs font-semibold">{{ opt.label }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p class="text-[11px] text-gray-500">
              <span class="font-black text-primary-600">{{ filteredCampaigns.length }}</span>
              kampanya listelendi
            </p>
          </div>
        </aside>

        <!-- Ana İçerik -->
        <div class="flex-1 min-w-0">
          <div v-if="!isSidebarOpen" class="mb-6">
            <button @click="isSidebarOpen = true" class="p-2 bg-white text-gray-700 border border-gray-200 shadow-sm rounded-lg hover:bg-gray-50 flex items-center gap-2 font-bold transition-colors">
              <Bars3Icon class="w-5 h-5" />
              <span class="text-sm">Kategoriler / Filtreler</span>
            </button>
          </div>
          <div v-if="loading" class="flex justify-center items-center py-20">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
          </div>

          <div v-else-if="filteredCampaigns.length === 0" class="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <UserGroupIcon class="h-14 w-14 text-gray-300 mx-auto mb-4" />
            <h3 class="text-lg font-bold text-gray-900 mb-2">Kampanya bulunamadı</h3>
            <p class="text-gray-500 mb-6">Filtreleri değiştirerek tekrar deneyin.</p>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <div
              v-for="campaign in filteredCampaigns"
              :key="campaign.id"
              class="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group flex flex-col"
            >
              <div class="relative h-56 bg-gray-50 p-6 flex justify-center items-center overflow-hidden">
                <div class="absolute inset-0 bg-primary-900/5 group-hover:bg-primary-900/10 transition-colors"></div>
                <ProductImage
                  :src="campaign.Product?.image"
                  :alt="campaign.title || campaign.Product?.name"
                  class="relative z-10 w-full h-full"
                  image-class="object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div class="absolute top-4 left-4 z-20">
                  <span class="bg-red-500 text-white text-xs font-black uppercase px-3 py-1.5 rounded-lg shadow-md">Günün Fırsatı</span>
                </div>
              </div>

              <div class="p-5 flex-1 flex flex-col">
                <div class="flex items-center gap-2 mb-2">
                  <ClockIcon class="h-4 w-4 text-primary-500" />
                  <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Son Gün: {{ formatDate(campaign.endDate) }}</span>
                </div>
                <h2 class="text-xl font-black text-gray-900 leading-tight mb-1 uppercase">{{ campaign.title || campaign.Product?.name }}</h2>
                <p class="text-sm font-medium text-gray-500 mb-5 line-clamp-2">{{ campaign.Product?.name }}</p>

                <div class="mb-5 bg-gray-50 p-4 rounded-2xl">
                  <div class="flex justify-between items-end mb-2">
                    <div>
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Satın Alınan</p>
                      <p class="text-lg font-black text-primary-600">
                        {{ campaign.currentQuantity || 0 }}
                        <span class="text-xs text-gray-500">/ {{ campaign.targetQuantity || '?' }} Adet</span>
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Sıradaki Hedef</p>
                      <p class="text-sm font-bold text-gray-700">{{ getNextTierQuantity(campaign) }} Adet</p>
                    </div>
                  </div>
                  <div class="w-full bg-gray-200 rounded-full h-1.5">
                    <div class="bg-primary-500 h-1.5 rounded-full" :style="{ width: getProgressPercent(campaign) + '%' }"></div>
                  </div>
                </div>

                <div class="flex items-center justify-between mb-4">
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Şu Anki Fiyat</p>
                    <p class="text-2xl font-black text-primary-600">{{ toNum(getActiveTierPrice(campaign)).toFixed(2) }} ₺</p>
                  </div>
                  <div v-if="toNum(campaign.originalPrice) > getActiveTierPrice(campaign)" class="text-right">
                    <p class="text-[10px] font-bold text-gray-400 uppercase">Başlangıç</p>
                    <p class="text-sm text-gray-400 line-through">{{ toNum(campaign.originalPrice).toFixed(2) }} ₺</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-2 mb-5">
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

                <div class="mt-auto space-y-2">
                  <button
                    :disabled="joining[campaign.id]"
                    class="w-full py-3.5 bg-primary-600 hover:bg-primary-700 disabled:opacity-60 text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-md hover:shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
                    @click="joinCampaign(campaign)"
                  >
                    <ShoppingCartIcon v-if="!joining[campaign.id]" class="h-4 w-4" />
                    <span v-if="joining[campaign.id]" class="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {{ joining[campaign.id] ? 'İşleniyor...' : 'Hemen Katıl' }}
                  </button>
                  <button
                    :disabled="joining[campaign.id]"
                    class="w-full py-2.5 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    @click="addToCart(campaign)"
                  >
                    Sepete Ekle
                  </button>
                  <button
                    class="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { UserGroupIcon, ClockIcon, ArrowRightIcon, ShoppingCartIcon, MagnifyingGlassIcon, Bars3Icon } from '@heroicons/vue/24/outline'
import { useCartStore } from '~/stores/cart'
import type { GroupBuyDTO, ApiResponse } from '@barterborsa/shared-types'

const isSidebarOpen = ref(true)

definePageMeta({ layout: 'default', hideSideAds: true })
useHead({ title: 'Birlikte Al Kampanyaları | BazarX' })

const { $api } = useApi()
const { $toast } = useNuxtApp()
const authStore = useAuthStore()
const cartStore = useCartStore()

const campaigns = ref<GroupBuyDTO[]>([])
const loading = ref(true)
const joining = ref<Record<string, boolean>>({})
let pollTimer: ReturnType<typeof setInterval> | null = null

const sideFilters = ref({ search: '', progress: 'all', sort: 'newest' })

const progressOptions = [
  { value: 'all', label: 'Tümü' },
  { value: 'low', label: '%0–50 Dolu' },
  { value: 'high', label: '%50+ Dolu' },
  { value: 'full', label: 'Neredeyse Doldu' },
]

const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Artan' },
  { value: 'price_desc', label: 'Fiyat: Azalan' },
  { value: 'progress', label: 'En Çok Katılım' },
]

const filteredCampaigns = computed(() => {
  let result = [...campaigns.value]
  if (sideFilters.value.search) {
    const q = sideFilters.value.search.toLowerCase()
    result = result.filter(c => (c.title || '').toLowerCase().includes(q) || (c.Product?.name || '').toLowerCase().includes(q))
  }
  if (sideFilters.value.progress !== 'all') {
    result = result.filter(c => {
      const pct = getProgressPercent(c)
      if (sideFilters.value.progress === 'low') return pct < 50
      if (sideFilters.value.progress === 'high') return pct >= 50 && pct < 90
      if (sideFilters.value.progress === 'full') return pct >= 90
      return true
    })
  }
  if (sideFilters.value.sort === 'price_asc') result.sort((a, b) => toNum(a.price) - toNum(b.price))
  else if (sideFilters.value.sort === 'price_desc') result.sort((a, b) => toNum(b.price) - toNum(a.price))
  else if (sideFilters.value.sort === 'progress') result.sort((a, b) => getProgressPercent(b) - getProgressPercent(a))
  return result
})

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
    $toast.success('Kampanya ürünü sepete eklendi!')
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
    await cartStore.addToCart(productId, 1, undefined, campaign.Product, undefined, campaign.id)
    $toast.success('Sepete eklendi!')
  } catch (e: unknown) {
    $toast.error((e as { data?: { message?: string } })?.data?.message || 'Ekleme başarısız')
  } finally {
    joining.value[campaign.id] = false
  }
}

const onVisibility = () => {
  if (typeof document !== 'undefined' && document.visibilityState === 'visible') fetchCampaigns(true)
}

onMounted(() => {
  fetchCampaigns()
  pollTimer = setInterval(() => fetchCampaigns(true), 30_000)
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisibility)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
  if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisibility)
})
</script>
