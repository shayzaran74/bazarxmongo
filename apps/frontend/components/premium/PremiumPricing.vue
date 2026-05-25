<template>
  <section id="pricing" class="py-32 bg-gray-900 relative overflow-hidden italic">
    <!-- Decorative background -->
    <div class="absolute top-0 left-0 w-full h-full opacity-5">
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] border border-white rounded-full scale-150 animate-pulse" />
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] border border-white rounded-full scale-110" />
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div class="text-center mb-24 space-y-4">
        <h2 class="text-5xl lg:text-7xl font-black text-white tracking-tightest uppercase italic">PLANINIZI <span class="text-indigo-400">SEÇİN</span></h2>
        <p class="text-gray-500 font-black text-[10px] uppercase tracking-[0.4em] italic">AVANTAJLARINIZI KATLAMAYA HEMEN BAŞLAYIN.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
        <div v-for="plan in displayPlans" :key="plan.id" class="relative group flex flex-col">
          <div v-if="plan.badge" class="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
            <div class="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[9px] font-black tracking-[0.25em] px-5 py-2.5 rounded-full shadow-2xl uppercase italic animate-bounce whitespace-nowrap">
              {{ plan.badge }}
            </div>
          </div>

          <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-[2.5rem] blur-[20px] opacity-0 group-hover:opacity-40 transition duration-1000" />

          <div class="relative flex flex-col h-full p-10 bg-gray-800 border border-gray-700 rounded-[2.5rem] hover:border-indigo-500/50 transition-all overflow-hidden shadow-2xl" :class="{ 'border-indigo-500': plan.badge }">
            <div class="absolute top-0 right-0 p-8 h-28 w-28 bg-indigo-600/10 rounded-full blur-3xl" />

            <div class="mb-8">
              <h3 class="text-xl font-black text-white italic uppercase tracking-tighter mb-1">{{ plan.name }}</h3>
              <p class="text-gray-500 text-[9px] font-black uppercase tracking-widest opacity-80 leading-tight">{{ plan.tagline }}</p>
            </div>

            <div class="flex items-baseline gap-3 mb-8">
              <span v-if="plan.originalMonthly" class="text-gray-600 line-through text-base font-black italic">{{ plan.originalMonthly }}₺</span>
              <span class="text-5xl font-black text-white tracking-tightest">{{ plan.monthlyPrice }}<span class="text-base ml-1">TL</span></span>
              <span class="text-gray-500 text-[10px] font-black uppercase tracking-tightest">/AY</span>
            </div>

            <div class="space-y-4 mb-10">
              <div v-for="benefit in plan.benefits" :key="benefit" class="flex items-center gap-3 text-white text-[10px] font-black uppercase tracking-tightest">
                <span class="w-6 h-6 bg-emerald-500 rounded-lg flex items-center justify-center text-white text-xs shadow-xl shadow-emerald-500/20 flex-shrink-0">✓</span>
                {{ benefit }}
              </div>
            </div>

            <div class="mt-auto space-y-4">
              <div v-if="plan.annualPrice" class="text-indigo-400 text-[9px] font-black italic uppercase tracking-[0.15em] opacity-80 leading-tight">
                YILLIK {{ plan.annualPrice }} TL // AYDA {{ Math.round(plan.annualPrice / 12) }} TL
              </div>

              <button
                :disabled="loading"
                class="w-full py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] transition-all transform hover:scale-[1.02] active:scale-95 shadow-3xl disabled:opacity-50 overflow-hidden relative"
                :class="plan.badge
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-[0_0_40px_rgba(79,70,229,0.4)]'
                  : 'bg-white text-gray-900 hover:bg-indigo-600 hover:text-white'"
                @click="$emit('select', plan.id)"
              >
                <span v-if="loading" class="w-5 h-5 border-3 border-current border-t-transparent rounded-full animate-spin mx-auto" />
                <span v-else>{{ plan.cta }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
interface TierInfo { name: string; tagline: string; badge?: string; cta: string }

const props = defineProps<{
  loading: boolean
  plans: Array<{ id: string; tier: string; monthlyFee: number; annualFee: number | null; benefits: string[] }>
}>()

defineEmits<{ select: [planId: string] }>()

const TIER_NAMES: Record<string, TierInfo> = {
  BRONZE_P1:  { name: 'BRONZE',  tagline: 'GİRİŞ SEVİYESİ AYRICALIK', cta: 'BRONZE\'A GEÇ' },
  BRONZE_P2:  { name: 'BRONZE P2', tagline: 'YÜKSELTİLMİŞ BRONZE', cta: 'BRONZE P2\'YE GEÇ' },
  SILVER_P1:  { name: 'SILVER',  tagline: 'ORTA SINIF AVANTAJLAR', cta: 'SILVER\'A GEÇ' },
  SILVER_P2:  { name: 'SILVER P2', tagline: 'YÜKSELTİLMİŞ SILVER', cta: 'SILVER P2\'YE GEÇ' },
  GOLD_P1:    { name: 'GOLD',    tagline: 'ALTIN ÜYELİK AYRICALIĞI', cta: 'GOLD\'A GEÇ' },
  GOLD_P2:    { name: 'GOLD P2', tagline: 'YÜKSELTİLMİŞ GOLD', cta: 'GOLD P2\'YE GEÇ' },
  DIAMOND_P1: { name: 'DIAMOND', tagline: 'ELMAS KARARLIĞINDA AYRICALIK', badge: 'EN POPÜLER', cta: 'DİAMOND\'A GEÇ' },
  DIAMOND_P2: { name: 'DIAMOND P2', tagline: 'MAXIMUM AYRICALIK', badge: 'PREMIUM', cta: 'DİAMOND P2\'YE GEÇ' },
}

const displayPlans = computed(() => {
  if (props.plans && props.plans.length > 0) {
    return props.plans.map(p => {
      const info = TIER_NAMES[p.tier] ?? { name: p.tier, tagline: '', cta: 'PLAN SEÇ' }
      return {
        id: p.id,
        name: info.name,
        tagline: info.tagline,
        badge: info.badge,
        monthlyPrice: p.monthlyFee,
        originalMonthly: p.annualFee ? Math.round(p.annualFee / 12) : null,
        annualPrice: p.annualFee,
        benefits: p.benefits,
        cta: info.cta,
      }
    })
  }

  return [
    { id: 'bronze_p1', name: 'BRONZE', tagline: 'GİRİŞ SEVİYESİ AYRICALIK', monthlyPrice: 199, benefits: ['%3 CASHBACK', 'ÜCRETSİZ KARGO', 'ÖNCELİKLİ DESTEK'], cta: "BRONZE'A GEÇ" },
    { id: 'bronze_p2', name: 'BRONZE P2', tagline: 'YÜKSELTİLMİŞ BRONZE', monthlyPrice: 399, benefits: ['%4 CASHBACK', 'ÜCRETSİZ KARGO', 'ÖNCELİKLİ DESTEK', 'AYLIK 2 ÜRÜN İNDİRİMİ'], cta: 'BRONZE P2\'YE GEÇ' },
    { id: 'silver_p1', name: 'SILVER', tagline: 'ORTA SINIF AVANTAJLAR', monthlyPrice: 699, benefits: ['%5 CASHBACK', 'ÜCRETSİZ KARGO', 'ÖNCELİKLİ DESTEK', 'AYLIK 5 ÜRÜN İNDİRİMİ'], cta: "SILVER'A GEÇ" },
    { id: 'diamond_p1', name: 'DIAMOND', tagline: 'ELMAS KARARLIĞINDA AYRICALIK', monthlyPrice: 2999, badge: 'EN POPÜLER', benefits: ['%10 CASHBACK', 'ÜCRETSİZ KARGO', '7/24 ÖZEL DESTEK', 'AYLIK SINIRSIZ İNDİRİM', 'VIP ETKİNLİKLER'], cta: "DİAMOND'A GEÇ" },
  ]
})
</script>
