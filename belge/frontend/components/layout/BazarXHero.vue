<template>
  <div
    class="relative w-full min-h-[400px] lg:min-h-[550px] overflow-hidden bg-slate-950 flex items-center justify-center"
  >
    <!-- Premium Image Background -->
    <div class="absolute inset-0 z-0">
      <img
        src="/images/hero-bg.png"
        class="w-full h-full object-cover opacity-60 scale-105 animate-slow-zoom"
        alt="Hero Background"
      >
      <!-- Gradient Overlays for Readability -->
      <div class="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90" />
      <div class="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-slate-950" />
    </div>

    <!-- Premium Background Effects Layer -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none z-10">
      <!-- Animated Gradient Orbs -->
      <div
        class="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse"
      />
      <div
        class="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-violet-600/20 rounded-full blur-[120px] animate-pulse delay-1000"
      />

      <!-- Tech Grid Pattern -->
      <div
        class="absolute inset-0 bg-[url('/grid-white.svg')] bg-[length:40px_40px] opacity-[0.03] [mask-image:radial-gradient(ellipse_at_center,black,transparent)]"
      />

      <!-- Floating Particles (Pseudo) -->
      <div class="absolute top-1/4 left-1/3 w-1 h-1 bg-white rounded-full animate-ping opacity-20" />
      <div
        class="absolute top-2/3 right-1/4 w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse opacity-30 delay-700"
      />
    </div>

    <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
      <!-- Badge -->
      <div
        class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-fade-in-up"
      >
        <span class="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
        <span class="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.3em]">{{ $t('hero.badge')
        }}</span>
      </div>

      <!-- Main Slogan -->
      <h2
        class="text-3xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tighter leading-[0.9] italic animate-title"
      >
        {{ $t('hero.titlePart1') }} <br>
        <span
          class="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 drop-shadow-3xl"
        >
          {{ $t('hero.titlePart2') }}
        </span>
      </h2>

      <!-- Description -->
      <p
        class="max-w-xl mx-auto text-slate-400 text-base md:text-lg font-medium mb-8 leading-relaxed opacity-0 animate-fade-in-up-delay"
      >
        {{ $t('hero.description') }}
      </p>

      <!-- CTA Buttons -->
      <div
        class="flex flex-col sm:flex-row items-center justify-center gap-6 opacity-0 animate-fade-in-up-delay-2"
      >
        <NuxtLink
          to="/products"
          class="group relative px-8 py-4 bg-white text-slate-950 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:shadow-indigo-500/40 overflow-hidden"
        >
          <span class="relative z-10 group-hover:text-white transition-colors duration-500">{{
            $t('hero.ctaStart') }}</span>
          <div
            class="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"
          />
        </NuxtLink>
        <NuxtLink
          to="/barter"
          class="px-8 py-4 bg-white/5 border border-white/10 backdrop-blur-xl text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
        >
          {{ $t('hero.ctaPool') }}
        </NuxtLink>
      </div>

      <!-- Stats or Features -->
      <div
        class="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8 opacity-0 animate-fade-in-up-delay-3"
      >
        <div class="group text-center">
          <div class="text-2xl font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">
            10K+
          </div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {{
              $t('hero.statActiveMembers') }}
          </div>
        </div>
        <div class="group text-center">
          <div class="text-2xl font-black text-white mb-1 group-hover:text-violet-400 transition-colors">
            ∞
          </div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {{
              $t('hero.statTradeOpportunity') }}
          </div>
        </div>
        <div class="group text-center">
          <div class="text-2xl font-black text-white mb-1 group-hover:text-purple-400 transition-colors">
            %100
          </div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {{
              $t('hero.statSafeBarter') }}
          </div>
        </div>
        <div class="group text-center">
          <div class="text-2xl font-black text-white mb-1 group-hover:text-pink-400 transition-colors">
            AI
          </div>
          <div class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {{
              $t('hero.statSmartMatching') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Decorative Elements -->
    <div class="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-slate-50 to-transparent" />
  </div>
</template>

<script setup>
import { useI18n } from '#imports'

useI18n()
</script>

<style scoped>
@keyframes slow-zoom {
    0% {
        transform: scale(1);
    }

    100% {
        transform: scale(1.1);
    }
}

.animate-slow-zoom {
    animation: slow-zoom 20s ease-in-out infinite alternate;
}

@keyframes title-reveal {
    0% {
        transform: translateY(50px) rotate(2deg);
        opacity: 0;
    }

    100% {
        transform: translateY(0) rotate(0);
        opacity: 1;
    }
}

@keyframes fade-in-up {
    0% {
        transform: translateY(20px);
        opacity: 0;
    }

    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

.animate-title {
    animation: title-reveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

.animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out forwards;
}

.animate-fade-in-up-delay {
    animation: fade-in-up 0.8s ease-out 0.4s forwards;
}

.animate-fade-in-up-delay-2 {
    animation: fade-in-up 0.8s ease-out 0.6s forwards;
}

.animate-fade-in-up-delay-3 {
    animation: fade-in-up 0.8s ease-out 0.8s forwards;
}
</style>
