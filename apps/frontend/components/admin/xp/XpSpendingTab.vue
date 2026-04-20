<template>
  <div class="space-y-6">
    <div class="bg-amber-50/50 p-8 rounded-[2rem] border border-amber-100 flex items-start gap-6 shadow-inner">
      <div class="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 transform -rotate-6">⚠️</div>
      <div>
        <p class="text-[10px] font-black text-amber-900 uppercase tracking-widest leading-loose italic">
          BU MODİFİKASYONLAR SMARTTRANSACTIONMODAL'DAKİ KAYDIRICININ KİLİT NOKTALARINI VE WATCHTOWER LİMİTLERİNİ ETKİLER. DİKKATLİ DEĞİŞTİRİNİZ!
        </p>
      </div>
    </div>

    <div v-if="loading" class="py-12 text-center flex flex-col items-center justify-center opacity-30 italic">
      <div class="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p class="text-[10px] font-black uppercase tracking-widest text-amber-600">LİMİTLER YAKALANIYOR</p>
    </div>

    <div v-else class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="limit in limits" :key="limit.tier" class="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden hover:shadow-2xl transition-all group italic">
        <div class="p-8 pb-4">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tighter italic">{{ limit.tier }} SEVİYESİ</h3>
            <span :class="[limit.isActive ? 'bg-green-50 text-green-600 border-green-100' : 'bg-red-50 text-red-600 border-red-100', 'px-4 py-1 text-[9px] font-black rounded-full uppercase tracking-widest border']">
              {{ limit.isActive ? 'AKTİF' : 'PASİF' }}
            </span>
          </div>

          <div class="space-y-6 px-4">
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">MAX İŞLEM LİMİTİ</span>
              <span class="text-2xl font-black text-gray-900 tracking-tighter">%{{ limit.maxXpPerTransactionPct }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">AYLIK HACİM HEDEFİ</span>
              <span class="text-sm font-black text-gray-900 tracking-tighter">{{ formatPrice(limit.monthlyVolumeThreshold) }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-[9px] font-black text-gray-400 uppercase tracking-widest italic">BOOSTED GÜNLÜK KOTA</span>
              <span class="text-sm font-black text-indigo-600 tracking-tighter">{{ limit.boostedDailyXpLimit }} XP</span>
            </div>
          </div>
        </div>
        <div class="p-6 bg-neutral-50 border-t border-neutral-100">
          <button class="w-full text-[10px] font-black text-indigo-600 uppercase tracking-widest italic group-hover:translate-x-2 transition-transform text-left" @click="$emit('edit', limit)">
            LİMİTİ DÜZENLE ➜
          </button>
        </div>
      </div>

      <div class="bg-neutral-50 rounded-[2.5rem] border border-dashed border-neutral-200 flex flex-col items-center justify-center p-12 group hover:bg-neutral-100 transition-all cursor-pointer shadow-inner" @click="$emit('create')">
        <div class="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-2xl shadow-sm mb-6 group-hover:scale-110 transition-transform">➕</div>
        <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic">YENİ LİMİT KURALI EKLE</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ limits: Array, loading: Boolean })
defineEmits(['edit', 'create'])
const formatPrice = (p) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(p || 0)
</script>
