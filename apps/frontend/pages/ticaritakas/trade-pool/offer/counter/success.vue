<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const partnerName = ref(route.query.partner || 'Global Gastronomy Ltd.')
const amount = ref(route.query.amount || '1.250.000')
const ratio = ref(route.query.ratio || '%40 / %60')
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-6 justify-between shadow-sm">
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-black text-[#002444] tracking-tight">TicariTakas</h1>
        <nav class="hidden md:flex gap-6 items-center text-sm font-bold text-slate-400">
          <a href="#" class="hover:text-[#002444] transition-colors uppercase tracking-widest">Panel</a>
          <a href="#" class="text-[#002444] border-b-2 border-[#002444] pb-1 uppercase tracking-widest">Teklifler</a>
          <a href="#" class="hover:text-[#002444] transition-colors uppercase tracking-widest">Barter Havuzu</a>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <button class="p-2 rounded-full hover:bg-slate-50 text-slate-400"><span class="material-symbols-outlined">notifications</span></button>
        <button class="bg-[#002444] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Yeni İlan</button>
      </div>
    </header>

    <main class="flex-1 p-6 md:p-12 flex justify-center items-center">
      <div class="max-w-3xl w-full">
        <!-- Success Card -->
        <div class="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(26,58,92,0.05)] p-10 md:p-16 text-center border border-slate-100 relative overflow-hidden">
          <!-- Success Header -->
          <div class="mb-12">
            <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8 border border-green-100">
              <span class="material-symbols-outlined text-green-500 text-6xl" style="font-variation-settings: 'FILL' 1;">check_circle</span>
            </div>
            <h1 class="text-4xl font-black text-[#002444] mb-4">Karşı Teklifiniz Başarıyla İletildi</h1>
            <p class="text-slate-500 font-medium max-w-lg mx-auto">
              Teklifiniz karşı taraf olan <span class="font-black text-[#002444]">{{ partnerName }}</span> yetkililerine ulaştırılmıştır.
            </p>
          </div>

          <!-- Bento Summary Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 text-left">
            <!-- Countdown Card -->
            <div class="bg-slate-50 p-8 rounded-3xl border border-slate-100">
              <div class="flex items-center gap-3 mb-3">
                <span class="material-symbols-outlined text-amber-600">schedule</span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">DEĞERLENDİRME SÜRESİ</span>
              </div>
              <p class="text-2xl font-black text-[#002444] mb-1">72 Saat</p>
              <p class="text-[11px] text-slate-400 font-bold uppercase tracking-wide">Yanıt Beklenmektedir</p>
            </div>

            <!-- Summary Detail Card -->
            <div class="bg-[#002444] p-8 rounded-3xl text-white shadow-xl shadow-blue-900/20">
              <div class="flex items-center gap-3 mb-3">
                <span class="material-symbols-outlined text-blue-300">balance</span>
                <span class="text-[10px] font-black text-blue-300 uppercase tracking-widest">REVİZE DENGE</span>
              </div>
              <div class="flex justify-between items-end">
                <div>
                  <p class="text-[10px] opacity-70 font-bold uppercase tracking-wider mb-1">Nakit / Barter</p>
                  <p class="text-2xl font-black">{{ ratio }}</p>
                </div>
                <div class="text-right">
                  <p class="text-[10px] opacity-70 font-bold uppercase tracking-wider mb-1">Toplam Bedel</p>
                  <p class="text-2xl font-black">{{ amount }} ₺</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Watchtower Section -->
          <div class="flex items-center justify-center gap-6 py-5 px-8 mb-12 bg-slate-50 border border-dashed border-slate-200 rounded-3xl">
            <span class="material-symbols-outlined text-[#002444] text-3xl">security</span>
            <div class="text-left">
              <p class="text-[10px] font-black text-[#002444] tracking-[0.2em] uppercase mb-1">WATCHTOWER GÜVENCESİ</p>
              <p class="text-[11px] text-slate-500 font-medium">Bu işlem 256-bit şifreleme ve Watchtower ticaret protokolü ile korunmaktadır.</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex flex-col md:flex-row gap-4 justify-center">
            <button @click="router.push('/ticaritakas/b2b-dashboard')" class="bg-[#002444] text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3">
              Teklif Detayına Git
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
            <button @click="router.push('/ticaritakas/b2b-dashboard')" class="bg-white text-[#002444] border-2 border-slate-100 px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-50 active:scale-95 transition-all">
              Panele Dön
            </button>
          </div>

          <!-- Decorative Background element -->
          <div class="absolute -top-12 -right-12 w-48 h-48 bg-green-500/5 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-12 -left-12 w-48 h-48 bg-[#002444]/5 rounded-full blur-3xl"></div>
        </div>

        <!-- Contextual Hint -->
        <p class="mt-8 text-center text-xs text-slate-400 font-bold uppercase tracking-widest">
          Bir sorunuz mu var? <a href="#" class="text-[#002444] underline decoration-2 underline-offset-4">Destek Merkezi</a> üzerinden bizimle iletişime geçebilirsiniz.
        </p>
      </div>
    </main>
  </div>
</template>
