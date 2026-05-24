<template>
  <div v-if="offer" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" @click="$emit('close')" />
    <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col">
      <div class="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50 shrink-0">
        <h2 class="text-lg font-black text-gray-900 uppercase italic">TEKLİF DETAYLARI</h2>
        <button class="p-1.5 hover:bg-gray-200 rounded-xl transition-colors" @click="$emit('close')">
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>

      <div class="p-4 overflow-y-auto space-y-4 custom-scrollbar flex-1 min-h-0">
        <!-- offerSource badge -->
        <div v-if="offer.offerSource" class="flex gap-2">
          <span
            v-if="offer.offerSource === 'BATCH_MATCH'"
            class="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium"
          >
            Sistem eşleşmesi
          </span>
          <span
            v-else-if="offer.offerSource === 'COUNTER'"
            class="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-medium"
          >
            Karşı teklif
          </span>
        </div>

        <div class="grid grid-cols-2 gap-6 relative">
          <!-- Flow Arrow -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full border border-gray-100 items-center justify-center shadow-sm">
            <ArrowsRightLeftIcon class="h-5 w-5 text-primary-500" />
          </div>

          <!-- Offered Section -->
          <div class="space-y-4">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest px-1">TEKLİF EDİLEN</p>
            <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <img :src="getMainImage(offeredItem)" class="w-full h-28 rounded-xl object-cover mb-3 border">
              <h3 class="text-sm font-black text-gray-900 uppercase leading-none mb-1">{{ offeredItem?.title || 'NAKİT ÖDEME' }}</h3>
              <p class="text-[10px] font-bold text-gray-400 uppercase">{{ offer.fromCompany?.name }}</p>
            </div>
          </div>

          <!-- Requested Section -->
          <div class="space-y-4">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">İSTENİLEN</p>
            <div class="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <img :src="getMainImage(requestedItem)" class="w-full h-28 rounded-xl object-cover mb-3 border">
              <h3 class="text-sm font-black text-gray-900 uppercase leading-none mb-1">{{ requestedItem?.title || '—' }}</h3>
              <p class="text-[10px] font-bold text-gray-400 uppercase">{{ offer.toCompany?.name }}</p>
            </div>
          </div>
        </div>

        <!-- Extra Info -->
        <div class="bg-primary-50 rounded-2xl p-4 border border-primary-100 flex flex-col md:flex-row gap-4">
          <div class="flex-1">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 px-1">MESAJ</p>
            <p class="text-xs font-medium text-primary-900 italic">"{{ offer.message || 'Not bırakılmadı.' }}"</p>
          </div>
          <div class="w-full md:w-36 space-y-1">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">NAKİT FARK</p>
            <p class="text-lg font-black" :class="(offer.cashAmount || 0) > 0 ? 'text-red-500' : 'text-green-600'">
              {{ Number(offer.cashAmount || 0).toLocaleString('tr-TR', { style: 'currency', currency: offer.cashCurrency || 'TRY' }) }}
            </p>
          </div>
        </div>

        <!-- Chat Section -->
        <div v-if="showChat" id="chat-section" class="border-t border-gray-100 pt-4 h-[320px] flex flex-col">
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-black text-gray-900 uppercase tracking-widest italic">💬 SOHBET</h4>
            <button class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest px-3 py-1.5 bg-gray-50 rounded-lg transition-all" @click="showChat = false">Kapat</button>
          </div>
          <ChatWindow :trade-offer-id="offer.id" class="flex-1 min-h-0" />
        </div>
      </div>

      <div class="p-4 bg-white border-t border-gray-100 flex flex-col gap-3">
        <div v-if="activeTab === 'received' && ['PENDING', 'WAITING_APPROVAL'].includes(offer.status.toUpperCase())" class="flex gap-3">
          <button class="flex-1 bg-primary-600 text-white rounded-xl py-3 font-black uppercase text-[10px] shadow-xl transition-all hover:bg-primary-500" @click="$emit('accept', offer.id)">KABUL ET</button>
          <button class="flex-1 bg-white border border-primary-200 text-primary-600 rounded-xl py-3 font-black uppercase text-[10px] transition-colors hover:bg-primary-50" @click="$emit('counter', offer)">KARŞI TEKLİF</button>
          <button class="flex-1 bg-white border border-gray-200 text-red-600 rounded-xl py-3 font-black uppercase text-[10px] hover:bg-red-50 transition-colors" @click="$emit('reject', offer.id)">REDDET</button>
        </div>
        <div class="flex justify-end gap-2">
          <NuxtLink v-if="['ACCEPTED', 'COMPLETED'].includes(offer.status.toUpperCase())" :to="offer.swapSession?.id ? `/ticaritakas/swap/${offer.swapSession.id}` : `/ticaritakas/trade-pool/offer/detail/${offer.id}`" class="px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-[10px] transition-all shadow-lg flex items-center gap-2">
            ⚙️ Takası Yönet
          </NuxtLink>
          <button v-if="!showChat" class="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl text-[10px] transition-all shadow-lg flex items-center gap-2" @click="showChat = true">
            💬 Sohbet
          </button>
          <button class="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-[10px] transition-all" @click="$emit('close')">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
import ChatWindow from '~/components/chat/ChatWindow.vue'

interface OfferItem {
  title?: string
  images?: (string | { url: string })[]
  unit?: string
}

interface Company { name?: string }

interface Offer {
  id: string
  status: string
  message?: string
  cashAmount?: number
  cashCurrency?: string
  fromCompany?: Company
  toCompany?: Company
  offeredItems?: OfferItem[]
  requestedItems?: OfferItem[]
  offeredItem?: OfferItem
  requestedItem?: OfferItem
  swapSession?: { id: string } | null
  offerSource?: string
  [key: string]: unknown
}

const props = defineProps<{ offer: Offer; activeTab: string }>()
defineEmits(['close', 'accept', 'counter', 'reject'])

const showChat = ref(false)

// Tekil veya çoğul alan adı desteği (backward-compat)
const offeredItem = computed((): OfferItem | undefined =>
  props.offer.offeredItems?.[0] ?? props.offer.offeredItem
)
const requestedItem = computed((): OfferItem | undefined =>
  props.offer.requestedItems?.[0] ?? props.offer.requestedItem
)

const getMainImage = (item: OfferItem | undefined): string => {
  if (item?.images?.length) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
</style>
