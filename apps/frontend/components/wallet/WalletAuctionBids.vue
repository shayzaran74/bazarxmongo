<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <span>🎯</span> Açık Artırma Tekliflerim
      </h2>
    </div>

    <div
      v-if="auctions && auctions.length > 0"
      class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar"
    >
      <div
        v-for="auc in auctions"
        :key="auc.id"
        class="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white transition-all group"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div class="mb-2 md:mb-0">
            <h3 class="font-black text-gray-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
              {{ auc.auctionTitle }}
            </h3>
            <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
              {{ auc.createdAt ? new Date(auc.createdAt).toLocaleString('tr-TR') : '' }}
            </p>
          </div>
          <div class="flex gap-6 items-center">
            <div class="text-right">
              <span class="block text-xl font-black text-gray-900 tracking-tight">{{ formatPrice(auc.amount) }}</span>
              <span
                v-if="auc.isHighest"
                class="inline-block text-[9px] font-black text-green-700 uppercase tracking-widest bg-green-100 px-3 py-1 rounded-lg border border-green-200 mt-1"
              >
                🏆 En Yüksek Teklif
              </span>
              <span
                v-else
                class="inline-block text-[9px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-lg border border-red-100 mt-1"
              >
                📉 Geçildi
              </span>
            </div>

            <NuxtLink
              :to="`/auctions/${auc.auctionId}`"
              class="bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-600 p-4 rounded-2xl transition-all shadow-sm active:scale-95 group-hover:shadow-md"
            >
              <ArrowRightIcon class="w-5 h-5" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
        <span class="text-3xl">🎯</span>
      </div>
      <p class="text-sm font-bold text-gray-400">Henüz bir açık artırmaya teklif vermediniz.</p>
      <NuxtLink
        to="/auctions"
        class="mt-6 inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl"
      >
        Keşfet
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { ArrowRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  auctions: Array,
  formatPrice: Function
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ccc; }
</style>
