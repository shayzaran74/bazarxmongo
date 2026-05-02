<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Query params'dan gelen veriler
const offerId = route.query.id || '#TRX-9942'
const partnerName = route.query.partner || 'Kurumsal Satıcı'
const amount = route.query.amount || '0'
const xpEarned = route.query.xp || '240'
</script>

<template>
  <div class="min-h-screen bg-[#002444]/40 backdrop-blur-sm flex items-center justify-center p-6">
    <main class="w-full max-w-[560px] bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(26,58,92,0.25)] overflow-hidden relative border border-slate-100 animate-in">
      <!-- Decorative Background -->
      <div class="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none"></div>
      
      <div class="px-12 pt-12 pb-8 flex flex-col items-center text-center">
        <!-- Success Icon (SVG) -->
        <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 shadow-sm border border-green-100">
          <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-white">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
        </div>
        
        <!-- Headline & Subtext -->
        <h1 class="text-3xl font-black text-[#002444] mb-3">Teklif Başarıyla İletildi</h1>
        <p class="text-slate-500 font-medium max-w-[400px] leading-relaxed text-sm">
          İş ortağınız teklifi inceleyip size dönüş yapacaktır. İşleminiz <span class="font-black text-blue-600 uppercase tracking-widest text-[10px]">Watchtower</span> denetiminde güvence altındadır.
        </p>
      </div>

      <!-- Summary Card -->
      <div class="px-12 pb-6">
        <div class="bg-slate-50 rounded-3xl border border-slate-100 p-6 space-y-4">
          <div class="flex justify-between items-center pb-3 border-b border-slate-200/60">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Takip Kodu</span>
            <span class="text-sm font-black text-[#002444]">{{ offerId }}</span>
          </div>
          <div class="flex justify-between items-center py-1 border-b border-slate-200/60">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alıcı Kurum</span>
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-full bg-[#002444] flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                </svg>
              </div>
              <span class="text-sm font-black text-[#002444]">{{ partnerName }}</span>
            </div>
          </div>
          <div class="flex justify-between items-center pt-3">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Teklif Tutarı</span>
            <span class="text-lg font-black text-green-600">{{ amount }} TL</span>
          </div>
        </div>
      </div>

      <!-- XP Reward Card -->
      <div class="px-12 pb-10">
        <div class="flex items-center gap-4 bg-amber-50 rounded-2xl p-5 border border-amber-100/50">
          <div class="w-12 h-12 rounded-xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/20 text-amber-900">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <div>
            <p class="font-black text-[#002444] text-xs uppercase tracking-tight">Kazanılan XP</p>
            <p class="text-[13px] text-amber-800 font-medium">Bu işlemden <span class="font-black text-amber-900">+{{ xpEarned }} XP</span> kazanacaksınız.</p>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="px-12 pb-10 flex flex-col gap-3">
        <button @click="router.push('/ticaritakas/b2b-dashboard')" class="w-full bg-[#002444] text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3">
          <span>Teklif Detayına Git</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
        <button @click="router.push('/ticaritakas/b2b-dashboard')" class="w-full bg-white text-[#002444] border-2 border-slate-100 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 transition-all active:scale-95">
          Panele Dön
        </button>
      </div>

      <!-- Trust Indicator Footer -->
      <div class="bg-slate-50 py-4 flex justify-center items-center gap-2 text-slate-400 border-t border-slate-100">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span class="text-[9px] font-black uppercase tracking-[0.15em]">Uçtan uca şifreli ve güvenceli ticaret platformu</span>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation: scaleIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95) translateY(10px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
