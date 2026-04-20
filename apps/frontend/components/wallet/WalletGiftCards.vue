<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <span>🎁</span> Hediye Kartlarım
      </h2>
      <div class="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
        Müşteriye Tanımlı
      </div>
    </div>

    <div
      v-if="giftCards && giftCards.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div
        v-for="card in giftCards"
        :key="card.id"
        class="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg group transition-all hover:shadow-xl hover:-translate-y-1"
      >
        <div class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
          <GiftIcon class="h-24 w-24" />
        </div>

        <div class="relative z-10 h-full flex flex-col justify-between">
          <div>
            <div class="flex justify-between items-start mb-4">
              <span class="text-[10px] font-black uppercase tracking-widest opacity-80 bg-white/10 px-2.5 py-1 rounded-xl">TicariTakas Gift Card</span>
              <span class="bg-green-400/20 text-green-100 px-2.5 py-1 rounded-xl text-[10px] font-black tracking-widest border border-green-400/30">AKTİF</span>
            </div>
            <div class="text-xl font-mono font-black tracking-[0.2em] mb-1">
              {{ card.code }}
            </div>
            <div class="text-[10px] font-bold opacity-60 mb-4 tracking-widest">
              <span v-if="card.expiresAt">GEÇERLİLİK: {{ new Date(card.expiresAt).toLocaleDateString('tr-TR') }}</span>
            </div>
          </div>

          <div class="flex justify-between items-end">
            <div>
              <p class="text-[10px] font-black opacity-80 uppercase tracking-widest mb-1">Değer</p>
              <p class="text-3xl font-black leading-none tracking-tight">
                {{ formatPrice(card.currentValue) }}
              </p>
            </div>

            <button
              class="ml-4 bg-white text-indigo-700 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-tighter hover:bg-white/90 transition-all transform active:scale-95 shadow-xl flex items-center gap-2"
              @click="$emit('redeem', card.code)"
            >
              Cüzdana Aktar
              <span class="text-lg">💸</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-16 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
      <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <span class="text-4xl">🎁</span>
      </div>
      <p class="text-gray-400 font-bold uppercase tracking-widest text-xs">Henüz size tanımlı bir hediye kartı bulunmuyor.</p>
    </div>
  </div>
</template>

<script setup>
import { GiftIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  giftCards: Array,
  formatPrice: Function
})

defineEmits(['redeem'])
</script>
