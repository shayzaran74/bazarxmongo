<template>
  <section id="pricing" class="py-32 bg-gray-900 relative overflow-hidden italic">
    <!-- Decorative background -->
    <div class="absolute top-0 left-0 w-full h-full opacity-5">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] border border-white rounded-full scale-150 animate-pulse" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] border border-white rounded-full scale-110" />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center mb-24 space-y-4">
        <h2 class="text-5xl lg:text-7xl font-black text-white tracking-tightest uppercase italic">PLANINIZI <span class="text-indigo-400">SEÇİN</span></h2>
        <p class="text-gray-500 font-black text-[10px] uppercase tracking-[0.4em] italic">AVANTAJLARINIZI KATLAMAYA HEMEN BAŞLAYIN.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
        <!-- Monthly Plan -->
        <div class="relative group">
          <div class="absolute -inset-1 bg-white/10 rounded-[4rem] blur-[30px] opacity-0 group-hover:opacity-100 transition duration-1000" />
          <div class="relative flex flex-col h-full p-12 bg-gray-800 border-2 border-gray-700 rounded-[4rem] hover:border-indigo-500/50 transition-all overflow-hidden shadow-2xl">
            <div class="absolute top-0 right-0 p-12 h-44 w-44 bg-indigo-600/10 rounded-full blur-3xl" />

            <div class="mb-12">
              <h3 class="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">AYLIK PREMIUM</h3>
              <p class="text-gray-500 text-[10px] font-black uppercase tracking-widest opacity-80">AYLIK ESNEK ÖDEME PLANI.</p>
            </div>

            <div class="flex items-baseline gap-4 mb-12">
              <span class="text-gray-600 line-through text-2xl font-black italic">199₺</span>
              <span class="text-7xl font-black text-white tracking-tightest">99<span class="text-xl ml-1">TL</span></span>
            </div>

            <button :disabled="loading" class="mt-auto w-full py-8 bg-white text-gray-900 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-indigo-600 hover:text-white transition-all transform hover:scale-[1.02] active:scale-95 shadow-3xl group/btn overflow-hidden relative" @click="$emit('select', 'monthly')">
              <span v-if="loading" class="w-6 h-6 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <span v-else>PREMİUM'A GEÇ 🚀</span>
            </button>
          </div>
        </div>

        <!-- Yearly Plan -->
        <div class="relative group">
          <div class="absolute -inset-2 bg-gradient-to-r from-indigo-600 to-amber-600 rounded-[4.5rem] blur-[40px] opacity-20 group-hover:opacity-60 transition duration-1000 animate-pulse" />
          <div class="relative flex flex-col h-full p-12 bg-black border-2 border-indigo-500 rounded-[4rem] shadow-[0_0_100px_rgba(79,70,229,0.2)] overflow-hidden">
            <div class="absolute top-10 right-10 bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black tracking-[0.3em] px-6 py-3 rounded-full shadow-2xl uppercase italic animate-bounce">ÖNERİLEN 🔥</div>

            <div class="mb-12">
              <h3 class="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">YILLIK PREMIUM</h3>
              <p class="text-indigo-400 text-[10px] font-black uppercase tracking-widest italic leading-none">MAKSİMUM TASARRUF & AYRICALIK.</p>
            </div>

            <div class="flex items-baseline gap-4 mb-12">
              <span class="text-gray-700 line-through text-2xl font-black italic">1490₺</span>
              <span class="text-7xl font-black text-white tracking-tightest">69<span class="text-xl ml-1">TL</span></span>
            </div>

            <div class="space-y-6 mb-16">
              <p class="text-indigo-400 text-[10px] font-black italic uppercase tracking-[0.2em] leading-none opacity-80">YILLIK TOPLAM 1.068,00 TL // AYDA SADECE 69 TL</p>
              <div class="flex items-center gap-3 text-white text-[11px] font-black uppercase tracking-tightest">
                <span class="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-lg shadow-xl shadow-emerald-500/20">✓</span>
                %50 DAHA AVANTAJLI PROTOKOL!
              </div>
            </div>

            <button :disabled="loading" class="mt-auto w-full py-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:shadow-[0_0_60px_rgba(79,70,229,0.4)] transition-all transform hover:scale-[1.02] active:scale-95 shadow-3xl disabled:opacity-50" @click="$emit('select', 'yearly')">
              <span v-if="loading" class="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
              <span v-else>ŞİMDİ YILLIK GEÇ 👑</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({ loading: Boolean })
defineEmits(['select'])
</script>
