<template>
  <div class="space-y-8 font-sans italic">
    <div class="flex flex-col md:flex-row justify-between items-end gap-6 mb-4">
      <div class="space-y-2">
        <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">AÇTIĞIM AÇIK ARTIRMALAR</h2>
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">KİŞİSEL SATIŞ PROTOKOLLERİ</p>
      </div>
      <button
        v-if="isAdmin"
        class="group relative bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] px-10 py-5 flex items-center gap-4 transition-all shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95"
        @click="$emit('create')"
      >
        <span class="text-xl font-black">+</span>
        <span class="text-[11px] font-black uppercase tracking-[0.2em] leading-none">YENİ AÇIK ARTIRMA BAŞLAT</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-white/50 animate-pulse rounded-[3rem] border border-neutral-100" />
    </div>

    <!-- Created Auctions -->
    <div v-else-if="auctions.length > 0" class="grid grid-cols-1 gap-8">
      <div
        v-for="auction in auctions"
        :key="auction.id"
        class="bg-white rounded-[3.5rem] p-10 border border-neutral-100 shadow-2xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 group-hover:scale-110">
          <HandRaisedIcon class="h-48 w-48 text-gray-900" />
        </div>

        <div class="flex flex-col xl:flex-row items-center gap-10 relative z-10">
          <div class="w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-neutral-50 shadow-inner group-hover:ring-blue-50 transition-all">
            <img
              :src="auction.Product?.image || 'https://placehold.co/600x600?text=PRODUCT'"
              class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
            >
          </div>

          <div class="flex-1 space-y-4 text-center xl:text-left">
            <div class="flex flex-wrap items-center justify-center xl:justify-start gap-4">
              <span
                class="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                :class="getStatusClass(auction.status)"
              >
                {{ getStatusText(auction.status) }}
              </span>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-neutral-50 px-4 py-1.5 rounded-full">
                {{ getTimeRemaining(auction.endTime) }}
              </span>
            </div>
            <div>
              <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest leading-none drop-shadow-sm">{{ auction.title }}</h3>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ auction.Product?.name || 'BELİRSİZ ÜRÜN MODÜLÜ' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 text-center xl:text-right px-10 xl:border-l border-neutral-100">
            <div>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">BAŞLANGIÇ</p>
              <p class="text-xl font-black text-gray-900 tracking-tighter">{{ formatPrice(auction.startingPrice) }}</p>
            </div>
            <div>
              <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1 italic">GÜNCEL TEKLİF</p>
              <p class="text-3xl font-black text-blue-600 tracking-tighter">{{ formatPrice(auction.currentPrice || auction.startingPrice) }}</p>
              <p class="text-[9px] font-black text-gray-400 mt-1 uppercase tracking-widest opacity-50">{{ auction._count?.AuctionBid || 0 }} REKABETÇİ TEKLİF</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-10 pt-8 border-t border-neutral-50 flex flex-wrap justify-center xl:justify-end gap-4">
          <NuxtLink
            :to="`/auctions/${auction.id}`"
            class="px-8 py-4 bg-white border border-neutral-200 text-[10px] font-black text-gray-400 hover:text-gray-900 hover:border-gray-900 rounded-[1.5rem] transition-all uppercase tracking-widest shadow-sm"
          >
            İHALE DETAYLARINI GÖR
          </NuxtLink>
          <button
            v-if="auction.status === 'Active'"
            class="px-8 py-4 bg-yellow-600/10 hover:bg-yellow-600 text-yellow-600 hover:text-white rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-widest border border-yellow-600/20"
            @click="$emit('edit', auction)"
          >
            PARAMETRELERİ DÜZENLE
          </button>
          <button
            v-if="auction.status === 'Active'"
            class="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-widest shadow-lg shadow-red-200"
            @click="$emit('end', auction.id)"
          >
            OTURUMU SONLANDIR
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white/50 rounded-[4rem] border-2 border-dashed border-neutral-100 py-32 text-center space-y-8">
      <div class="w-32 h-32 bg-neutral-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white">
        <span class="text-5xl">🎯</span>
      </div>
      <div class="max-w-md mx-auto space-y-4">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest">AKTİF İHALENİZ BULUNAMADI</h3>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed px-10">SİSTEMDE HENÜZ BİR AÇIK ARTIRMA PROTOKOLÜ BAŞLATMADINIZ. İLK OTURUMUNUZU ŞİMDİ AÇIN.</p>
        <button
          v-if="isAdmin"
          class="bg-gray-900 text-white rounded-[1.2rem] px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
          @click="$emit('create')"
        >
          YENİ OTURUM BAŞLAT
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HandRaisedIcon } from '@heroicons/vue/24/outline'

defineProps<{
  auctions: any[]
  loading: boolean
  isAdmin: boolean
}>()

defineEmits(['create', 'edit', 'end'])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'Active': return 'bg-green-500/10 text-green-600 border border-green-500/20'
    case 'Completed': return 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
    case 'Cancelled': return 'bg-red-500/10 text-red-600 border border-red-500/20'
    default: return 'bg-neutral-100 text-gray-500 border border-neutral-200'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'Active': return 'AKTİF OTURUM'
    case 'Completed': return 'TAMAMLANDI'
    case 'Cancelled': return 'İPTAL EDİLDİ'
    default: return status.toUpperCase()
  }
}

const getTimeRemaining = (endTime: string) => {
  const now = new Date()
  const end = new Date(endTime)
  const diff = end.getTime() - now.getTime()
  if (diff <= 0) return 'SONA ERDİ'
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (days > 0) return `${days} GÜN ${hours} SAAT`
  if (hours > 0) return `${hours} SAAT ${minutes} DK`
  return `${minutes} DAKİKA`
}
</script>
