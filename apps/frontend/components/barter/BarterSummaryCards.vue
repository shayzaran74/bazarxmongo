<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16 italic">
    <!-- Cash Balance -->
    <div class="group bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[3.5rem] hover:border-white/20 transition-all flex flex-col justify-between">
      <div class="flex items-center gap-6 mb-10">
        <div class="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/5">💰</div>
        <div>
          <p class="text-[10px] font-black text-indigo-200/40 uppercase tracking-widest leading-none">NAKİT HESAP</p>
          <h3 class="text-xl font-black text-white mt-1 uppercase italic">NAKİT BAKİYE</h3>
        </div>
      </div>
      <div class="space-y-6">
        <div class="flex items-baseline gap-3">
          <span class="text-5xl font-black tracking-tightest text-white">{{ formatNumber(balance) }}</span>
          <span class="text-lg font-black text-indigo-400 uppercase italic">TL</span>
        </div>
        <NuxtLink to="/wallet" class="block w-full text-center bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all">CÜZDANA GİT →</NuxtLink>
      </div>
    </div>

    <!-- Barter Balance -->
    <div class="lg:col-span-2 group relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-primary-600 p-10 md:p-14 rounded-[4rem] shadow-2xl shadow-indigo-500/20">
      <div class="absolute top-0 right-0 p-12 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700">
        <BanknotesIcon class="h-44 w-44 text-white" />
      </div>
      <div class="relative z-10 space-y-10">
        <p class="text-indigo-100 font-black uppercase tracking-[0.4em] text-xs opacity-80">BARTER BAKİYE PROTOKOLÜ</p>
        <div class="flex items-baseline gap-6">
          <span class="text-7xl md:text-9xl font-black tracking-tightest leading-none">{{ formatNumber(barterBalance) }}</span>
          <span class="text-3xl md:text-5xl font-black text-indigo-200 uppercase italic">PUAN</span>
        </div>
        <div class="flex flex-wrap gap-6 pt-4">
          <div class="bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
            <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1 opacity-60">KREDİ LİMİTİNİZ</p>
            <p class="text-2xl font-black">{{ formatNumber(creditLimit) }} <span class="text-xs ml-1">PUAN</span></p>
          </div>
          <div class="bg-white/10 backdrop-blur-3xl px-8 py-4 rounded-2xl border border-white/10 shadow-2xl">
            <p class="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1 opacity-60">KULLANILABİLİR</p>
            <p class="text-2xl font-black">{{ formatNumber(Number(barterBalance) + Number(creditLimit)) }} <span class="text-xs ml-1">PUAN</span></p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { BanknotesIcon } from '@heroicons/vue/24/outline'
defineProps({ balance: Number, barterBalance: Number, creditLimit: Number })
const formatNumber = (n) => new Intl.NumberFormat('tr-TR').format(n || 0)
</script>
