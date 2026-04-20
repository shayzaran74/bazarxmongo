<template>
  <section class="py-32 bg-neutral-50 overflow-hidden italic">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="bg-white rounded-[4rem] p-12 lg:p-24 border border-neutral-100 shadow-2xl flex flex-col lg:flex-row gap-24 items-center relative overflow-hidden">
        <div class="absolute top-0 right-0 p-24 opacity-[0.02] pointer-events-none">
          <BanknotesIcon class="h-[30rem] w-[30rem] text-indigo-600 rotate-12" />
        </div>

        <div class="flex-1 space-y-12 relative z-10">
          <h2 class="text-5xl lg:text-7xl font-black text-gray-900 tracking-tightest leading-[0.85] italic uppercase">BAZARX <br><span class="text-indigo-600">CASHBACK PROTOKOLÜ</span></h2>
          
          <div class="space-y-8">
            <div v-for="info in infoList" :key="info.id" class="flex items-start gap-8 group">
              <div class="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 mt-1 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                <CheckIcon class="h-6 w-6 text-indigo-600 group-hover:text-white" />
              </div>
              <div class="space-y-2">
                <h4 class="font-black text-gray-900 text-2xl leading-none italic uppercase">{{ info.title }}</h4>
                <p class="text-gray-400 font-black text-xs leading-tight uppercase tracking-widest opacity-80">{{ info.text }}</p>
              </div>
            </div>
          </div>

          <div class="inline-flex items-center gap-6 p-6 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 shadow-inner">
            <div class="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-200 animate-pulse">
              <InformationCircleIcon class="h-8 w-8 text-white" />
            </div>
            <div>
              <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest italic mb-1">AYLIK KAZANÇ LİMİTİ</p>
              <p class="text-2xl font-black text-gray-900 leading-none tracking-tightest uppercase italic">3.500 TL // ÜST SINIRSIZ HARCAMA</p>
            </div>
          </div>
        </div>

        <div class="flex-1 grid grid-cols-2 gap-6 w-full relative z-10">
          <div v-for="stat in stats" :key="stat.label" class="p-10 bg-neutral-50 rounded-[3rem] text-center group hover:bg-gray-900 hover:scale-105 transition-all duration-500 border border-transparent hover:border-white/10 shadow-inner hover:shadow-2xl">
            <div class="text-5xl font-black text-indigo-600 mb-3 group-hover:text-white transition-colors tracking-tightest italic">{{ stat.value }}</div>
            <div class="text-[10px] font-black text-gray-400 group-hover:text-white/40 uppercase tracking-[0.2em] italic">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { CheckIcon, InformationCircleIcon, BanknotesIcon } from '@heroicons/vue/24/outline'

const infoList = [
  { id: 1, title: 'STANDART %3 KAZANÇ', text: 'TÜM STANDART ALIŞVERİŞLERİNİZDE %3 KAZANÇ SAĞLAYIN.' },
  { id: 2, title: 'ÖZEL KAMPANYALAR', text: 'BELİRLİ ÜRÜNLERDE KAZANÇ ORANI %10’A KADAR ÇIKABİLİR.' },
  { id: 3, title: 'ANINDA KULLANIM', text: 'KAZANDIĞINIZ BAKİYELERİ ALT SINIR OLMAKSIZIN ANINDA HARCAYABİLİRSİNİZ.' }
]
const stats = [
  { value: '%3', label: 'STANDART KAZANÇ' },
  { value: '%10', label: 'MAKSİMUM KAZANÇ' },
  { value: '3.500₺', label: 'AYLIK LİMİT' },
  { value: '∞', label: 'HARCAMA LİMİTİ' }
]
</script>
