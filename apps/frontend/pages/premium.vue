<template>
  <div class="min-h-screen bg-white">
    <!-- Hero Section -->
    <PremiumHero :full-name="authStore.fullName" @cta="scrollToPricing" />

    <!-- Features Section -->
    <PremiumFeatures />

    <!-- Cashback Details -->
    <PremiumCashback />

    <!-- Process Flow -->
    <section class="py-32 bg-white italic">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-28 space-y-4">
          <h2 class="text-5xl font-black text-gray-900 tracking-tightest uppercase italic">ÜYELİK <span class="text-indigo-600">AKTİVASYONU</span></h2>
          <p class="text-gray-400 font-black text-[10px] uppercase tracking-[0.4em] italic">PREMIUM AYRICALIKLARI SADECE 3 ADIMDA AKTİF!</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-20 relative">
          <div class="hidden lg:block absolute top-12 left-44 right-44 h-1.5 bg-neutral-100 z-0 rounded-full" />

          <div v-for="(step, index) in steps" :key="index" class="relative z-10 flex flex-col items-center text-center group">
            <div class="w-24 h-24 rounded-full bg-white border-4 border-indigo-600 flex items-center justify-center text-4xl font-black text-indigo-600 mb-10 shadow-2xl shadow-indigo-100 group-hover:scale-110 transition-transform duration-500">
              {{ index + 1 }}
            </div>
            <h4 class="text-2xl font-black text-gray-900 mb-4 uppercase italic tracking-tighter">{{ step.title }}</h4>
            <p class="text-gray-400 font-black text-xs leading-relaxed uppercase tracking-widest opacity-80 max-w-xs">{{ step.desc }}</p>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="mt-24 max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="a in alerts" :key="a.t" class="p-8 rounded-[3rem] border flex items-center gap-8 shadow-inner" :class="a.c">
            <component :is="a.i" class="h-12 w-12 flex-shrink-0" />
            <p class="font-black text-xs uppercase tracking-widest leading-snug">{{ a.t }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <PremiumPricing :loading="loading" @select="startPremium" />

    <!-- FAQ CTA -->
    <section class="py-32 bg-white italic">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
        <h2 class="text-3xl font-black text-gray-900 uppercase tracking-tightest">HALA BİR SORUNUZ MU VAR?</h2>
        <NuxtLink to="/support" class="inline-flex items-center gap-6 px-12 py-6 bg-neutral-100 text-gray-700 rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all shadow-xl active:scale-95 group">
          MÜŞTERİ HİZMETLERİNE BAĞLAN
          <ChevronRightIcon class="h-6 w-6 group-hover:translate-x-3 transition-transform" />
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup>
import { InformationCircleIcon, WalletIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'
import PremiumHero from '~/components/premium/PremiumHero.vue'
import PremiumFeatures from '~/components/premium/PremiumFeatures.vue'
import PremiumCashback from '~/components/premium/PremiumCashback.vue'
import PremiumPricing from '~/components/premium/PremiumPricing.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'PREMIUM AVANTAJLARI // BAZARX' })

const authStore = useAuthStore()
const { loading, scrollToPricing, startPremium } = usePremium()

const steps = [
  { title: 'PLANINI BELİRLE', desc: 'İHTİYACINA EN UYGUN PREMIUM PLANINI SEÇ VE "PREMİUM\'A GEÇ" BUTONUNA TIKLA.' },
  { title: 'BAKİYENİ KONTROL ET', desc: 'ÖDEMEN CÜZDANINDAN OTOMATİK ALINACAKTIR. YETERLİ BAKİYEN OLDUĞUNDAN EMİN OL.' },
  { title: 'AYRICALIĞA BAŞLA', desc: 'İŞLEMİ TAMAMLA VE PIRLANTA LOGOLU YENİ ÜYE KARTINLA AVANTAJLARIN TADINI ÇIKAR!' }
]

const alerts = [
  { t: 'HIZLI AKTİVASYON İÇİN LÜTFEN CÜZDANINIZDA YETERLİ BAKİYE OLDUĞUNDAN EMİN OLUN.', i: InformationCircleIcon, c: 'bg-blue-50 border-blue-100 text-blue-900' },
  { t: 'ÖDEME, BAZARX CÜZDAN BAKİYENİZDEN OTOMATİK OLARAK TAHSİL EDİLİR.', i: WalletIcon, c: 'bg-indigo-50 border-indigo-100 text-indigo-900' }
]
</script>
