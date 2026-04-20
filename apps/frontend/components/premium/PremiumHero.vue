<template>
  <section class="relative pt-32 pb-44 overflow-hidden italic">
    <!-- Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full bg-[#0a0a0c] z-0" />
    <div class="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-900/20 to-transparent z-0" />
    <div class="absolute -top-24 -left-24 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 z-0" />

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-24">
        <div class="flex-1 text-center lg:text-left space-y-10">
          <div class="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-500/10 border border-white/10 rounded-full backdrop-blur-3xl animate-pulse">
            <StarIcon class="h-5 w-5 text-indigo-400 fill-indigo-400" />
            <span class="text-indigo-100 text-[10px] font-black tracking-[0.4em] uppercase italic">AYRICALIKLI DÜNYA</span>
          </div>
          
          <h1 class="text-6xl lg:text-9xl font-black text-white tracking-tightest leading-[0.85] uppercase">
            BAZARX <br>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-amber-400">PREMIUM</span>
          </h1>
          
          <p class="text-2xl text-gray-400 font-black mb-10 max-w-2xl mx-auto lg:mx-0 leading-tight tracking-tight uppercase opacity-80">
            ÜYELERİNE ÖZEL FIRSATLARIN VE HİZMETLERİN SUNULDUĞU BİR AVANTAJLAR DÜNYASI. ALIŞVERİŞ KEYFİNİ ZİRVEDE YAŞAYIN.
          </p>

          <div class="flex flex-wrap items-center justify-center lg:justify-start gap-8">
            <button class="px-12 py-7 bg-indigo-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_50px_rgba(79,70,229,0.3)] hover:bg-white hover:text-black hover:-translate-y-2 transition-all active:scale-95 group relative overflow-hidden" @click="$emit('cta')">
              <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              HEMEN PREMİUM'LU OL ✨
            </button>
            
            <div class="flex items-center gap-6">
              <div class="flex -space-x-4">
                <div v-for="i in 4" :key="i" :class="['w-14 h-14 rounded-full border-4 border-[#0a0a0c] bg-neutral-800 flex items-center justify-center text-[10px] font-black text-white shadow-2xl transition-transform hover:scale-110 cursor-pointer', i === 4 ? 'bg-indigo-600' : '']">
                  <span v-if="i === 4">+10K</span>
                  <UserIcon v-else class="h-6 w-6 opacity-40" />
                </div>
              </div>
              <span class="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] pt-1">10.000+ AKTİF ÜYE</span>
            </div>
          </div>
        </div>

        <!-- 3D Card Graphic -->
        <div class="flex-1 w-full max-w-lg lg:max-w-xl relative group">
          <div class="absolute inset-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-orange-500 rounded-[4rem] blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
          
          <div class="relative transform-gpu transition-all duration-700 group-hover:rotate-y-12 group-hover:scale-110" style="perspective: 1200px;">
            <div class="premium-card-3d relative">
              <img src="/images/ticaritakas-card.png" alt="BazarX Premium Card" class="w-full h-auto drop-shadow-[0_50px_100px_rgba(0,0,0,0.5)] rounded-[3rem]">
              <div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[3rem] overflow-hidden">
                <div class="premium-card-shine" />
              </div>
            </div>

            <!-- Holder Info -->
            <div class="absolute -bottom-10 -right-10 px-8 py-6 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-3xl shadow-2xl">
              <div class="flex items-center gap-5">
                <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <StarIcon class="h-7 w-7 text-white fill-white" />
                </div>
                <div>
                  <p class="text-[9px] text-indigo-400 font-black uppercase tracking-[0.3em] italic mb-1">KART SAHİBİ</p>
                  <p class="text-white font-black text-sm uppercase tracking-widest">{{ fullName || 'DEĞERLİ MÜŞTERİMİZ' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { StarIcon, UserIcon } from '@heroicons/vue/24/outline'
defineProps({ fullName: String })
defineEmits(['cta'])
</script>

<style scoped>
.premium-card-3d { transform-style: preserve-3d; }
.premium-card-shine {
  position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
  background: linear-gradient(45deg, transparent 15%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0.1) 70%, transparent 85%);
  animation: shine 3s ease-in-out infinite;
}
@keyframes shine { 0% { transform: translateX(-150%) translateY(-150%) rotate(45deg); } 100% { transform: translateX(150%) translateY(150%) rotate(45deg); } }
.rotate-y-12 { transform: rotateY(12deg); }
</style>
