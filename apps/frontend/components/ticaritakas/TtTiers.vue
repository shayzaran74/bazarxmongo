<template>
  <section class="relative py-32 bg-[#000814] overflow-hidden" id="tiers">
    <!-- Dekoratif Arka Plan Parçaları -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
    <div class="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[150px] pointer-events-none" />

    <div class="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
      <div class="text-center mb-24 space-y-4">
        <span class="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black text-[10px] uppercase tracking-[0.3em] mb-4">ÜYELİK MODELLERİ</span>
        <h2 class="text-5xl md:text-7xl font-black text-white tracking-tightest leading-none italic uppercase">
          STRATEJİK <br/>
          <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">KATMANLAR</span>
        </h2>
        <p class="text-slate-400 mt-6 max-w-2xl mx-auto font-medium text-lg">
          İşletmenizin ölçeğine ve takas hacmine göre optimize edilmiş, kurumsal büyümenizi destekleyen profesyonel üyelik paketleri.
        </p>
      </div>

      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        <!-- TIER CARD COMPONENT (Inline for simplicity but high quality) -->
        <div 
          v-for="tier in tiers" 
          :key="tier.name"
          class="relative flex flex-col p-1 rounded-[2.5rem] transition-all duration-500 hover:scale-[1.02] group"
          :class="tier.featured ? 'bg-gradient-to-b from-blue-500 to-indigo-600 shadow-[0_0_50px_-12px_rgba(59,130,246,0.5)]' : 'bg-white/5 border border-white/10'"
        >
          <div class="flex-1 bg-[#001220] rounded-[2.3rem] p-8 flex flex-col relative overflow-hidden">
            <!-- Glass effect overlay -->
            <div class="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none" />
            
            <!-- Badge -->
            <div v-if="tier.featured" class="absolute top-6 right-6 bg-white text-[#001220] text-[9px] font-black px-3 py-1 rounded-full tracking-widest uppercase shadow-xl">
              EN POPÜLER
            </div>

            <!-- Header -->
            <div class="mb-8 relative z-10">
              <div class="text-blue-400 font-black tracking-widest text-[9px] mb-3 uppercase opacity-70">{{ tier.label }}</div>
              <h4 class="text-3xl font-black text-white mb-2 italic">{{ tier.name }}</h4>
              <div class="flex items-baseline gap-1">
                <span class="text-4xl font-black text-white">{{ tier.price }}</span>
                <span class="text-xs font-bold text-slate-500 uppercase tracking-widest">₺ / YIL</span>
              </div>
            </div>

            <!-- Features -->
            <ul class="space-y-5 mb-10 flex-grow relative z-10">
              <li v-for="f in tier.features" :key="f" class="flex items-center gap-3 text-sm text-slate-300 font-medium group/item">
                <div class="h-5 w-5 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 transition-colors group-hover/item:bg-blue-500/20">
                  <svg class="h-3 w-3 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
                {{ f }}
              </li>
            </ul>

            <!-- CTA -->
            <button 
              class="w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all relative z-10 active:scale-95 overflow-hidden"
              :class="tier.featured 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/40 hover:bg-blue-500' 
                : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'"
            >
              {{ tier.name }} SEÇ
            </button>
          </div>
        </div>
      </div>

      <!-- Trust Badges / Footer Info -->
      <div class="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-50">
        <div class="flex items-center gap-8">
          <img src="https://img.icons8.com/ios-filled/50/ffffff/visa.png" class="h-6 grayscale" alt="Visa">
          <img src="https://img.icons8.com/ios-filled/50/ffffff/mastercard.png" class="h-8 grayscale" alt="Mastercard">
          <img src="https://img.icons8.com/ios-filled/50/ffffff/stripe.png" class="h-8 grayscale" alt="Stripe">
        </div>
        <p class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Kredi Kartı ile 12 Taksit İmkanı & Güvenli Ödeme</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const tiers = [
  {
    name: 'CORE',
    label: 'GİRİŞ SEVİYESİ',
    price: '12.000',
    featured: false,
    features: [
      '%8 Komisyon Oranı',
      'Standart TrustScore™',
      'Temel Pazaryeri Erişimi',
      'Aylık Raporlama'
    ]
  },
  {
    name: 'PRIME',
    label: 'BÜYÜME ODAKLI',
    price: '48.000',
    featured: false,
    features: [
      '%6 Komisyon Oranı',
      'Öncelikli Listeleme',
      'Özel Destek Hattı',
      'Haftalık Analizler'
    ]
  },
  {
    name: 'ELITE',
    label: 'İLERİ SEVİYE',
    price: '120.000',
    featured: true,
    features: [
      '%4 Komisyon Oranı',
      'Elite Doğrulanmış Rozeti',
      'VIP Network Etkinlikleri',
      'Smart Cap Yönetimi'
    ]
  },
  {
    name: 'APEX',
    label: 'KURUMSAL GÜÇ',
    price: '300.000',
    featured: false,
    features: [
      '%2 Komisyon Oranı',
      'Watchtower Yönetişimi',
      'Sınırsız Takas Limiti',
      'Dedike Portföy Yöneticisi'
    ]
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');

section {
  font-family: 'Inter', sans-serif;
}

.tracking-tightest {
  letter-spacing: -0.04em;
}
</style>
