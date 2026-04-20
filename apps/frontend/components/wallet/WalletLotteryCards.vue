<template>
  <div class="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
        <span>🎫</span> Çekiliş Kartlarım
      </h2>
    </div>

    <div
      v-if="cards && cards.length > 0"
      class="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar"
    >
      <div
        v-for="(card, index) in cards"
        :key="index"
        class="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 hover:bg-white hover:border-blue-100 transition-all group"
      >
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 class="font-black text-gray-900 text-sm tracking-tight group-hover:text-blue-600 transition-colors">
              {{ card.giveawayTitle }}
            </h3>
            <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">
              {{ card.purchasedAt ? new Date(card.purchasedAt).toLocaleString('tr-TR') : '' }}
            </p>
          </div>
          <div class="flex gap-3 flex-wrap items-center">
            <div class="flex gap-2 flex-wrap">
              <span
                v-for="(num, i) in card.numbers"
                :key="i"
                class="bg-white text-blue-700 px-4 py-2 rounded-xl font-mono font-black text-xs tracking-widest border border-gray-200 shadow-sm"
              >
                {{ num }}
              </span>
            </div>

            <div v-if="isCardWinner(card) !== null">
              <span
                v-if="isCardWinner(card)"
                class="px-4 py-2 rounded-xl bg-green-500 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-green-200"
              >
                🎉 Kazandınız
              </span>
              <span
                v-else
                class="px-4 py-2 rounded-xl bg-red-50 text-red-500 font-black text-[10px] uppercase tracking-widest border border-red-100"
              >
                ❌ Pas
              </span>
            </div>
            <span
              v-else
              class="px-4 py-2 rounded-xl bg-amber-50 text-amber-600 font-black text-[10px] uppercase tracking-widest border border-amber-100 animate-pulse"
            >
              ⏳ Bekleniyor
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 border-2 border-dashed border-gray-100 rounded-[2rem] bg-gray-50/50">
      <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100 shadow-sm">
        <span class="text-3xl">🎫</span>
      </div>
      <p class="text-gray-500 text-sm font-bold">Henüz çekiliş kartınız yok.</p>
      <NuxtLink
        to="/lotteries"
        class="mt-6 inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-200"
      >
        Çekilişlere Katıl
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  cards: Array,
  isCardWinner: Function
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ccc; }
</style>
