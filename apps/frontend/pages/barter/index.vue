<template>
  <div class="min-h-screen bg-[#0f172a] text-white py-8 lg:py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden italic">
    <!-- Background Decor -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div class="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-[150px] animate-pulse" />
      <div class="absolute top-1/2 -right-32 w-[28rem] h-[28rem] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" />
      <div class="absolute -bottom-32 left-1/2 -translate-x-1/2 w-full h-[16rem] bg-indigo-600/5 rounded-full blur-[150px]" />
    </div>

    <div class="w-full relative z-10 space-y-16">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div class="space-y-3">
          <h1 class="text-5xl md:text-6xl font-black tracking-tightest italic uppercase text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-500 leading-none">BARTER <span class="text-white">HAVUZU</span></h1>
          <p class="text-indigo-200/40 font-black tracking-[0.4em] uppercase text-xs italic">TİCARİ TAKAS AĞINDA SINIRSIZ GÜÇ PROTOKOLÜ</p>
        </div>
        <button class="group bg-white/5 hover:bg-white/10 backdrop-blur-3xl border border-white/10 px-6 py-4 rounded-[1.2rem] transition-all duration-500 flex items-center gap-3 active:scale-95 shadow-2xl" @click="fetchInfo">
          <ArrowPathIcon :class="['h-5 w-5 text-indigo-400 group-hover:rotate-180 transition-transform duration-700', loading ? 'animate-spin' : '']" />
          <span class="text-[10px] font-black uppercase tracking-widest italic">VERİLERİ GÜNCELLE</span>
        </button>
      </div>

      <!-- Main Balance Summary -->
      <BarterSummaryCards :balance="auth.balance" :barter-balance="auth.barterBalance" :credit-limit="auth.barterCreditLimit" />

      <!-- XP Ecosystems -->
      <BarterXpCards :ad-XP="auth.adXP" :service-XP="auth.serviceXP" />

      <!-- Transaction Log -->
      <div class="space-y-10">
        <div class="flex items-center gap-5">
          <div class="w-2 h-8 bg-indigo-600 rounded-full shadow-2xl shadow-indigo-500/50" />
          <h2 class="text-2xl font-black uppercase tracking-tightest italic">İŞLEM <span class="text-indigo-400">DENETİMİ</span></h2>
        </div>
        <BarterTransactionList :transactions="currentTransactions" :loading="loading" v-model:active-tab="activeTab" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowPathIcon } from '@heroicons/vue/24/outline'
import BarterSummaryCards from '~/components/barter/BarterSummaryCards.vue'
import BarterXpCards from '~/components/barter/BarterXpCards.vue'
import BarterTransactionList from '~/components/barter/BarterTransactionList.vue'

definePageMeta({ layout: 'default', middleware: 'auth', hideSideAds: true })
useHead({ title: 'BARTER CÜZDANI // BAZARX' })

const { auth, loading, activeTab, currentTransactions, fetchInfo } = useBarterWallet()
</script>
