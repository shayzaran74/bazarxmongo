<template>
  <section class="py-32 bg-white relative overflow-hidden italic">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="text-center mb-24 space-y-4">
        <h2 class="text-5xl font-black text-gray-900 tracking-tightest uppercase italic">ÖNE ÇIKAN <span class="text-indigo-600">AYRICALIKLAR</span></h2>
        <div class="w-32 h-2.5 bg-indigo-600 mx-auto rounded-full shadow-2xl shadow-indigo-100" />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
        <div v-for="f in features" :key="f.title" class="p-12 bg-neutral-50 rounded-[3.5rem] hover:bg-white hover:shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all group border border-transparent hover:border-neutral-100 flex flex-col gap-10">
          <div :class="f.colorClass" class="w-24 h-24 rounded-[2rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-2xl">
            <component :is="f.icon" class="h-10 w-10 text-white" />
          </div>
          <div class="space-y-4">
            <h3 class="text-3xl font-black text-gray-900 uppercase italic tracking-tighter leading-[0.9]">{{ f.title }}</h3>
            <p class="text-gray-500 font-black text-lg leading-tight uppercase opacity-60 italic">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { TruckIcon, TvIcon, WalletIcon } from '@heroicons/vue/24/outline'

const features = [
  { title: 'ÜCRETSİZ KARGO', desc: 'BINLERCE ÜRÜNDE ALT LIMIT OLMAKSIZIN ÜCRETSIZ KARGO AVANTAJINDAN FAYDALANIN.', icon: TruckIcon, colorClass: 'bg-indigo-600' },
  { title: 'ÖZEL İNDİRİMLER', desc: 'PREMIUM ÜYELIĞINIZ BOYUNCA BINLERCE ÜRÜNDE EKSTRA INDIRIM AVANTAJINDAN FAYDALANIN.', icon: TvIcon, colorClass: 'bg-purple-600' },
  { title: 'CASHBACK KAZANCI', desc: 'ALIŞVERIŞLERINIZDEN BAKIYE KAZANIN, KAZANDIKLARINIZI ANINDA HARCAYIN.', icon: WalletIcon, colorClass: 'bg-amber-600' }
]
</script>
