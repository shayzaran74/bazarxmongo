<template>
  <section class="py-32 bg-[#000814]">
    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative overflow-hidden">
      <!-- Glow decoration -->
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />

      <div class="grid lg:grid-cols-2 gap-24 items-center relative z-10">
        <div class="space-y-10">
          <div class="space-y-4">
            <span class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4 italic">GÜVENLİK</span>
            <h2 class="text-5xl md:text-6xl font-black text-white tracking-tightest leading-none italic uppercase">
              GÜVEN <br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 underline decoration-blue-500/20">EKOSİSTEMİ</span>
            </h2>
            <p class="text-slate-400 text-xl leading-relaxed font-medium pt-4">
              Çift katmanlı itibar sistemimiz, her katılımcının kurumsal güvenilirlik ve etik standartlara uyumunu en üst düzeyde garanti eder.
            </p>
          </div>
          
          <div class="space-y-6">
            <!-- TrustScore -->
            <div class="flex gap-8 p-10 rounded-[3rem] bg-[#001220] border border-white/5 group hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div class="w-20 h-20 shrink-0 bg-blue-600/10 rounded-3xl flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-110 group-hover:bg-blue-600/20 transition-all">
                <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              </div>
              <div>
                <h4 class="text-2xl font-black text-white mb-3 italic uppercase tracking-tighter">TrustScore™</h4>
                <p class="text-slate-400 leading-relaxed font-medium">
                  Geçmiş işlem tamamlama oranları ve ödeme hızıyla hesaplanan dinamik itibar metriği.
                </p>
              </div>
            </div>

            <!-- XP Progression -->
            <div class="flex gap-8 p-10 rounded-[3rem] bg-[#001220] border border-white/5 group hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-700 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
              <div class="w-20 h-20 shrink-0 bg-indigo-600/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:bg-indigo-600/20 transition-all">
                <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
              </div>
              <div>
                <h4 class="text-2xl font-black text-white mb-3 italic uppercase tracking-tighter">XP Gelişimi</h4>
                <p class="text-slate-400 leading-relaxed font-medium">
                  Başarılı takaslar ile Deneyim Puanı kazanın, ekosistem düzeyinde yeni avantajların kilidini açın.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ: Güvenlik Mimarisi Paneli -->
        <div class="relative group">
          <div class="bg-[#001220] rounded-[4rem] p-12 lg:p-16 text-white overflow-hidden relative shadow-2xl border border-white/5 group-hover:shadow-blue-500/20 transition-all duration-700">
            <div class="relative z-10">
              <h5 class="text-3xl font-black mb-16 flex items-center gap-6 italic uppercase tracking-tighter">
                <div class="w-16 h-16 rounded-[1.5rem] bg-blue-600/10 flex items-center justify-center border border-blue-500/20 shadow-2xl">
                  <svg class="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </div>
                Güvenlik Mimarisi
              </h5>
              
              <div class="space-y-10">
                <div v-for="item in securityItems" :key="item.label" class="flex items-center gap-6 group/item">
                  <div class="relative">
                    <div class="w-3.5 h-3.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                    <div class="absolute inset-0 w-3.5 h-3.5 rounded-full bg-blue-500 animate-ping opacity-40"></div>
                  </div>
                  <span class="font-black text-xl text-white group-hover/item:text-blue-400 transition-colors italic uppercase tracking-tighter">{{ item.label }}</span>
                  <div class="flex-grow border-b border-white/10 border-dotted mb-1"></div>
                  <span class="text-[9px] font-black text-blue-400 tracking-[0.3em] uppercase bg-blue-500/10 px-4 py-2 rounded-xl border border-blue-500/20 shadow-sm">{{ item.status }}</span>
                </div>
              </div>

              <!-- Canlı Güvenlik Akışı -->
              <div class="mt-20 bg-black/40 rounded-[3rem] p-10 border border-white/5 backdrop-blur-3xl shadow-inner relative overflow-hidden">
                <div class="absolute top-0 right-0 p-8 opacity-10">
                  <svg class="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                </div>
                <div class="text-[10px] font-black text-blue-400 mb-8 uppercase tracking-[0.5em] flex items-center gap-4 relative z-10">
                  <span class="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.6)]"></span>
                  SİSTEM GÜVENLİK AKIŞI
                </div>
                <div class="space-y-5 font-mono text-[13px] leading-relaxed relative z-10">
                  <p class="flex gap-4 text-white/40"><span class="text-blue-500 font-bold">></span> <span class="text-white/80 font-medium">Takas sözleşmesi</span> <span class="text-blue-400 font-bold">88x...4b</span> doğrulandı</p>
                  <p class="flex gap-4 text-white/40"><span class="text-blue-500 font-bold">></span> <span class="text-white/80 font-medium">TrustScore güncellendi:</span> <span class="text-indigo-400 font-bold">Corp_Prime_02</span></p>
                  <p class="flex gap-4 text-white/40"><span class="text-blue-500 font-bold">></span> <span class="text-white/80 font-medium">Watchtower taraması:</span> <span class="text-blue-400 font-bold">0 risk bulundu</span></p>
                </div>
              </div>
            </div>
            
            <div class="absolute -right-32 -bottom-32 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const securityItems = [
  { label: 'Watchtower Güvenliği', status: 'AKTİF' },
  { label: 'Denetimli Takas Havuzu', status: 'ŞİFRELENDİ' },
  { label: 'B2B İşlem Doğrulama', status: 'DOĞRULANDI' },
  { label: 'Escrow Koruma Sistemi', status: 'GÜVENLİ' }
]
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.05em; }
.no-scrollbar::-webkit-scrollbar { display: none; }
</style>
