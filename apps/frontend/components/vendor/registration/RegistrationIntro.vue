<template>
  <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div>
        <h2 class="text-3xl font-bold text-neutral-900 mb-6 font-display italic uppercase">
          BazarX'te Satış Yapmanın Ayrıcalıkları
        </h2>
        <div class="space-y-6">
          <div v-for="(benefit, i) in benefits" :key="i" class="flex gap-4 group">
            <div class="flex-shrink-0 w-12 h-12 bg-primary-50 text-primary-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform shadow-sm">
              {{ benefit.icon }}
            </div>
            <div>
              <h4 class="font-black text-neutral-900 text-sm uppercase italic">{{ benefit.title }}</h4>
              <p class="text-xs font-bold text-neutral-500 leading-relaxed uppercase">{{ benefit.desc }}</p>
            </div>
          </div>
        </div>
      </div>
      <div class="bg-primary-50 rounded-3xl p-8 border border-primary-100 flex flex-col items-center text-center shadow-inner">
        <div class="w-32 h-32 bg-white rounded-3xl shadow-xl flex items-center justify-center text-5xl mb-6 transform -rotate-6">
          🛍️
        </div>
        <p class="text-primary-900 font-black italic text-lg leading-relaxed uppercase tracking-tighter">
          "BazarX ile satışlarım %300 arttı! İşimi dijital dünyada bu kadar kolay büyütebileceğimi hayal etmezdim."
        </p>
        <p class="text-primary-600 font-black mt-4 uppercase tracking-widest text-[10px] italic">
          - Elif Y., Butik Mağaza Sahibi
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
const benefits = [
  { icon: '🚀', title: 'Hızlı Başlangıç', desc: 'Dakikalar içinde mağazanızı açın ve ürünlerinizi milyonlara ulaştırın.' },
  { icon: '🏠', title: 'Esnek Yönetim', desc: 'İşinizi dilediğiniz yerden, dilediğiniz zaman BazarX paneliyle yönetin.' },
  { icon: '💳', title: 'Güvenli Tahsilat', desc: 'Ödemeleriniz koruma altında, haftalık periyotlarla hesabınızda.' },
  { icon: '📊', title: 'Gelişmiş Analitik', desc: 'Detaylı raporlarla satışlarınızı ve stoklarınızı anlık takip edin.' }
]
</script>
