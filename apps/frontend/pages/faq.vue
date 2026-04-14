<template>
  <div class="max-w-4xl mx-auto py-12 px-4 space-y-16">
    <div class="text-center space-y-4">
      <h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">Yardım & SSS</h1>
      <p class="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
        BazarX hakkında en çok sorulan soruların cevaplarını burada bulabilirsiniz.
      </p>
    </div>

    <!-- FAQ Categories -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <button v-for="cat in categories" :key="cat" class="px-6 py-4 bg-white border border-gray-100 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-primary-500 hover:text-primary-600 transition-all shadow-sm">
        {{ cat }}
      </button>
    </div>

    <!-- Accordion Placeholder -->
    <div class="space-y-4">
      <div v-for="(item, index) in faqs" :key="index" class="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
        <button class="w-full px-8 py-6 text-left flex items-center justify-between group">
          <span class="text-lg font-display font-black text-dark-950 italic tracking-tight">{{ item.q }}</span>
          <div class="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
            <Icon name="heroicons:chevron-down" class="w-4 h-4" />
          </div>
        </button>
        <!-- Answer hidden in placeholder -->
        <div v-if="index === 0" class="px-8 pb-8 text-gray-400 font-medium text-sm leading-relaxed">
          {{ item.a }}
        </div>
      </div>
    </div>

    <!-- Support CTA -->
    <div class="bg-dark-950 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
      <div class="absolute inset-0 bg-mesh opacity-10" />
      <div class="relative z-10 space-y-6">
        <h2 class="text-3xl font-display font-black text-white italic tracking-tighter">Hala Cevap Bulamadınız mı?</h2>
        <p class="text-gray-400 font-medium max-w-sm mx-auto">Destek ekibimiz 7/24 yanınızda. Bize dilediğiniz zaman ulaşabilirsiniz.</p>
        <NuxtLink to="/contact" class="inline-block px-10 py-5 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl">
          Destek Talebi Oluştur
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const categories = ['Genel', 'Güvenlik', 'Ödemeler', 'Takas Süreci'];

const faqs = [
  { 
    q: 'BazarX tam olarak nasıl çalışır?', 
    a: 'BazarX, işletmelerin ve bireylerin atıl kapasitelerini veya ürünlerini, nakit kullanmadan takas etmelerini sağlayan gelişmiş bir platformdur. Platformumuzda hem doğrudan ürün-ürün takası hem de BazarX Puanı ile çoklu takas yapılabilir.'
  },
  { q: 'Escrow (Güvenli Ödeme) sistemi nedir?', a: 'Gelişmiş güvenlik altyapımız ile tüm işlemler kontrol altındadır.' },
  { q: 'Üyelik ücretleri nelerdir?', a: 'Standart üyelik ücretsizdir, profesyonel satıcılar için Premium paketlerimiz mevcuttur.' },
  { q: 'Ürün iade süreci nasıl işler?', a: 'İade politikamız tamamen kurumsal standartlara uygun olarak düzenlenmiştir.' }
];
</script>
