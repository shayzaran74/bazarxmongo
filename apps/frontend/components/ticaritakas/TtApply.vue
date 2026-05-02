<template>
  <section class="bg-[#000814] py-32 border-y border-white/5 relative overflow-hidden" id="apply">
    <!-- Dekoratif Arka Plan Doku/Işık -->
    <div class="absolute -right-20 -bottom-20 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
    <div class="absolute -left-20 -top-20 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none" />

    <div class="max-w-4xl mx-auto px-6 relative z-10">
      <div class="text-center mb-20 space-y-4">
        <span class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">AĞA KATILIN</span>
        <h2 class="text-5xl md:text-6xl font-black text-white tracking-tightest leading-none italic uppercase">
          BAŞVURU <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 underline decoration-blue-500/20">PROTOKOLÜ</span>
        </h2>
        <p class="text-slate-400 mt-6 font-medium text-lg">Ticari Takas ekosistemine katılmak için kurumsal bilgilerinizi doğrulayın.</p>
      </div>

      <div class="bg-[#001220] backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 lg:p-20 shadow-2xl relative overflow-hidden group">
        <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        
        <!-- Stepper -->
        <div class="flex justify-between mb-24 relative max-w-xl mx-auto">
          <div class="absolute top-6 left-0 w-full h-px bg-white/5 -z-0"></div>
          <div v-for="s in steps" :key="s.id" class="flex flex-col items-center gap-4 relative z-10">
            <div 
              class="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm transition-all duration-700 border"
              :class="activeStep === s.id ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_30px_rgba(59,130,246,0.4)] scale-110' : 'bg-[#000814] text-white/20 border-white/5'"
            >
              {{ s.id }}
            </div>
            <span class="text-[9px] font-black uppercase tracking-[0.3em] transition-colors" :class="activeStep === s.id ? 'text-blue-400' : 'text-white/20'">
              {{ s.label }}
            </span>
          </div>
        </div>

        <!-- Form -->
        <form @submit.prevent class="space-y-10">
          <div v-if="activeStep === 1" class="space-y-8 animate-in">
            <div class="grid md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Firma Kayıtlı Adı</label>
                <input 
                  type="text" 
                  class="w-full px-8 py-5 rounded-[1.5rem] border border-white/5 bg-[#000814] text-white placeholder-white/10 focus:bg-[#000814] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
                  placeholder="Ticaret A.Ş."
                />
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Vergi Numarası / VKN</label>
                <input 
                  type="text" 
                  class="w-full px-8 py-5 rounded-[1.5rem] border border-white/5 bg-[#000814] text-white placeholder-white/10 focus:bg-[#000814] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
                  placeholder="1234567890"
                />
              </div>
            </div>
            
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Ana Faaliyet Sektörü</label>
              <div class="relative">
                <select class="w-full px-8 py-5 rounded-[1.5rem] border border-white/5 bg-[#000814] text-white focus:border-blue-500/50 outline-none transition-all font-bold text-sm appearance-none">
                  <option class="bg-[#001220]">İmalat ve Endüstri</option>
                  <option class="bg-[#001220]">Profesyonel Hizmetler</option>
                  <option class="bg-[#001220]">Perakende ve Toptan Satış</option>
                  <option class="bg-[#001220]">Teknoloji ve Dijital</option>
                  <option class="bg-[#001220]">Lojistik ve Tedarik Zinciri</option>
                </select>
                <div class="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-blue-500">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Yetkili E-Posta Adresi</label>
              <input 
                type="email" 
                class="w-full px-8 py-5 rounded-[1.5rem] border border-white/5 bg-[#000814] text-white placeholder-white/10 focus:bg-[#000814] focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all font-bold text-sm" 
                placeholder="yonetim@firma.com"
              />
            </div>
          </div>

          <div v-else class="py-24 text-center animate-in">
            <div class="w-24 h-24 bg-blue-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-500/20 shadow-2xl">
              <svg class="w-12 h-12 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <p class="text-slate-400 font-black text-xs uppercase tracking-[0.3em] italic">Yönlendiriliyor...</p>
          </div>

          <button 
            type="button"
            @click="handleNext"
            class="w-full py-6 bg-blue-600 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-500 hover:shadow-[0_0_50px_rgba(59,130,246,0.3)] transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl shadow-blue-900/40"
          >
            FİNANSAL DETAYLARA DEVAM ET
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </button>
        </form>
      </div>

      <div class="mt-20 flex flex-col md:flex-row items-center justify-center gap-10 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white">ISO 27001 Certified</span>
        </div>
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path></svg>
          <span class="text-[9px] font-black uppercase tracking-[0.2em] text-white">Vergi Levhası Doğrulaması</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const activeStep = ref(1)
const steps = [
  { id: 1, label: 'KURUMSAL' },
  { id: 2, label: 'FİNANSAL' },
  { id: 3, label: 'KATMAN' }
]

const handleNext = () => {
  if (activeStep.value < 3) {
    activeStep.value++
  } else {
    navigateTo('/become-vendor')
  }
}
</script>

<style scoped>
.animate-in {
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
.tracking-tightest { letter-spacing: -0.05em; }
</style>
