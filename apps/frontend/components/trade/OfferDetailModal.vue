<template>
  <div v-if="offer" class="fixed inset-0 z-[500] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-gray-900/80 backdrop-blur-md" @click="$emit('close')" />
    <div class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
      <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <h2 class="text-2xl font-black text-gray-900 uppercase italic">TEKLİF DETAYLARI</h2>
        <button class="p-2 hover:bg-gray-200 rounded-xl transition-colors" @click="$emit('close')">
          <XMarkIcon class="h-6 w-6" />
        </button>
      </div>

      <div class="p-8 overflow-y-auto space-y-10 custom-scrollbar">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
          <!-- Flow Arrow -->
          <div class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full border border-gray-100 items-center justify-center shadow-sm">
            <ArrowsRightLeftIcon class="h-6 w-6 text-primary-500" />
          </div>

          <!-- Offered Section -->
          <div class="space-y-6">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 px-1">TEKLİF EDİLEN</p>
            <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <img :src="getMainImage(offer.offeredItem)" class="w-full aspect-video rounded-2xl object-cover mb-4 border">
              <h3 class="text-lg font-black text-gray-900 uppercase leading-none mb-1">{{ offer.offeredItem?.title || 'NAKİT ÖDEME' }}</h3>
              <p class="text-xs font-bold text-gray-400 uppercase mb-4">{{ offer.fromCompany?.name }}</p>
              <div class="space-y-3 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-black text-gray-400 uppercase">MİKTAR:</span>
                  <span class="font-black text-gray-900">{{ offer.offeredQuantity }} {{ offer.offeredItem?.unit }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Requested Section -->
          <div class="space-y-6">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">İSTENİLEN</p>
            <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
              <img :src="getMainImage(offer.requestedItem)" class="w-full aspect-video rounded-2xl object-cover mb-4 border">
              <h3 class="text-lg font-black text-gray-900 uppercase leading-none mb-1">{{ offer.requestedItem?.title }}</h3>
              <p class="text-xs font-bold text-gray-400 uppercase mb-4">{{ offer.toCompany?.name }}</p>
              <div class="space-y-3 pt-4 border-t border-gray-200">
                <div class="flex justify-between items-center text-xs">
                  <span class="font-black text-gray-400 uppercase">MİKTAR:</span>
                  <span class="font-black text-gray-900">{{ offer.requestedQuantity }} {{ offer.requestedItem?.unit }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Extra Info -->
        <div class="bg-primary-50 rounded-3xl p-8 border border-primary-100 flex flex-col md:flex-row gap-8">
          <div class="flex-1">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 px-1">MESAJ</p>
            <p class="text-sm font-medium text-primary-900 italic">"{{ offer.message || 'Not bırakılmadı.' }}"</p>
          </div>
          <div class="w-full md:w-48 space-y-2">
            <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">DENGELEME FARKI</p>
            <p class="text-xl font-black" :class="offer.cashDifference > 0 ? 'text-red-500' : 'text-green-600'">
              {{ (offer.cashDifference || 0).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) }}
            </p>
          </div>
        </div>

        <!-- Chat Section -->
        <div v-if="showChat" id="chat-section" class="mt-8 pt-8 border-t border-gray-100 min-h-[400px]">
          <div class="flex items-center justify-between mb-4">
            <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest italic">💬 SOHBET</h4>
            <button class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-lg transition-all" @click="showChat = false">Sohbeti Kapat</button>
          </div>
          <ChatWindow :trade-offer-id="offer.id" />
        </div>
      </div>

      <div class="p-8 bg-white border-t border-gray-100 flex flex-col gap-4">
        <div v-if="activeTab === 'received' && ['PENDING', 'WAITING_APPROVAL'].includes(offer.status.toUpperCase())" class="flex gap-4">
          <button class="flex-1 bg-primary-600 text-white rounded-2xl py-4 font-black uppercase text-xs shadow-xl transition-all hover:bg-primary-500" @click="$emit('accept', offer.id)">KABUL ET</button>
          <button class="flex-1 bg-white border border-primary-200 text-primary-600 rounded-2xl py-4 font-black uppercase text-xs transition-colors hover:bg-primary-50" @click="$emit('counter', offer)">KARŞI TEKLİF</button>
          <button class="flex-1 bg-white border border-gray-200 text-red-600 rounded-2xl py-4 font-black uppercase text-xs hover:bg-red-50 transition-colors" @click="$emit('reject', offer.id)">REDDET</button>
        </div>
        <div class="flex justify-end gap-3">
          <NuxtLink v-if="['ACCEPTED', 'COMPLETED'].includes(offer.status.toUpperCase())" :to="`/my/surplus/swap/${offer.id}`" class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2">
            ⚙️ Takası Yönet
          </NuxtLink>
          <button v-if="!showChat" class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2" @click="showChat = true">
            💬 Sohbeti Aç
          </button>
          <button class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all" @click="$emit('close')">Kapat</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { XMarkIcon, ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
import ChatWindow from '~/components/chat/ChatWindow.vue'

defineProps({
  offer: Object,
  activeTab: String
})

defineEmits(['close', 'accept', 'counter', 'reject'])

const showChat = ref(false)

const getMainImage = (item) => {
  if (item?.images && item.images.length > 0) {
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
