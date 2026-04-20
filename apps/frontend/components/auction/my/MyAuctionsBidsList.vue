<template>
  <div class="space-y-8 font-sans italic">
    <div class="space-y-2 mb-4">
      <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">VERDİĞİM TEKLİFLER</h2>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] ml-1">AKTİF REKABET VE TEKLİF GEÇMİŞİ</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="grid grid-cols-1 gap-6">
      <div v-for="i in 3" :key="i" class="h-64 bg-white/50 animate-pulse rounded-[3rem] border border-neutral-100" />
    </div>

    <!-- Bids List -->
    <div v-else-if="bids.length > 0" class="grid grid-cols-1 gap-8">
      <div
        v-for="bid in bids"
        :key="bid.id"
        class="bg-white rounded-[3.5rem] p-10 border border-neutral-100 shadow-2xl shadow-black/[0.02] hover:shadow-black/[0.05] transition-all group relative overflow-hidden"
      >
        <div class="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 group-hover:scale-110">
          <BanknotesIcon class="h-48 w-48 text-gray-900" />
        </div>

        <div class="flex flex-col xl:flex-row items-center gap-10 relative z-10">
          <div class="w-40 h-40 rounded-[2.5rem] overflow-hidden ring-4 ring-neutral-50 shadow-inner group-hover:ring-blue-50 transition-all">
            <img
              :src="bid.Auction?.Product?.image || 'https://placehold.co/600x600?text=PRODUCT'"
              class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700"
            >
          </div>

          <div class="flex-1 space-y-4 text-center xl:text-left">
            <div class="flex flex-wrap items-center justify-center xl:justify-start gap-4">
              <span
                class="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm"
                :class="getStatusClass(bid.Auction?.status)"
              >
                {{ getStatusText(bid.Auction?.status) }}
              </span>
              <span class="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-neutral-50 px-4 py-1.5 rounded-full">
                {{ formatDateTime(bid.createdAt) }}
              </span>
            </div>
            <div>
              <h3 class="text-3xl font-black text-gray-900 uppercase tracking-tightest leading-none drop-shadow-sm">{{ bid.Auction?.title }}</h3>
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-2">{{ bid.Auction?.Product?.name || 'BELİRSİZ ÜRÜN MODÜLÜ' }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 text-center xl:text-right px-10 xl:border-l border-neutral-100">
            <div>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">TEKLİFİM</p>
              <p class="text-3xl font-black text-blue-600 tracking-tighter">{{ formatPrice(bid.amount) }}</p>
              <div v-if="isWinning(bid)" class="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-green-500/10 rounded-full">
                <span class="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span class="text-[9px] font-black text-green-600 uppercase tracking-widest">KAZANIYORSUNUZ</span>
              </div>
            </div>
            <div>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">GÜNCEL ZİRVE</p>
              <p class="text-xl font-black text-gray-900 tracking-tighter">
                {{ bid.Auction?.currentPrice ? formatPrice(bid.Auction.currentPrice) : formatPrice(bid.Auction?.startingPrice) }}
              </p>
              <p v-if="!isWinning(bid)" class="text-[9px] font-black text-red-500 mt-2 uppercase tracking-widest opacity-50 italic">TEKLİFİNİZİN ÜZERİNE ÇIKILDI</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="mt-10 pt-8 border-t border-neutral-50 flex flex-wrap justify-center xl:justify-end gap-4">
          <NuxtLink
            :to="`/auctions/${bid.Auction?.id}`"
            class="px-8 py-4 bg-white border border-neutral-200 text-[10px] font-black text-gray-400 hover:text-gray-900 hover:border-gray-900 rounded-[1.5rem] transition-all uppercase tracking-widest shadow-sm"
          >
            AÇIK ARTIRMAYA GİT
          </NuxtLink>
          <button
            v-if="bid.Auction?.status === 'Active' && !isWinning(bid)"
            class="px-10 py-4 bg-gray-900 hover:bg-black text-white rounded-[1.5rem] text-[10px] font-black transition-all uppercase tracking-widest shadow-xl shadow-gray-200 active:scale-95"
            @click="$emit('increase', bid.Auction.id)"
          >
            TEKLİFİ ARTIR
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white/50 rounded-[4rem] border-2 border-dashed border-neutral-100 py-32 text-center space-y-8">
      <div class="w-32 h-32 bg-neutral-50 rounded-full flex items-center justify-center mx-auto ring-8 ring-white">
        <span class="text-5xl">💰</span>
      </div>
      <div class="max-w-md mx-auto space-y-4">
        <h3 class="text-2xl font-black text-gray-900 uppercase tracking-tightest">HENÜZ TEKLİF VERMEDİNİZ</h3>
        <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-relaxed px-10">AÇIK ARTIRMALARA KATILIN VE İLGİNİZİ ÇEKEN ÜRÜNLER İÇİN REKABETE DAHİL OLUN.</p>
        <NuxtLink
          to="/auctions"
          class="inline-block bg-gray-900 text-white rounded-[1.2rem] px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-all"
        >
          AÇIK ARTIRMALARI KEŞFET
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BanknotesIcon } from '@heroicons/vue/24/outline'

defineProps<{
  bids: any[]
  loading: boolean
}>()

defineEmits(['increase'])

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(price)
}

const formatDateTime = (dateTime: string) => {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date(dateTime))
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

const isWinning = (bid: any) => {
  return Number(bid.amount) === (bid.Auction?.currentPrice ? Number(bid.Auction.currentPrice) : 0)
}
</script>
