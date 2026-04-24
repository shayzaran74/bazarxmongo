<template>
  <div class="relative h-[450px] lg:h-[550px] overflow-hidden bg-[#0f172a] italic">
    <!-- Dynamic Background -->
    <div v-if="auction?.Product" class="absolute inset-0 opacity-40 blur-xl scale-125 transition-transform duration-[20s] animate-pulse">
      <img :src="resolveImageUrl(auction.Product.image)" class="w-full h-full object-cover">
    </div>
    <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent" />

    <div class="relative z-10 max-w-7xl mx-auto h-full px-4 flex flex-col items-center justify-center text-center">
      <div class="mb-8 px-8 py-2.5 rounded-full border border-white/20 backdrop-blur-3xl text-white text-[10px] font-black uppercase tracking-[0.4em] shadow-2xl" :class="auction?.status === 'Active' ? 'bg-indigo-600/30' : 'bg-red-600/30'">
        {{ getStatusText(auction?.status) }}
      </div>

      <h1 class="text-5xl md:text-8xl font-black text-white mb-10 uppercase tracking-tightest leading-[0.9] drop-shadow-2xl" data-testid="auction-title">
        {{ auction?.title }}
      </h1>

      <!-- Countdown Grid -->
      <div v-if="auction?.status === 'Active'" class="flex gap-4 md:gap-10 mb-12" data-testid="countdown">
        <div v-for="(val, unit) in countdown" :key="unit" class="flex flex-col items-center group">
          <div class="w-20 h-20 md:w-32 md:h-32 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 flex items-center justify-center text-3xl md:text-6xl font-black text-white shadow-2xl group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-600/20 group-hover:border-indigo-400/30">
            {{ val }}
          </div>
          <span class="mt-4 text-[10px] md:text-[11px] font-black text-white/40 uppercase tracking-[0.3em] italic group-hover:text-indigo-400 transition-colors">{{ unit === 'D' ? 'GÜN' : unit === 'H' ? 'SAAT' : unit === 'M' ? 'DAKİKA' : 'SANİYE' }}</span>
        </div>
      </div>

      <div v-if="auction?.status === 'Completed'" class="bg-indigo-600 px-12 py-5 rounded-[2rem] shadow-[0_0_50px_rgba(79,70,229,0.4)] animate-bounce relative group overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <p class="text-white font-black text-xl uppercase tracking-widest relative z-10">AÇIK ARTIRMA SONUÇLANDI</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ auction: Object, countdown: Object })
const { resolveImageUrl } = useAppImage()

const getStatusText = (s) => ({
  Active: 'CANLI TAKİP',
  Completed: 'AÇIK ARTIRMA BİTTİ',
  Cancelled: 'İPTAL EDİLDİ'
}[s] || s)
</script>
