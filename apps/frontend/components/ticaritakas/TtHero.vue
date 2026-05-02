<template>
  <section class="relative overflow-hidden py-32 lg:py-48 bg-[#000814]">
    <!-- Animated Glow -->
    <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
    <div class="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

    <div class="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-20 items-center relative z-10">
      <!-- Left Content -->
      <div class="space-y-10">
        <div class="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span class="text-blue-400 font-black text-[10px] tracking-[0.3em] uppercase">B2B TİCARET YENİDEN TANIMLANIYOR</span>
        </div>

        <h1 class="text-6xl lg:text-8xl font-black leading-[0.9] tracking-tightest text-white italic uppercase">
          NAKİTE <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 underline decoration-blue-500/20">GEREK YOK</span>
        </h1>

        <p class="text-slate-400 text-xl max-w-lg leading-relaxed font-medium">
          Atıl stoklarınızı ve kapasitenizi, dünyanın en güvenli B2B takas ekosisteminde likiditeye dönüştürün.
        </p>

        <!-- Stats -->
        <div class="grid grid-cols-3 gap-6">
          <div v-for="s in stats" :key="s.label" class="space-y-1">
            <div class="text-3xl font-black text-white italic">{{ s.value }}</div>
            <div class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">{{ s.label }}</div>
          </div>
        </div>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap gap-6 pt-4">
          <NuxtLink
            to="/ticaritakas/b2b-dashboard"
            class="px-10 py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-2xl shadow-blue-900/40 active:scale-95 flex items-center gap-3"
          >
            B2B DASHBOARD
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </NuxtLink>
          <NuxtLink
            to="/become-vendor"
            class="px-10 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white/10 transition-all active:scale-95"
          >
            HEMEN BAŞVUR
          </NuxtLink>
        </div>
      </div>

      <!-- Right Visual -->
      <div class="hidden lg:block relative group">
        <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-[3rem] blur-2xl opacity-10 group-hover:opacity-20 transition-opacity" />
        <div class="relative bg-[#001220] p-4 rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2574&auto=format&fit=crop"
            alt="B2B Ecosystem"
            class="rounded-[2.8rem] w-full h-[540px] object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700"
          >
          <!-- Floating Badge -->
          <div class="absolute bottom-12 left-12 bg-white/10 backdrop-blur-2xl p-6 rounded-3xl border border-white/10 shadow-2xl flex items-center gap-5">
            <div class="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <div>
              <div class="text-white font-black text-xl italic uppercase tracking-tighter">TRUSTSCORE™ 9.8</div>
              <div class="text-blue-400 text-[10px] font-black uppercase tracking-widest mt-1">EKOSİSTEM GÜVENLİK PUANI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const stats = [
  { value: '12.4K+', label: 'Kayıtlı Firma' },
  { value: '98%', label: 'Memnuniyet' },
  { value: '34+', label: 'Sektör' },
]
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.05em; }
</style>
