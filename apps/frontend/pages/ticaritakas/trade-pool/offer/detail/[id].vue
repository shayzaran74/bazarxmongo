<template>
  <div class="py-12 max-w-4xl mx-auto px-4 lg:px-0">
    <!-- Yükleme -->
    <div v-if="loading" class="space-y-6 animate-pulse">
      <div class="h-12 w-64 bg-gray-100 rounded-2xl" />
      <div class="h-64 bg-gray-50 rounded-[40px]" />
      <div class="h-48 bg-gray-50 rounded-[40px]" />
    </div>

    <!-- Hata -->
    <div v-else-if="!offer" class="text-center py-32">
      <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Teklif bulunamadı.</p>
      <NuxtLink to="/ticaritakas/inbox" class="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
        ← INBOX'A DÖN
      </NuxtLink>
    </div>

    <!-- Ana İçerik -->
    <div v-else class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Başlık -->
      <div class="flex items-center justify-between">
        <div>
          <button class="text-[10px] font-black text-indigo-600 uppercase tracking-widest flex items-center mb-3 hover:translate-x-1 transition-transform" @click="$router.back()">
            <svg class="h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            GERİ DÖN
          </button>
          <h1 class="text-3xl font-black text-gray-900 uppercase italic tracking-tight leading-none mb-2">
            TEKLİF <span class="text-indigo-600 underline decoration-indigo-200">DETAYI</span>
          </h1>
          <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID: #{{ offer.id.slice(-8).toUpperCase() }}</p>
        </div>
        <span :class="statusClass" class="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm italic">
          {{ displayStatus }}
        </span>
      </div>

      <!-- Teklif Özeti -->
      <div class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
        <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 italic">TEKLİF ÖZET</h2>

        <div class="grid grid-cols-2 gap-8">
          <!-- Teklif Veren Firma -->
          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">TEKLİF EDEN</p>
            <h3 class="text-lg font-black text-gray-900 uppercase italic mb-1">{{ offer.fromCompany?.name }}</h3>
            <div v-if="offer.offeredItems?.length" class="space-y-1 mt-3">
              <div v-for="item in offer.offeredItems" :key="item.id" class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span class="text-[10px] font-bold text-gray-600 italic">{{ item.surplusItemId || 'Ürün' }}</span>
              </div>
            </div>
          </div>

          <!-- Hedef Firma -->
          <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
            <p class="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-3">ALICI TARAF</p>
            <h3 class="text-lg font-black text-gray-900 uppercase italic mb-1">{{ offer.toCompany?.name }}</h3>
            <div v-if="offer.requestedItems?.length" class="space-y-1 mt-3">
              <div v-for="item in offer.requestedItems" :key="item.id" class="flex items-center gap-2">
                <div class="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span class="text-[10px] font-bold text-gray-600 italic">{{ item.surplusItemId || 'Ürün' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Finansal Detay -->
        <div v-if="offer.cashAmount && Number(offer.cashAmount) > 0" class="mt-6 flex items-center gap-4 bg-green-50 rounded-2xl p-5 border border-green-100">
          <svg class="h-5 w-5 text-green-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
          </svg>
          <div>
            <p class="text-[9px] font-black text-green-600 uppercase tracking-widest">NAKİT FARK ({{ offer.cashDirection === 'TO_RECEIVER' ? 'Alıcıya' : 'Teklifçiye' }})</p>
            <p class="text-xl font-black text-green-700 italic">{{ Number(offer.cashAmount).toLocaleString('tr-TR') }} ₺</p>
          </div>
        </div>

        <!-- Not -->
        <div v-if="offer.message" class="mt-6 bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <p class="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2">NOT</p>
          <p class="text-sm text-gray-700 italic">{{ offer.message }}</p>
        </div>

        <!-- Süre -->
        <div class="mt-6 flex items-center gap-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          TARİH: {{ formatDate(offer.createdAt) }}
          <span class="text-gray-200">|</span>
          SON GEÇERLILIK: {{ offer.expiresAt ? formatDate(offer.expiresAt) : '—' }}
        </div>
      </div>

      <!-- Müzakere Zinciri -->
      <div v-if="negotiationChain.length > 1" class="bg-white rounded-[40px] p-10 border border-gray-100 shadow-sm">
        <h2 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 italic">MÜZAKERE GEÇMİŞİ ({{ negotiationChain.length }} ADIM)</h2>
        <div class="space-y-4">
          <div
            v-for="(step, index) in negotiationChain"
            :key="step.id"
            class="flex items-start gap-4"
          >
            <div class="flex flex-col items-center">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0"
                :class="index === negotiationChain.length - 1 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'"
              >{{ index + 1 }}</div>
              <div v-if="index < negotiationChain.length - 1" class="w-px h-6 bg-gray-200 mt-1" />
            </div>
            <div class="flex-1 bg-gray-50 rounded-2xl p-5 border border-gray-100 min-w-0">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[9px] font-black text-indigo-600 uppercase tracking-widest">{{ step.fromCompany?.name }}</span>
                <span :class="getStatusClass(step.status)" class="text-[9px] font-black uppercase tracking-widest">{{ getStatusLabel(step.status) }}</span>
              </div>
              <p v-if="step.message" class="text-[11px] text-gray-600 italic mb-2">{{ step.message }}</p>
              <p class="text-[9px] text-gray-400 font-black uppercase tracking-widest">{{ formatDate(step.createdAt) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Aksiyon Butonları -->
      <div class="bg-gray-50 rounded-[40px] p-8 border border-gray-100">
        <!-- PENDING durumda, alıcı taraftaysak: Kabul / Reddet / Karşı Teklif -->
        <template v-if="canActOnOffer">
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              class="flex-1 py-5 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100"
              @click="handleAccept"
            >✓ TEKLİFİ KABUL ET</button>
            <NuxtLink
              :to="`/ticaritakas/trade-pool/offer/counter/${offer.id}`"
              class="flex-1 py-5 bg-amber-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 text-center"
            >⇄ KARŞI TEKLİF VER</NuxtLink>
            <button
              class="flex-1 py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100"
              @click="handleReject"
            >✕ REDDET</button>
          </div>
        </template>

        <!-- ACCEPTED durumda: Swap paneline git -->
        <template v-else-if="normalizedStatus === 'ACCEPTED' && offer.swapSession?.id">
          <NuxtLink
            :to="`/ticaritakas/swap/${offer.swapSession.id}`"
            class="w-full flex items-center justify-center gap-3 py-5 bg-gray-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl"
          >
            SWAP PANELİNE GİT →
          </NuxtLink>
        </template>

        <!-- Diğer durumlar -->
        <template v-else>
          <NuxtLink
            to="/ticaritakas/inbox"
            class="w-full flex items-center justify-center py-5 bg-gray-100 text-gray-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
          >
            ← INBOX'A DÖN
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

interface OfferItemRow {
  id: string
  surplusItemId?: string
  listingId?: string
  estimatedValue?: number
}

interface CompanyRef {
  id: string
  name: string
}

interface SwapSessionRef {
  id: string
  status: string
}

interface TradeOfferDetail {
  id: string
  status: string
  fromCompanyId: string
  toCompanyId: string
  fromCompany?: CompanyRef
  toCompany?: CompanyRef
  cashAmount?: string
  cashDirection?: string
  message?: string
  createdAt: string
  expiresAt?: string
  parentOfferId?: string
  offeredItems?: OfferItemRow[]
  requestedItems?: OfferItemRow[]
  swapSession?: SwapSessionRef | null
}

const route = useRoute()
const { $api } = useApi()
const config = useRuntimeConfig()
const nuxt = useNuxtApp()
const authStore = useAuthStore()
const { fetchOffers } = useSurplus()

const offer = ref<TradeOfferDetail | null>(null)
const negotiationChain = ref<TradeOfferDetail[]>([])
const loading = ref(true)

const normalizedStatus = computed((): string => (offer.value?.status ?? '').toUpperCase())

const statusClass = computed((): string => {
  switch (normalizedStatus.value) {
    case 'ACCEPTED':        return 'bg-green-50 text-green-700 border-green-100'
    case 'COUNTER_OFFERED': return 'bg-amber-50 text-amber-700 border-amber-100'
    case 'REJECTED':        return 'bg-red-50 text-red-700 border-red-100'
    case 'COMPLETED':       return 'bg-green-50 text-green-700 border-green-100'
    default:                return 'bg-gray-50 text-gray-600 border-gray-100'
  }
})

const displayStatus = computed((): string => {
  switch (normalizedStatus.value) {
    case 'PENDING':         return 'BEKLEMEDE'
    case 'COUNTER_OFFERED': return 'KARŞI TEKLİF VAR'
    case 'ACCEPTED':        return 'KABUL EDİLDİ'
    case 'COMPLETED':       return 'TAMAMLANDI'
    case 'REJECTED':        return 'REDDEDİLDİ'
    case 'CANCELLED':       return 'İPTAL'
    case 'EXPIRED':         return 'SÜRESİ DOLDU'
    default:                return normalizedStatus.value
  }
})

// Sadece alıcı taraf PENDING teklifte aksiyon yapabilir
const canActOnOffer = computed((): boolean => {
  if (normalizedStatus.value !== 'PENDING') return false
  const myCompanyId = (authStore.user as { vendor?: { company?: { id?: string } } })?.vendor?.company?.id
  if (!myCompanyId) return false
  // Sadece alıcı taraf (toCompany) Kabul/Reddet yapabilir
  return offer.value?.toCompany?.id === myCompanyId
})

// Teklif verilerini yükle
const loadOffer = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data: TradeOfferDetail }>(
      `/api/v1/offers/${route.params.id}`
    )
    offer.value = (res as unknown as { success: boolean; data: TradeOfferDetail }).data ?? null
    if (offer.value) await loadChain(offer.value as TradeOfferDetail)
  } catch { /* hata filtresi işler */ } finally {
    loading.value = false
  }
}

// Müzakere zincirini oluştur (parentOfferId zinciri)
const loadChain = async (current: TradeOfferDetail): Promise<void> => {
  const chain: TradeOfferDetail[] = [current]
  let parentId = (current as { parentOfferId?: string }).parentOfferId

  while (parentId) {
    try {
      const res = await $api<{ success: boolean; data: TradeOfferDetail }>(
        `/api/v1/offers/${parentId}`
      )
      if ((res as unknown as { data?: TradeOfferDetail }).data) {
        const d = (res as unknown as { data: TradeOfferDetail }).data
        chain.unshift(d)
        parentId = (d as { parentOfferId?: string }).parentOfferId
      } else break
    } catch { break }
  }

  negotiationChain.value = chain
}

const handleAccept = async (): Promise<void> => {
  if (!offer.value) return
  try {
    const res = await $api<{ success: boolean; sessionId?: string }>(
      `/api/v1/offers/${offer.value.id}/accept`,
      { method: 'POST' }
    ) as { success: boolean; sessionId?: string }
    if (res.success && res.sessionId) {
      nuxt.$toast?.success('Teklif kabul edildi!')
      await navigateTo(`/ticaritakas/swap/${res.sessionId}`)
    }
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem başarısız.'
    nuxt.$toast?.error(msg)
  }
}

const handleReject = async (): Promise<void> => {
  if (!offer.value) return
  try {
    await $api(`/api/v1/offers/${offer.value.id}/status`, {
      method: 'PATCH',
      body: { status: 'rejected' },
    })
    nuxt.$toast?.success('Teklif reddedildi.')
    await fetchOffers()
    await navigateTo('/ticaritakas/inbox')
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem başarısız.'
    nuxt.$toast?.error(msg)
  }
}

const getStatusClass = (status: string): string => {
  const s = status?.toUpperCase()
  if (s === 'ACCEPTED' || s === 'COMPLETED') return 'text-green-600'
  if (s === 'REJECTED' || s === 'CANCELLED') return 'text-red-500'
  if (s === 'COUNTER_OFFERED') return 'text-amber-600'
  return 'text-gray-400'
}

const getStatusLabel = (status: string): string => {
  switch (status?.toUpperCase()) {
    case 'PENDING':         return 'BEKLENİYOR'
    case 'COUNTER_OFFERED': return 'KARŞI TEKLİF'
    case 'ACCEPTED':        return 'KABUL'
    case 'REJECTED':        return 'RED'
    default:                return status?.toUpperCase() ?? '—'
  }
}

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })

onMounted(loadOffer)
</script>
