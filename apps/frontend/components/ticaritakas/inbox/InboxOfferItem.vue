<!-- apps/frontend/components/ticaritakas/inbox/InboxOfferItem.vue -->
<template>
  <div class="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-xl transition-all group italic">
    <!-- Sol: firma + ürün bilgisi -->
    <div class="flex items-center gap-6 flex-1 w-full">
      <div class="relative w-24 h-24 shrink-0">
        <img :src="itemImage" class="w-full h-full rounded-[2rem] object-cover bg-gray-50 border border-neutral-100 shadow-inner group-hover:scale-105 transition-transform" :alt="itemTitle">
        <div class="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-sm border border-gray-50">
          {{ isReceived ? '📥' : '📤' }}
        </div>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 italic">
          {{ isReceived ? 'TEKLİF EDEN' : 'ALICI' }}
        </p>
        <h4 class="text-xl font-black text-gray-900 uppercase tracking-tighter truncate italic leading-tight mb-2">
          {{ isReceived ? offer.fromCompany?.name : offer.toCompany?.name }}
        </h4>
        <div class="flex items-center gap-2">
          <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest">ÜRÜN:</span>
          <span class="text-[11px] font-black text-gray-700 uppercase italic truncate">{{ itemTitle }}</span>
        </div>
      </div>
    </div>

    <!-- Orta: durum etiketi -->
    <div class="px-8 py-3 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-inner flex flex-col items-center min-w-[200px]">
      <p class="text-[8px] font-black text-neutral-400 uppercase tracking-widest mb-1 italic">DURUM</p>
      <span :class="statusClass" class="text-[10px] font-black uppercase tracking-widest text-center">
        {{ displayStatus }}
      </span>
    </div>

    <!-- Sağ: aksiyon butonları -->
    <div class="flex items-center gap-3 w-full md:w-auto">
      <!-- PENDING → Kabul/Reddet (sadece alıcı tarafında) -->
      <template v-if="isReceived && normalizedStatus === 'PENDING'">
        <button
          class="flex-1 md:flex-none h-12 px-8 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-100 italic"
          @click="$emit('accept', offer.id)"
        >KABUL ET</button>
        <button
          class="flex-1 md:flex-none h-12 px-8 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-100 italic"
          @click="$emit('reject', offer.id)"
        >REDDET</button>
      </template>

      <!-- COUNTER_OFFERED → Detay sayfasına git -->
      <template v-else-if="normalizedStatus === 'COUNTER_OFFERED'">
        <NuxtLink
          :to="`/ticaritakas/trade-pool/offer/detail/${offer.id}`"
          class="flex-1 md:flex-none h-12 px-8 bg-amber-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-700 transition-all shadow-lg shadow-amber-100 italic flex items-center justify-center"
        >
          KARŞI TEKLİFİ GÖRÜNTÜLE
        </NuxtLink>
      </template>

      <!-- ACCEPTED → Swap Paneli (aktif takas) -->
      <template v-else-if="normalizedStatus === 'ACCEPTED'">
        <NuxtLink
          :to="`/my/offers?offerId=${offer.id}&type=${activeTab}`"
          class="flex-1 md:flex-none h-12 px-6 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 flex items-center justify-center transition-all italic"
        >💬 SOHBET</NuxtLink>
        <NuxtLink
          :to="swapLink"
          class="flex-1 md:flex-none h-12 px-6 bg-gray-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black flex items-center justify-center transition-all shadow-xl italic"
        >SWAP PANELİ</NuxtLink>
      </template>

      <!-- COMPLETED → Tamamlandı, swap geçmişi -->
      <template v-else-if="normalizedStatus === 'COMPLETED'">
        <NuxtLink
          :to="swapLink"
          class="flex-1 md:flex-none h-12 px-6 bg-green-50 text-green-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-100 flex items-center justify-center transition-all italic border border-green-100"
        >TAMAMLANDI ✓</NuxtLink>
      </template>

      <!-- Diğer durumlar: işlem tarihi -->
      <div v-else class="text-right">
        <p class="text-[8px] font-black text-gray-300 uppercase tracking-widest mb-1">İŞLEM TARİHİ</p>
        <p class="text-[11px] font-black text-gray-600 italic tracking-widest uppercase">{{ formatDate(offer.createdAt) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SwapSessionRef {
  id: string
  status: string
}

interface CompanyRef {
  id: string
  name: string
}

interface OfferItem {
  title?: string
  images?: (string | { url: string })[]
}

interface TradeOfferRow {
  id: string
  status: string
  createdAt: string
  fromCompany?: CompanyRef
  toCompany?: CompanyRef
  offeredItems?: OfferItem[]
  requestedItems?: OfferItem[]
  swapSession?: SwapSessionRef | null
}

const props = defineProps<{
  offer: TradeOfferRow
  activeTab: string
  myCompanyId?: string
}>()

defineEmits<{
  accept: [id: string]
  reject: [id: string]
}>()

const config = useRuntimeConfig()

// activeTab 'received' DEĞİLSE kesinlikle gönderen taraftayız — buton yok
// activeTab 'received' İSE de şirket kontrolü yapılmalı (kendi şirketine teklif gelmediyse)
const isReceived = computed((): boolean => {
  if (props.activeTab !== 'received') return false
  // Eğer myCompanyId biliniyorsa, teklifin alıcısı biz olmalıyız
  if (props.myCompanyId) return props.offer.toCompany?.id === props.myCompanyId
  return true // Fallback: tabreceived = true
})

// Büyük/küçük harf normalizasyonu — tek kaynaktan karşılaştır
const normalizedStatus = computed((): string => (props.offer.status ?? '').toUpperCase())

// İlan görseli
const itemImage = computed((): string => {
  const item = isReceived.value
    ? (props.offer.offeredItems?.[0] as OfferItem | undefined)
    : (props.offer.requestedItems?.[0] as OfferItem | undefined)
  if (item?.images?.length) {
    const img = item.images[0]
    const url = typeof img === 'string' ? img : img.url
    if (url && url.startsWith('data:')) return url  // base64 data URI — directly use
    if (url && url.startsWith('http')) return url
    if (url && !url.startsWith('/')) return `${config.public.apiBase}${url}`
  }
  return '/placeholder-surplus.jpg'
})

const itemTitle = computed((): string => {
  const item = isReceived.value
    ? (props.offer.offeredItems?.[0] as OfferItem | undefined)
    : (props.offer.requestedItems?.[0] as OfferItem | undefined)
  return item?.title || '—'
})

// Swap paneli linki — offer ID değil, session ID kullan
const swapLink = computed((): string => {
  const sessionId = props.offer.swapSession?.id
  return sessionId ? `/ticaritakas/swap/${sessionId}` : `/ticaritakas/inbox`
})

// Durum CSS sınıfı
const statusClass = computed((): string => {
  switch (normalizedStatus.value) {
    case 'ACCEPTED':        return 'text-green-600'
    case 'COMPLETED':       return 'text-green-700'
    case 'REJECTED':        return 'text-red-600'
    case 'CANCELLED':       return 'text-red-400'
    case 'COUNTER_OFFERED': return 'text-amber-600'
    case 'EXPIRED':         return 'text-gray-400'
    default:                return 'text-amber-500'
  }
})

// Durum etiketi
const displayStatus = computed((): string => {
  switch (normalizedStatus.value) {
    case 'PENDING':
      return isReceived.value ? 'YANITINIZI BEKLİYOR' : 'KARŞI TARAF BEKLENİYOR'
    case 'COUNTER_OFFERED':   return 'KARŞI TEKLİF VAR'
    case 'ACCEPTED':          return 'TAKAS SÜRECİNDE'
    case 'COMPLETED':         return 'TAMAMLANDI'
    case 'REJECTED':          return 'REDDEDİLDİ'
    case 'CANCELLED':         return 'İPTAL EDİLDİ'
    case 'EXPIRED':           return 'SÜRESİ DOLDU'
    case 'LEGAL_PENDING':     return 'HUKUKİ SÜREÇTE'
    case 'WAITING_APPROVAL':  return 'YÖNETİCİ ONAYI BEKLİYOR'
    default:                  return normalizedStatus.value
  }
})

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
</script>
