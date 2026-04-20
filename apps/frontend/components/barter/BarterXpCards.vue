<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-20 italic">
    <!-- Advertising -->
    <div class="group relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] hover:border-white/20 transition-all flex flex-col justify-between">
      <div class="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <MegaphoneIcon class="h-44 w-44 text-indigo-400 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>
      <div class="relative z-10 space-y-8">
        <div class="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center shadow-2xl">
          <MegaphoneIcon class="h-8 w-8 text-purple-400" />
        </div>
        <div>
          <h3 class="text-indigo-200/60 font-black uppercase tracking-widest text-[10px] mb-2 leading-none">REKLAM BAKİYESİ</h3>
          <div class="flex items-baseline gap-3">
            <span class="text-5xl font-black tracking-tightest text-white leading-none">{{ formatNumber(adXP) }}</span>
            <span class="text-xl font-black text-indigo-200 uppercase italic">XP</span>
          </div>
        </div>
        <p class="text-rose-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          KULLANILMAZSA SIFIRLANACAK
        </p>
        <button class="w-full bg-white/5 hover:bg-indigo-600 hover:text-white border border-white/10 text-indigo-200 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">KULLAN →</button>
      </div>
    </div>

    <!-- System/Service -->
    <div class="group relative overflow-hidden bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] hover:border-white/20 transition-all flex flex-col justify-between">
      <div class="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
        <ShoppingBagIcon class="h-44 w-44 text-emerald-400 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
      </div>
      <div class="relative z-10 space-y-8">
        <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center shadow-2xl">
          <ShoppingBagIcon class="h-8 w-8 text-emerald-400" />
        </div>
        <div>
          <h3 class="text-indigo-200/60 font-black uppercase tracking-widest text-[10px] mb-2 leading-none">ÖZEL HİZMET & GİDER</h3>
          <div class="flex items-baseline gap-3">
            <span class="text-5xl font-black tracking-tightest text-white leading-none">{{ formatNumber(serviceXP) }}</span>
            <span class="text-xl font-black text-indigo-200 uppercase italic">XP</span>
          </div>
        </div>
        <p class="text-emerald-400 text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-2 italic">
          <span class="w-2 h-2 rounded-full bg-emerald-500" />
          HİZMET VE GİDER ÖDEMELERİ
        </p>
        <button class="w-full bg-white/5 hover:bg-emerald-600 hover:text-white border border-white/10 text-emerald-400 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">SATIN AL →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MegaphoneIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline'
defineProps({ adXP: Number, serviceXP: Number })
const formatNumber = (n) => new Intl.NumberFormat('tr-TR').format(n || 0)
</script>
