<template>
  <div class="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-[#000814]/80 backdrop-blur-2xl">
    <div class="relative w-full max-w-2xl bg-[#001220] rounded-[3rem] border border-white/10 shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)] overflow-hidden p-12 text-center italic">
      <!-- Background Glow -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />
      
      <div class="relative z-10 space-y-8">
        <!-- Icon -->
        <div class="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500">
          <svg class="h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
          </svg>
        </div>

        <div class="space-y-4">
          <h2 class="text-4xl md:text-5xl font-black text-white tracking-tightest leading-none uppercase italic">
            KURUMSAL <br/>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 underline decoration-blue-500/30">DOĞRULAMA GEREKLİ</span>
          </h2>
          <p class="text-slate-400 font-medium text-lg max-w-md mx-auto leading-relaxed">
            Ticari Takas Ekosistemi sadece doğrulanmış satıcılar ve firma sahipleri içindir.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <NuxtLink 
            v-if="!isAuthenticated"
            to="/login" 
            class="flex items-center justify-center px-8 py-5 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
          >
            GİRİŞ YAP
          </NuxtLink>
          <NuxtLink 
            to="/become-vendor" 
            class="flex items-center justify-center px-8 py-5 bg-white/5 text-white border border-white/10 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
          >
            FİRMA SAHİBİ OL
          </NuxtLink>
          <button 
            v-if="isAuthenticated"
            @click="$router.push('/')"
            class="sm:col-span-2 flex items-center justify-center px-8 py-5 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:text-white transition-all"
          >
            ANA SAYFAYA DÖN
          </button>
        </div>

        <p class="text-[9px] font-black text-slate-500 uppercase tracking-widest pt-4">BAZARX B2B GÜVENLİK PROTOKOLÜ v4.0</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.tracking-tightest {
  letter-spacing: -0.04em;
}
</style>
