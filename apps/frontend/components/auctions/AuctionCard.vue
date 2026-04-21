<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 group">
    <!-- Auction Image & Status -->
    <div class="relative">
      <img
        :src="auction.Product?.image || 'https://placehold.co/300x300?text=Ürün+Resmi'"
        :alt="auction.Product?.name"
        class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        @error="handleImageError"
      >
      <div
        class="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow-sm"
        :class="statusBadgeClass"
      >
        {{ statusText }}
      </div>
      <div class="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs font-mono">
        <CountdownTimer
          :end-time="auction.endTime"
          size="small"
        />
      </div>
    </div>

    <!-- Auction Info -->
    <div class="p-4">
      <h3 class="text-sm font-bold text-gray-900 mb-2 line-clamp-2 h-10">
        {{ auction.title }}
      </h3>
      <p class="text-xs text-gray-500 mb-3 line-clamp-1 italic">
        {{ auction.Product?.name }}
      </p>

      <!-- Category -->
      <div class="mb-3">
        <span class="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase tracking-wider">
          {{ auction.Product?.category?.name || 'Genel' }}
        </span>
      </div>

      <!-- Bid Info -->
      <div class="mb-4 space-y-1">
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-medium">Başlangıç:</span>
          <span class="text-xs font-bold text-gray-600">{{ formatPrice(auction.startingPrice) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-400 font-medium">Güncel Teklif:</span>
          <span class="text-base font-black text-primary-600">
            {{ formatPrice(auction.currentPrice || auction.startingPrice) }}
          </span>
        </div>
        <div class="flex items-center gap-1.5 pt-1">
          <div class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {{ auction._count?.bids || 0 }} TEKLİF KAYDEDİLDİ
          </span>
        </div>
      </div>

      <!-- Action Button -->
      <NuxtLink
        :to="`/auctions/${auction.id}`"
        class="w-full bg-slate-900 border border-slate-800 text-white py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-primary-600 hover:border-primary-500 transition-all text-center block"
      >
        {{ auction.status === 'Active' ? 'CANLI TEKLİF VER' : 'DETAYLARI İNCELE' }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  auction: any
  statusBadgeClass: string
  statusText: string
  formatPrice: (p: number) => string
}>()

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.onerror = null
  target.src = 'https://placehold.co/300x300?text=Ürün+Resmi'
}
</script>
