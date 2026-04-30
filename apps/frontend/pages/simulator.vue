<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- Header -->
    <div class="border-b border-white/10 px-4 py-6 text-center">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-3xl font-black tracking-tight">
          BazarX Ekosistemi — <span class="text-purple-400">Karlılık Simülatörü</span>
        </h1>
        <p class="text-slate-400 mt-2 text-sm">Master Plan v4.3 · Parametreleri kaydırarak kırılım noktasını ve net kârı görün</p>
      </Motion>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-8">

      <!-- Fiyat Hesaplayıcı -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 class="text-purple-400 font-bold uppercase tracking-wider text-xs mb-4">Menü Fiyat Hesaplayıcı — %8 Hizmet + %20 KDV</h2>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="flex items-center gap-2">
            <label class="text-slate-400 text-sm">Menü tutarı</label>
            <input
              v-model.number="menuPrice"
              type="number" min="100" max="10000" step="50"
              class="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
            />
            <span class="text-slate-400 text-sm">₺</span>
          </div>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500">%50 indirimli</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500">Hizmet bedeli</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5 * 0.08) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500">KDV</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5 * 0.08 * 0.20) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">Toplam ödeme</p>
            <p class="font-black text-purple-400 text-lg">{{ fmt(menuPrice * 0.5 * 1.096) }}</p>
          </div>
        </div>
        <p class="text-emerald-400 text-sm mt-3 font-bold">
          {{ fmt(menuPrice - menuPrice * 0.5 * 1.096) }} tasarruf (%{{ Math.round((1 - 0.5 * 1.096) * 100) }})
        </p>
      </section>

      <!-- B2C Parametreler -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 class="text-purple-400 font-bold uppercase tracking-wider text-xs mb-4">BazarX — B2C Parametreler</h2>
        <div class="space-y-3">
          <Slider label="B2C üye sayısı" v-model="b2c.members" :min="50" :max="5000" :step="50" :fmt="(v) => v.toLocaleString('tr-TR')" />
          <Slider label="Üye başı aylık menü harcaması" v-model="b2c.avgSpend" :min="200" :max="15000" :step="100" :fmt="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <Slider label="Satıcı komisyon oranı (ort.)" v-model="b2c.commissionPct" :min="6" :max="12" :step="1" :fmt="(v) => '%' + v" />
          <Slider label="Reklam geliri / ay" v-model="b2c.adRevenue" :min="0" :max="200000" :step="5000" :fmt="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <Slider label="Hediye çeki gideri / ay" v-model="b2c.voucherCost" :min="0" :max="50000" :step="1000" :fmt="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
        </div>
      </section>

      <!-- B2B Parametreler -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 class="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">TicariTakas — B2B Parametreler</h2>
        <div class="space-y-3">
          <Slider label="CORE üye (12.000₺/yıl)" v-model="b2b.core" :min="0" :max="200" :step="1" :fmt="(v) => v + ' üye'" />
          <Slider label="PRIME üye (48.000₺/yıl)" v-model="b2b.prime" :min="0" :max="100" :step="1" :fmt="(v) => v + ' üye'" />
          <Slider label="ELITE üye (120.000₺/yıl)" v-model="b2b.elite" :min="0" :max="50" :step="1" :fmt="(v) => v + ' üye'" />
          <Slider label="APEX üye (300.000₺/yıl)" v-model="b2b.apex" :min="0" :max="20" :step="1" :fmt="(v) => v + ' üye'" />
          <Slider label="Üye başı aylık takas cirosu" v-model="b2b.avgTrade" :min="10000" :max="500000" :step="5000" :fmt="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
        </div>
      </section>

      <!-- Gider -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 class="text-amber-400 font-bold uppercase tracking-wider text-xs mb-4">Operasyon Gideri</h2>
        <Slider label="Aylık toplam gider" v-model="opsCost" :min="20000" :max="300000" :step="5000" :fmt="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
      </section>

      <!-- Sonuçlar -->
      <Motion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="bg-purple-600/10 border border-purple-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Toplam brüt gelir</p>
            <p class="text-xl font-black text-purple-400 mt-1">{{ fmt(results.brutGelir) }}</p>
          </div>
          <div class="bg-red-600/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Toplam gider</p>
            <p class="text-xl font-black text-red-400 mt-1">{{ fmt(results.toplamGider) }}</p>
          </div>
          <div class="bg-amber-600/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Vergi yükü</p>
            <p class="text-xl font-black text-amber-400 mt-1">{{ fmt(results.vergiYuku) }}</p>
          </div>
          <div
            class="rounded-2xl p-4 text-center border"
            :class="results.netKar >= 0
              ? 'bg-emerald-600/10 border-emerald-500/30'
              : 'bg-red-600/10 border-red-500/30'"
          >
            <p class="text-xs text-slate-400">Net kâr</p>
            <p class="text-xl font-black mt-1" :class="results.netKar >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ fmt(results.netKar) }}
            </p>
          </div>
        </div>

        <!-- Platform bazlı -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 class="text-purple-400 font-bold text-sm mb-3">BazarX — B2C</h3>
            <div v-for="(row, k) in bxDetails" :key="k" class="flex justify-between text-sm py-1 border-b border-white/5">
              <span class="text-slate-400">{{ row.label }}</span>
              <span :class="row.negative ? 'text-red-400' : 'text-white'" class="font-medium">{{ fmt(row.value) }}</span>
            </div>
          </div>
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 class="text-emerald-400 font-bold text-sm mb-3">TicariTakas — B2B</h3>
            <div v-for="(row, k) in ttDetails" :key="k" class="flex justify-between text-sm py-1 border-b border-white/5">
              <span class="text-slate-400">{{ row.label }}</span>
              <span :class="row.negative ? 'text-red-400' : 'text-white'" class="font-medium">{{ fmt(row.value) }}</span>
            </div>
          </div>
        </div>

        <!-- Uyarılar -->
        <div v-if="results.netKar < 0" class="mt-4 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          ⚠️ Model zarar ediyor. Üye sayısını artırın veya operasyon giderini düşürün.
        </div>
        <div v-if="results.bxNet < 0" class="mt-2 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-400">
          ⚠️ BazarX B2C bu parametrelerle zarar ediyor.
        </div>
      </Motion>
    </div>
  </div>
</template>

<script setup lang="ts">
// definePageMeta — public erişim, auth gereksiz
definePageMeta({ layout: 'default' })

import { ref, computed } from 'vue'

// ─── Yardımcı bileşen (inline) ───────────────────────────────────────────────
const Slider = defineComponent({
  props: { label: String, modelValue: Number, min: Number, max: Number, step: Number, fmt: Function },
  emits: ['update:modelValue'],
  template: `
    <div class="flex items-center gap-3">
      <label class="text-slate-400 text-sm w-52 flex-shrink-0">{{ label }}</label>
      <input type="range" class="flex-1" :min="min" :max="max" :step="step"
        :value="modelValue" @input="$emit('update:modelValue', +$event.target.value)" />
      <span class="text-white font-bold text-sm w-32 text-right">{{ fmt(modelValue) }}</span>
    </div>`,
})

// ─── Parametreler ─────────────────────────────────────────────────────────────
const menuPrice = ref(500)

const b2c = ref({ members: 500, avgSpend: 1500, commissionPct: 9, adRevenue: 30000, voucherCost: 5000 })
const b2b = ref({ core: 30, prime: 15, elite: 5, apex: 1, avgTrade: 80000 })
const opsCost = ref(60000)

// ─── Hesaplama ────────────────────────────────────────────────────────────────
const results = computed(() => {
  const { members, avgSpend, commissionPct, adRevenue, voucherCost } = b2c.value
  const { core, prime, elite, apex, avgTrade } = b2b.value

  // BazarX B2C
  const menuHizmet   = members * avgSpend * 0.5 * 0.08
  const satKomisyon  = members * avgSpend * (commissionPct / 100)
  const bxBrut       = menuHizmet + satKomisyon + adRevenue
  const bxGider      = voucherCost + opsCost.value * 0.50
  const bxVergi      = bxBrut * 0.20 // KDV ağırlıklı
  const bxNet        = bxBrut - bxGider - bxVergi

  // TicariTakas B2B
  const ttAidat      = (core * 12000 + prime * 48000 + elite * 120000 + apex * 300000) / 12
  const ttKomisyon   = (core * avgTrade * 0.12 + prime * avgTrade * 0.10 + elite * avgTrade * 0.08 + apex * avgTrade * 0.06)
  const ttBrut       = ttAidat + ttKomisyon
  const ttGider      = opsCost.value * 0.30
  const ttStopaj     = ttKomisyon * 0.10
  const ttKdv        = ttBrut * 0.20
  const ttVergi      = ttKdv + ttStopaj
  const ttNet        = ttBrut - ttGider - ttVergi

  const brutGelir    = bxBrut + ttBrut
  const toplamGider  = bxGider + ttGider
  const vergiYuku    = bxVergi + ttVergi
  const netKar       = bxNet + ttNet

  return { brutGelir, toplamGider, vergiYuku, netKar, bxNet, ttNet,
    bxBrut, bxGider, bxVergi, menuHizmet, satKomisyon,
    ttAidat, ttKomisyon, ttGider, ttVergi }
})

const bxDetails = computed(() => [
  { label: 'Satıcı komisyonu', value: results.value.satKomisyon },
  { label: 'Hizmet bedeli (%8+KDV)', value: results.value.menuHizmet * 1.096 },
  { label: 'Reklam geliri', value: b2c.value.adRevenue },
  { label: 'Hediye çeki gideri', value: b2c.value.voucherCost, negative: true },
  { label: 'Operasyon payı', value: opsCost.value * 0.50, negative: true },
  { label: 'Vergi yükü', value: results.value.bxVergi, negative: true },
])

const ttDetails = computed(() => [
  { label: 'Aidat geliri (aylık)', value: results.value.ttAidat },
  { label: 'İşlem komisyonu', value: results.value.ttKomisyon },
  { label: 'Operasyon payı', value: results.value.ttGider, negative: true },
  { label: 'KDV + Stopaj', value: results.value.ttVergi, negative: true },
])

function fmt(n: number): string {
  return Math.round(n).toLocaleString('tr-TR') + ' ₺'
}
</script>
