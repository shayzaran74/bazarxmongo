<template>
  <div class="max-w-6xl mx-auto py-12 px-4">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <!-- Contact Info -->
      <div class="space-y-12">
        <div class="space-y-4">
          <h1 class="text-6xl font-display font-black text-dark-950 italic tracking-tighter leading-none">Bize Ulaşın</h1>
          <p class="text-xl text-gray-500 font-medium leading-relaxed">
            Sorularınız, iş birliği talepleriniz veya teknik destek için ekibimiz size yardımcı olmaya hazır.
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div v-for="item in contactDetails" :key="item.label" class="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all group">
            <div class="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 transition-colors">
              <Icon :name="item.icon" class="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
            </div>
            <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{{ item.label }}</h3>
            <p class="text-lg font-display font-black text-dark-950 italic">{{ item.value }}</p>
          </div>
        </div>

        <!-- Social Links -->
        <div class="pt-8">
          <div class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">Sosyal Medya</div>
          <div class="flex gap-4">
            <a v-for="i in 3" :key="i" href="#" class="w-14 h-14 bg-dark-950 rounded-2xl flex items-center justify-center text-white hover:bg-primary-600 hover:-translate-y-1 transition-all shadow-lg shadow-dark-950/20">
              <Icon :name="socialIcons[i-1]" class="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <!-- Contact Form Placeholder -->
      <div class="bg-white rounded-[3rem] p-8 lg:p-12 border border-gray-100 shadow-2xl relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-transparent pointer-events-none" />
        
        <form class="space-y-6 relative z-10" @submit.prevent>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Ad Soyad</label>
              <input type="text" placeholder="John Doe" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">E-Posta</label>
              <input type="email" placeholder="john@bazarx.com" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm" />
            </div>
          </div>
          
          <div class="space-y-2">
            <label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Konu</label>
            <input type="text" placeholder="Nasıl yardımcı olabiliriz?" class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm" />
          </div>

          <div class="space-y-2">
            <label class="text-[10px] font-black text-dark-950 uppercase tracking-widest ml-1">Mesajınız</label>
            <textarea rows="4" placeholder="Mesajınızı buraya yazın..." class="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:bg-white focus:border-primary-500/30 transition-all shadow-sm resize-none"></textarea>
          </div>

          <button class="w-full py-5 bg-dark-950 text-white rounded-[1.5rem] text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-600 transition-all shadow-2xl shadow-dark-950/20 active:scale-95">
            Mesajı Gönder
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const contactDetails = [
  { label: 'E-Posta', value: 'destek@bazarx.com', icon: 'heroicons:envelope' },
  { label: 'Telefon', value: '+90 212 555 0101', icon: 'heroicons:phone' },
  { label: 'Adres', value: 'Maslak Plaza, İstanbul', icon: 'heroicons:map-pin' },
  { label: 'Çalışma Saatleri', value: 'Pzt - Cmt, 09:00 - 18:00', icon: 'heroicons:clock' }
];

const socialIcons = ['uil:facebook-f', 'uil:instagram', 'uil:linkedin-alt'];
</script>
