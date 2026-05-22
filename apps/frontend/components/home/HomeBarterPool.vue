<template>
  <div
    v-if="show === 'true'"
    v-motion
    :initial="{ opacity: 0, y: 32, filter: 'blur(14px)' }"
    :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 750, ease: [0.25, 0.46, 0.45, 0.94] } }"
    class="w-full bg-md3-primary py-10 md:py-16 relative overflow-hidden group mb-8 md:mb-12"
  >
    <!-- Organic Animated Backgrounds -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none">
      <div
        class="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary-600/20 rounded-full blur-[120px] animate-pulse"
      />
      <div
        class="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-accent-500/10 rounded-full blur-[120px] animate-pulse delay-1000"
      />
      <div
        class="absolute inset-0 bg-[url('/grid-white.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-5 text-white"
      />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="flex flex-col lg:flex-row items-center gap-12 md:gap-20">
        <div
          v-motion
          :initial="{ opacity: 0, x: -28, filter: 'blur(10px)' }"
          :visible-once="{ opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 700, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="lg:w-1/2 text-center lg:text-left"
        >
          <div
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-300 text-xs font-black uppercase tracking-widest mb-6 backdrop-blur-xl"
          >
            <CurrencyDollarIcon class="h-4 w-4 animate-bounce" />
            {{ $t('barterPool.badge') }}
          </div>
          <h2 class="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter leading-[0.9] uppercase italic">
            {{ $t('barterPool.title') }}
            <span class="text-primary-500">{{ $t('barterPool.subtitle') }}</span>
          </h2>
          <p class="text-slate-400 text-base md:text-lg mb-8 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
            {{ $t('barterPool.description') }}
          </p>
          <div class="flex flex-wrap gap-5 justify-center lg:justify-start">
            <NuxtLink
              to="/barter"
              class="relative group/btn overflow-hidden bg-white text-slate-950 px-10 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all transform active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-primary-500/30"
            >
              <span class="relative z-10 group-hover/btn:text-white transition-colors duration-500">{{
                $t('barterPool.explore') }}</span>
              <div
                class="absolute inset-0 bg-gradient-to-r from-primary-container to-primary-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"
              />
            </NuxtLink>
            <NuxtLink
              to="/help"
              class="bg-slate-800/50 text-white border-2 border-slate-700/50 px-8 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-700/80 transition-all backdrop-blur-xl"
            >
              {{ $t('barterPool.howItWorks') }}
            </NuxtLink>
          </div>
        </div>

        <div
          v-motion
          :initial="{ opacity: 0, x: 28, filter: 'blur(10px)' }"
          :visible-once="{ opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
          class="lg:w-1/2 grid grid-cols-2 gap-5 relative"
        >
          <div
            class="bg-slate-900/50 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-white/5 hover:border-primary-500/30 transition-all hover:-translate-y-4 shadow-2xl group/card"
          >
            <div
              class="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4 group-hover/card:bg-primary-500 transition-colors"
            >
              <ArrowPathIcon class="h-6 w-6 text-primary-400 group-hover/card:text-white" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2 uppercase tracking-tight">
              {{ $t('barterPool.unlimitedTrade')
              }}
            </h3>
            <p class="text-[0.7rem] text-slate-400 leading-relaxed font-bold uppercase tracking-wide">
              {{
                $t('barterPool.unlimitedTradeDesc') }}
            </p>
          </div>
          <div
            class="bg-slate-900/50 backdrop-blur-2xl p-5 rounded-[1.5rem] border border-white/5 hover:border-primary-500/30 transition-all hover:-translate-y-4 shadow-2xl mt-10 group/card"
          >
            <div
              class="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mb-4 group-hover/card:bg-primary-500 transition-colors"
            >
              <ShieldCheckIcon class="h-6 w-6 text-primary-400 group-hover/card:text-white" />
            </div>
            <h3 class="text-lg font-bold text-white mb-2 uppercase tracking-tight">
              {{ $t('barterPool.secureCredit') }}
            </h3>
            <p class="text-[0.7rem] text-slate-400 leading-relaxed font-bold uppercase tracking-wide">
              {{
                $t('barterPool.secureCreditDesc') }}
            </p>
          </div>

          <!-- Float Effect Element -->
          <div
            class="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/30 rounded-full blur-[40px] opacity-30 animate-pulse"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CurrencyDollarIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

defineProps<{
  show?: string
}>()
</script>
