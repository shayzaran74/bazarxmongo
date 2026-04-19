<template>
  <div class="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 font-sans">
    <!-- Loading State -->
    <div
      v-if="loading"
      class="max-w-7xl mx-auto"
    >
      <div class="animate-pulse space-y-12">
        <div class="h-6 w-48 bg-gray-200 rounded-full" />
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div class="lg:col-span-7 space-y-8">
            <div class="aspect-square bg-white rounded-[3rem] border border-gray-100 shadow-sm" />
            <div class="h-64 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm" />
          </div>
          <div class="lg:col-span-5 space-y-8">
            <div class="h-12 w-3/4 bg-gray-200 rounded-2xl" />
            <div class="h-40 bg-gray-900/5 rounded-3xl" />
            <div class="h-80 bg-gray-900/5 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="item"
      class="max-w-7xl mx-auto space-y-12"
    >
      <!-- Breadcrumb & Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div class="space-y-4">
          <nav class="flex items-center space-x-3 text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">
            <NuxtLink
              to="/surplus"
              class="hover:text-primary-600 transition-colors"
            >
              TAKASLAR
            </NuxtLink>
            <span class="text-gray-300">/</span>
            <span class="text-gray-500">{{ item.category }}</span>
            <span class="text-gray-300">/</span>
            <span class="text-primary-600 italic">{{ item.title }}</span>
          </nav>
          <div class="flex flex-wrap items-center gap-3">
            <h1
              class="text-4xl md:text-6xl font-black text-gray-900 tracking-tightest leading-[0.9] uppercase italic drop-shadow-sm"
            >
              {{ item.title }}
            </h1>
            <div class="flex items-center gap-2">
              <span
                class="px-4 py-1.5 rounded-full bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-600/20"
              >
                {{ item.category }}
              </span>
              <span
                class="px-4 py-1.5 rounded-full bg-white border border-gray-200 text-gray-400 text-[10px] font-black uppercase tracking-widest shadow-sm"
              >
                <MapPinIcon class="h-3.5 w-3.5 inline-block mr-1 text-red-500" />
                {{ item.location || 'GLOBAL' }}
              </span>
            </div>
          </div>
        </div>

        <div
          class="flex items-center space-x-4 p-5 bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.03] group hover:border-primary-200 transition-all cursor-pointer"
        >
          <div
            class="h-16 w-16 rounded-2xl bg-gray-50 flex items-center justify-center p-2.5 border border-black/5 group-hover:bg-primary-50 transition-colors"
          >
            <img
              v-if="item.company.logoUrl"
              :src="item.company.logoUrl"
              class="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all"
            >
            <span
              v-else
              class="text-2xl font-black text-gray-400 group-hover:text-primary-600"
            >{{
              item.company.name.charAt(0) }}</span>
          </div>
          <div>
            <p class="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1 italic">
              PUBLISHED BY
            </p>
            <p
              class="text-lg font-black text-gray-900 group-hover:text-primary-600 transition-colors uppercase leading-none"
            >
              {{ item.company.name }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <!-- Main Content -->
        <div class="lg:col-span-7 space-y-12">
          <!-- Gallery -->
          <div class="space-y-6">
            <div
              class="aspect-square rounded-[4rem] overflow-hidden bg-white border border-gray-100 shadow-2xl relative group"
            >
              <div class="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
              <img
                :src="activeImage"
                class="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                :alt="item.title"
              >
            </div>
            <div
              v-if="item.images && item.images.length > 1"
              class="flex gap-5 overflow-x-auto pb-4 scrollbar-hide px-2"
            >
              <button
                v-for="(img, idx) in item.images"
                :key="idx"
                class="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 border-2 transition-all p-1 group relative ring-offset-4"
                :class="activeImageIdx === idx ? 'border-primary-600 ring-2 ring-primary-100 scale-110 shadow-xl' : 'border-transparent bg-white shadow-sm hover:scale-105 opacity-60'"
                @click="activeImageIdx = idx"
              >
                <img
                  :src="resolveImageUrl(typeof img === 'string' ? img : img.url)"
                  class="w-full h-full object-cover rounded-2xl"
                >
              </button>
            </div>
          </div>

          <!-- Description Section -->
          <div class="space-y-8">
            <div class="relative">
              <div
                class="absolute -left-6 top-0 bottom-0 w-1.5 bg-primary-600 rounded-full shadow-lg shadow-primary-600/20"
              />
              <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic">
                Orijinal Açıklama
              </h2>
            </div>
            <div class="prose prose-lg max-w-none">
              <div
                class="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-2xl shadow-black/[0.02] relative overflow-hidden"
              >
                <div class="absolute top-0 right-0 p-8 opacity-[0.03]">
                  <SparklesIcon class="h-32 w-32" />
                </div>
                <p class="text-gray-600 font-medium leading-relaxed italic text-lg whitespace-pre-wrap relative z-10">
                  {{ item.description || 'Ayrıntılı açıklama eklenmedi.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Technical Specs -->
          <div
            v-if="item.materialType || (item.technicalSpecs && Object.keys(item.technicalSpecs).length > 0)"
            class="space-y-8"
          >
            <div class="flex items-center space-x-4">
              <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest italic">
                Teknik Detaylar
              </h2>
              <div class="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div
                v-if="item.materialType"
                class="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-xl transition-all"
              >
                <div class="flex items-center space-x-3 mb-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-600 group-hover:text-white transition-colors"
                  >
                    <SparklesIcon class="h-5 w-5" />
                  </div>
                  <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    MALZEME TİPİ
                  </p>
                </div>
                <p class="text-lg font-black text-gray-900 uppercase truncate">
                  {{ item.materialType }}
                </p>
              </div>
              <template v-if="item.technicalSpecs">
                <div
                  v-for="(val, key) in item.technicalSpecs"
                  :key="key"
                  class="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-primary-200 hover:shadow-xl transition-all"
                >
                  <div class="flex items-center space-x-3 mb-3">
                    <div
                      class="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary-600 group-hover:text-white transition-colors"
                    >
                      <div class="w-2 h-2 rounded-full border-2 border-current" />
                    </div>
                    <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      {{ key }}
                    </p>
                  </div>
                  <p class="text-lg font-black text-gray-900 uppercase truncate">
                    {{ val }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Sidebar Actions -->
        <div class="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <!-- Pricing Dashboard -->
          <div
            class="bg-gray-900 rounded-[3rem] p-8 text-white shadow-3xl shadow-gray-900/40 relative overflow-hidden ring-1 ring-white/10 group"
          >
            <div
              class="absolute -right-20 -top-20 w-80 h-80 bg-primary-600 rounded-full blur-[120px] opacity-20 transition-opacity duration-1000 group-hover:opacity-30"
            />
            <div
              class="absolute -left-20 -bottom-20 w-60 h-60 bg-indigo-600 rounded-full blur-[100px] opacity-15 transition-opacity duration-1000 group-hover:opacity-25"
            />

            <div class="relative z-10 space-y-8">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                  <div class="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-emerald-400">Canlı Yayında</span>
                </div>
                <span class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Updated {{ new Date(item.createdAt).toLocaleDateString('tr-TR') }}
                </span>
              </div>

              <div class="grid grid-cols-1 xs:grid-cols-2 gap-6 divide-y xs:divide-y-0 xs:divide-x divide-white/10">
                <div class="pb-6 xs:pb-0 space-y-2">
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
                    Birim Fiyat
                  </p>
                  <p class="text-3xl sm:text-4xl font-black text-white tracking-tightest leading-none">
                    {{ item.unitPrice ? formatCurrency(item.unitPrice) : 'Teklif Alın' }}
                  </p>
                  <p class="text-xs font-bold text-emerald-400 uppercase tracking-tight">
                    1 {{ item.unit }}
                  </p>
                </div>
                <div class="pt-6 xs:pt-0 xs:pl-8 space-y-2">
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 italic">
                    Tahmini Toplam
                  </p>
                  <p
                    class="text-3xl sm:text-4xl font-black text-primary-400 tracking-tightest leading-none break-words"
                  >
                    {{ item.unitPrice ? formatCurrency(item.unitPrice * item.quantity) : '—' }}
                  </p>
                  <p class="text-xs font-bold text-primary-500/60 uppercase tracking-tight">
                    {{ item.quantity }} {{
                      item.unit }}
                    Stok
                  </p>
                </div>
              </div>

              <!-- Stats Cards -->
              <div class="grid grid-cols-2 gap-4">
                <div
                  class="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/5 backdrop-blur-xl group/card hover:bg-white/10 transition-colors min-w-0"
                >
                  <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Available
                  </p>
                  <div class="flex items-baseline space-x-1">
                    <span class="text-2xl sm:text-3xl font-black text-white">{{ availableQuantity }}</span>
                    <span class="text-[10px] text-gray-500 uppercase font-bold">{{ item.unit }}</span>
                  </div>
                </div>
                <div
                  class="bg-white/5 rounded-2xl p-4 sm:p-5 border border-white/5 backdrop-blur-xl group/card hover:bg-white/10 transition-colors min-w-0"
                >
                  <p class="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2">
                    Reserved
                  </p>
                  <div class="flex items-baseline space-x-1">
                    <span class="text-2xl sm:text-3xl font-black text-amber-400">{{ item.blockedQuantity || 0 }}</span>
                    <span class="text-[10px] text-gray-500 uppercase font-bold">{{ item.unit }}</span>
                  </div>
                </div>
              </div>

              <!-- Progress -->
              <div class="space-y-3">
                <div class="flex justify-between items-end">
                  <p class="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    Stock Health
                  </p>
                  <p class="text-lg font-black text-white leading-none">
                    %{{ availablePercent }}
                  </p>
                </div>
                <div class="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                  <div
                    class="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                    :class="availablePercent > 50 ? 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-emerald-500/20' : availablePercent > 20 ? 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-amber-500/20' : 'bg-gradient-to-r from-red-600 to-rose-400 shadow-red-500/20'"
                    :style="{ width: availablePercent + '%' }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Trading Actions -->
          <div class="bg-white rounded-[3rem] p-8 border border-gray-100 shadow-2xl shadow-black/[0.04] space-y-6">
            <div class="space-y-2">
              <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest italic flex items-center">
                <ArrowsRightLeftIcon class="h-8 w-8 mr-3 text-primary-600" />
                Takas İşlemleri
              </h3>
              <p class="text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                HIZLI VE GÜVENLİ TİCARİ TAKAS
                SÜRECİ
              </p>
            </div>

            <div class="space-y-4">
              <button
                class="group w-full bg-primary-600 hover:bg-primary-700 text-white rounded-3xl p-6 flex flex-col items-center justify-center transition-all shadow-2xl shadow-primary-600/20 relative overflow-hidden active:scale-95"
                @click="showTradeModal = true"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                />
                <span class="text-xs font-black uppercase tracking-[0.3em] mb-1 opacity-70">Make an Offer</span>
                <span class="text-lg font-black uppercase tracking-widest">TAKAS TEKLİFİ GÖNDER</span>
              </button>

              <button
                :disabled="processingBarter"
                class="group w-full bg-gray-900 hover:bg-black text-white rounded-3xl p-6 flex flex-col items-center justify-center transition-all shadow-2xl shadow-gray-900/10 relative overflow-hidden active:scale-95"
                @click="buyWithBarter"
              >
                <span class="text-xs font-black uppercase tracking-[0.3em] mb-1 opacity-40">Direct Purchase</span>
                <div class="flex items-center space-x-3">
                  <BanknotesIcon class="h-6 w-6 text-primary-500" />
                  <span class="text-lg font-black uppercase tracking-widest">BARTER İLE SATIN AL</span>
                </div>
              </button>
            </div>

            <!-- Trade Info -->
            <div class="grid grid-cols-1 gap-4 pt-6 border-t border-gray-100">
              <div
                v-if="item.wantedCategories"
                class="space-y-3"
              >
                <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
                  İlgilenilen Kategoriler
                </p>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="cat in item.wantedCategories"
                    :key="cat"
                    class="px-3 py-1.5 rounded-xl bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-600 uppercase tracking-wider hover:bg-primary-50 hover:border-primary-100 transition-colors"
                  >
                    {{ cat }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Process Map -->
          <div
            class="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[3rem] p-10 border border-indigo-100 relative overflow-hidden"
          >
            <div class="absolute -right-8 -bottom-8 opacity-10 rotate-12">
              <ArrowPathIcon class="h-40 w-40 text-indigo-900" />
            </div>
            <h4 class="text-xl font-black text-indigo-900 mb-8 uppercase tracking-tighter italic">
              NASIL ÇALIŞIR?
            </h4>
            <div class="space-y-6 relative">
              <div
                v-for="(step, idx) in steps"
                :key="idx"
                class="flex gap-5 group"
              >
                <div class="flex flex-col items-center pt-1">
                  <div class="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-indigo-200" />
                  <div
                    v-if="idx < steps.length - 1"
                    class="w-0.5 h-full bg-indigo-200 my-1"
                  />
                </div>
                <div>
                  <p class="text-[11px] font-black text-indigo-900/40 uppercase tracking-[0.2em] mb-1">
                    ADIM {{ idx + 1
                    }}
                  </p>
                  <p
                    class="text-xs font-black text-indigo-900 uppercase leading-snug tracking-tight group-hover:translate-x-1 transition-transform"
                  >
                    {{ step }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggested Chains (Full Width) -->
      <div
        v-if="chains && chains.length > 0"
        class="space-y-10 pt-12 border-t border-gray-100"
      >
        <div class="flex items-center justify-between">
          <div class="space-y-2">
            <h2 class="text-4xl font-black text-gray-900 uppercase tracking-tightest italic">
              ZİNCİRLEME TAKAS ÖNERİLERİ
            </h2>
            <p class="text-gray-400 text-xs font-bold uppercase tracking-widest">
              AI DESTEKLİ OPTİMİZE EDİLMİŞ TAKAS
              YOLLARI
            </p>
          </div>
          <ArrowPathIcon class="h-12 w-12 text-gray-100 rotate-12" />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          <div
            v-for="(chain, idx) in chains"
            :key="idx"
            class="bg-white rounded-[3.5rem] p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden"
          >
            <div
              class="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
            />

            <p class="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mb-6 italic">
              {{ chain.type }}
            </p>

            <div class="flex flex-wrap items-center gap-4 mb-8">
              <div
                v-for="(cItem, cIdx) in chain.items"
                :key="cIdx"
                class="flex items-center gap-4"
              >
                <div
                  class="w-16 h-16 rounded-[1.5rem] bg-gray-50 flex items-center justify-center p-2 border border-black/5 hover:scale-110 transition-transform cursor-help"
                  :title="cItem.title"
                >
                  <img
                    v-if="cItem.images && cItem.images[0]"
                    :src="resolveImageUrl(typeof cItem.images[0] === 'string' ? cItem.images[0] : cItem.images[0].url)"
                    class="w-full h-full object-cover rounded-xl"
                  >
                  <span
                    v-else
                    class="text-lg font-black text-gray-300"
                  >{{ cItem.title.charAt(0) }}</span>
                </div>
                <div
                  v-if="cIdx < chain.items.length - 1"
                  class="text-gray-300"
                >
                  <ChevronRightIcon class="h-6 w-6 stroke-[3]" />
                </div>
              </div>
            </div>

            <button
              class="w-full bg-gray-900 group-hover:bg-primary-600 text-white rounded-2xl py-5 text-xs font-black uppercase tracking-[0.2em] transition-all transform group-hover:-translate-y-1"
              @click="startChainTrade(chain)"
            >
              ZİNCİRİ BAŞLAT
            </button>
          </div>
        </div>
      </div>
    </div>


    <!-- Trade Modal -->
    <TradeOfferModal
      v-if="showTradeModal"
      :item="item"
      @close="showTradeModal = false"
      @success="handleTradeSuccess"
    />
  </div>
</template>

<script setup>
import {
  MapPinIcon, ArrowsRightLeftIcon, SparklesIcon,
  ChevronRightIcon, ArrowPathIcon, BanknotesIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const item = ref(null)
const chains = ref([])
const loading = ref(true)
const activeImageIdx = ref(0)
const showTradeModal = ref(false)
const { resolveImageUrl } = useAppImage()

const activeImage = computed(() => {
  if (!item.value?.images || item.value.images.length === 0) return resolveImageUrl(null, 'product')
  const img = item.value.images[activeImageIdx.value]
  const url = typeof img === 'string' ? img : img.url
  return resolveImageUrl(url)
})

const availableQuantity = computed(() => {
  if (!item.value) return 0
  return item.value.quantity - (item.value.blockedQuantity || 0)
})

const availablePercent = computed(() => {
  if (!item.value || item.value.quantity === 0) return 0
  return Math.round((availableQuantity.value / item.value.quantity) * 100)
})

const steps = [
  'İLANI İNCELEYİN VE TAKAS TEKLİFİ GÖNDERİN.',
  'KARŞI TARAF TEKLİFİNİZİ DEĞERLENDİRİP ONAYLASIN VEYA KARŞI TEKLİF VERSİN.',
  'EŞLEŞME SAĞLANDIĞINDA LOJİSTİK VE TESLİMAT SÜRECİNİ BAŞLATIN.',
  'TAKAS TAMAMLANDIĞINDA PLATFORM ÜZERİNDEN ONAY VERİN.'
]

// Buy with Barter
const processingBarter = ref(false)
const buyWithBarter = async () => {
  const authStore = useAuthStore()
  const toast = useNuxtApp().$toast

  if (!authStore.isLoggedIn) {
    toast.info('Barter ile satın almak için giriş yapmalısınız.')
    return navigateTo('/login')
  }

  const totalCost = (item.value.unitPrice || 0) * item.value.quantity
  if (Number(authStore.barterBalance) < totalCost) {
    toast.error('Yetersiz barter bakiyesi.')
    return
  }

  if (!confirm(`${formatCurrency(totalCost)} puan karşılığında bu ürünü almak istediğinize emin misiniz?`)) {
    return
  }

  try {
    processingBarter.value = true
    const { $api } = useApi()
    const response = await $api('/api/barter/transfer', {
      method: 'POST',
      body: {
        toUserId: item.value.company?.users?.[0]?.userId, // Assuming first user is the owner
        amount: totalCost,
        description: `${item.value.title} Surplus Satın Alımı`
      }
    })

    if (response.success) {
      toast.success('Satın alım başarılı! Barter havuzundan ödeme yapıldı.')
      authStore.fetchUser() // Refresh balance
      navigateTo('/barter')
    }
  } catch (err) {
    console.error('Barter purchase error:', err)
    toast.error(err.data?.error || 'İşlem sırasında bir hata oluştu')
  } finally {
    processingBarter.value = false
  }
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0
  }).format(val)
}

const fetchItem = async () => {
  loading.value = true
  try {
    const { $api } = useApi()
    const response = await $api(`/api/surplus/${route.params.id}`)
    if (response.success) {
      item.value = response.item
      fetchChains()
    }
  } catch (error) {
    console.error('Fetch surplus item error:', error)
  } finally {
    loading.value = false
  }
}

const fetchChains = async () => {
  try {
    const { $api } = useApi()
    const response = await $api(`/api/surplus/${route.params.id}/chains`)
    if (response.success) {
      chains.value = response.chains
    }
  } catch (error) {
    console.error('Fetch chains error:', error)
  }
}

const startChainTrade = async (chain) => {
  try {
    const { $api } = useApi()
    const response = await $api('/api/offers/chain', {
      method: 'POST',
      body: { items: chain.items }
    })
    if (response.success) {
      alert('Zincirleme takas teklifi oluşturuldu! Tüm taraflara bildirim gönderildi.')
      navigateTo('/my/offers')
    }
  } catch (error) {
    console.error('Start chain trade error:', error)
    alert('Teklif oluşturulurken bir hata oluştu.')
  }
}

const handleTradeSuccess = () => {
  showTradeModal.value = false
  // Move to my surplus page
  navigateTo('/my/surplus')
}

onMounted(() => {
  fetchItem()
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
