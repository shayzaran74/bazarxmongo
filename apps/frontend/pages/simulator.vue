<!-- apps/frontend/pages/simulator.vue -->
<!-- Master Plan v4.3 §6 — Karlılık Simülatörü (Tam Sürüm) -->
<!-- BazarX B2C · TicariTakas B2B · BarterBorsa · Vergi · Grafikler -->

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// ─── Slider bileşeni ──────────────────────────────────────────────────────────
const SliderRow = defineComponent({
  props: {
    label:       { type: String, required: true },
    modelValue:  { type: Number, required: true },
    min:         { type: Number, required: true },
    max:         { type: Number, required: true },
    step:        { type: Number, default: 1 },
    display:     { type: Function as PropType<(v: number) => string>, required: true },
  },
  emits: ['update:modelValue'],
  template: `
    <div class="flex items-center gap-3">
      <label class="text-slate-400 text-xs w-44 flex-shrink-0 leading-tight">{{ label }}</label>
      <input type="range" class="flex-1 accent-purple-500" :min="min" :max="max" :step="step"
        :value="modelValue" @input="$emit('update:modelValue', +($event.target as HTMLInputElement).value)" />
      <span class="text-white font-bold text-xs w-28 text-right tabular-nums">{{ display(modelValue) }}</span>
    </div>`,
})

// ─── Tier dağılım ─────────────────────────────────────────────────────────────
const TIERS = [
  { label: 'Bronz P1',  fee: 199,  color: 'bg-amber-800' },
  { label: 'Bronz P2',  fee: 399,  color: 'bg-amber-700' },
  { label: 'Gümüş P1',  fee: 699,  color: 'bg-slate-400' },
  { label: 'Gümüş P2',  fee: 999,  color: 'bg-slate-300' },
  { label: 'Altın P1',  fee: 1499, color: 'bg-yellow-500' },
  { label: 'Altın P2',  fee: 1999, color: 'bg-yellow-400' },
  { label: 'Elmas P1',  fee: 2999, color: 'bg-cyan-400' },
  { label: 'Elmas P2',  fee: 4999, color: 'bg-cyan-300' },
]

const tierPcts = ref<number[]>([30, 25, 18, 12, 7, 5, 2, 1])
const tierTotal = computed(() => tierPcts.value.reduce((a, b) => a + b, 0))
const tierValid  = computed(() => tierTotal.value === 100)

function updateTier(idx: number, val: number) {
  tierPcts.value[idx] = val
}

// ─── Parametreler ─────────────────────────────────────────────────────────────
const menuPrice = ref(500)
const b2c = ref({ members: 500, avgSpend: 1500, commissionPct: 9, adRevenue: 30000, voucherCost: 5000 })
const b2b = ref({ core: 30, prime: 15, elite: 5, apex: 1, avgTrade: 80000, adRevenue: 20000 })
const bb  = ref({ firms: 3, saas: 25000, tradeVol: 2_000_000, adRevenue: 10000 })
const opsCost = ref(60000)

// ─── Hesaplama ────────────────────────────────────────────────────────────────
const calc = computed(() => {
  const { members, avgSpend, commissionPct, adRevenue: bxAd, voucherCost } = b2c.value
  const { core, prime, elite, apex, avgTrade, adRevenue: ttAd } = b2b.value
  const { firms, saas, tradeVol, adRevenue: bbAd } = bb.value

  // Aidat geliri (tier dağılım ağırlıklı)
  let aidatGeliri = 0
  if (tierValid.value) {
    TIERS.forEach((t, i) => {
      aidatGeliri += members * (tierPcts.value[i] / 100) * t.fee
    })
  }

  // BazarX B2C
  const bxHizmet   = members * avgSpend * 0.5 * 0.08
  const bxHizmetKdv = bxHizmet * 0.20
  const bxSatKom   = members * avgSpend * (commissionPct / 100)
  const bxBrut     = aidatGeliri + bxSatKom + bxHizmet + bxHizmetKdv + bxAd
  const bxOps      = opsCost.value * 0.50
  const bxXpGider  = aidatGeliri * 0.05
  const bxGider    = voucherCost + bxOps + bxXpGider
  const bxKdvT     = (aidatGeliri + bxSatKom + bxAd) * 0.20 + bxHizmetKdv
  const bxKdvI     = bxGider * 0.18
  const bxKdvN     = Math.max(0, bxKdvT - bxKdvI)
  const bxDamga    = bxBrut * 0.001
  const bxKv       = Math.max(0, bxBrut - bxGider - bxKdvN) * 0.25 / 12
  const bxVergi    = bxKdvN + bxDamga + bxKv
  const bxNet      = bxBrut - bxGider - bxVergi

  // TicariTakas B2B
  const ttAidat    = (core * 12000 + prime * 48000 + elite * 120000 + apex * 300000) / 12
  const ttKom      = core * avgTrade * 0.12 + prime * avgTrade * 0.10 + elite * avgTrade * 0.08 + apex * avgTrade * 0.06
  const ttBrut     = ttAidat + ttKom + ttAd
  const ttOps      = opsCost.value * 0.30
  const ttKdv      = ttBrut * 0.20
  const ttStopaj   = ttKom * 0.10
  const ttKv       = Math.max(0, ttBrut - ttOps - ttKdv) * 0.25 / 12
  const ttVergi    = ttKdv + ttStopaj + ttKv
  const ttNet      = ttBrut - ttOps - ttVergi

  // BarterBorsa Kurumsal
  const bbSaas     = firms * saas
  const bbKom      = firms * tradeVol * 0.06
  const bbBrut     = bbSaas + bbKom + bbAd
  const bbOps      = opsCost.value * 0.20
  const bbKdvT     = bbBrut * 0.20
  const bbKdvI     = bbOps * 0.18
  const bbKdvN     = Math.max(0, bbKdvT - bbKdvI)
  const bbKv       = Math.max(0, bbBrut - bbOps - bbKdvN) * 0.25 / 12
  const bbVergi    = bbKdvN + bbKv
  const bbNet      = bbBrut - bbOps - bbVergi

  const brutGelir   = bxBrut + ttBrut + bbBrut
  const toplamGider = bxGider + ttOps + bbOps
  const vergiYuku   = bxVergi + ttVergi + bbVergi
  const netKar      = bxNet + ttNet + bbNet

  return {
    brutGelir, toplamGider, vergiYuku, netKar,
    bxNet, ttNet, bbNet,
    bxBrut, bxGider, bxVergi, bxHizmet, bxHizmetKdv, bxSatKom, aidatGeliri,
    bxKdvT, bxKdvI, bxKdvN, bxDamga, bxKv,
    ttAidat, ttKom, ttOps, ttKdv, ttStopaj, ttKv,
    bbSaas, bbKom, bbOps, bbKdvN, bbKv,
    ttBrut, bbBrut,
  }
})

// ─── Kırılım noktası hesaplama ────────────────────────────────────────────────
const breakEvenPoints = computed(() => {
  const pts: { x: number; y: number }[] = []
  const maxM = Math.max(b2c.value.members * 2.5, 500)
  for (let m = 50; m <= maxM; m += Math.ceil(maxM / 60)) {
    let aid = 0
    if (tierValid.value) {
      TIERS.forEach((t, i) => { aid += m * (tierPcts.value[i] / 100) * t.fee })
    }
    const bxH  = m * b2c.value.avgSpend * 0.5 * 0.08
    const bxS  = m * b2c.value.avgSpend * (b2c.value.commissionPct / 100)
    const brut = aid + bxS + bxH + b2c.value.adRevenue + calc.value.ttBrut + calc.value.bbBrut
    const gid  = b2c.value.voucherCost + opsCost.value
    const verg = brut * 0.22
    pts.push({ x: m, y: Math.round(brut - gid - verg) })
  }
  return pts
})

// ─── SVG grafik yardımcıları ──────────────────────────────────────────────────
const CHART_W = 580
const CHART_H = 180

function barChartData() {
  const r = calc.value
  const items = [
    { label: 'BX Aidat',    val: r.aidatGeliri,       col: '#a855f7' },
    { label: 'BX SatKom',   val: r.bxSatKom,          col: '#7c3aed' },
    { label: 'BX Hizmet',   val: r.bxHizmet,          col: '#6d28d9' },
    { label: 'TT Aidat',    val: r.ttAidat,            col: '#10b981' },
    { label: 'TT Kom.',     val: r.ttKom,              col: '#059669' },
    { label: 'BB SaaS',     val: r.bbSaas,             col: '#f59e0b' },
    { label: 'BB Kom.',     val: r.bbKom,              col: '#d97706' },
    { label: 'Giderler',    val: -r.toplamGider,       col: '#ef4444' },
    { label: 'Vergiler',    val: -r.vergiYuku,         col: '#f97316' },
    { label: 'Net Kâr',     val: r.netKar,             col: r.netKar >= 0 ? '#34d399' : '#f87171' },
  ]
  return items
}

const barSvg = computed(() => {
  const data = barChartData()
  const absMax = Math.max(...data.map(d => Math.abs(d.val)), 1)
  const barW   = CHART_W / data.length - 6
  return data.map((d, i) => {
    const h    = Math.abs(d.val) / absMax * (CHART_H - 30)
    const x    = i * (CHART_W / data.length) + 3
    const y    = d.val >= 0 ? CHART_H - 20 - h : CHART_H - 20
    return { ...d, x, y, h, barW, absMax }
  })
})

const lineSvg = computed(() => {
  const pts = breakEvenPoints.value
  if (pts.length < 2) return { path: '', zeroY: CHART_H - 20, pts: [] }
  const minY  = Math.min(...pts.map(p => p.y))
  const maxY  = Math.max(...pts.map(p => p.y), 1)
  const rangeY = maxY - minY || 1
  const maxX  = pts[pts.length - 1].x
  const toSvgX = (x: number) => (x / maxX) * (CHART_W - 20) + 10
  const toSvgY = (y: number) => CHART_H - 20 - ((y - minY) / rangeY) * (CHART_H - 30)
  const zeroSvgY = toSvgY(0)
  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${toSvgX(p.x).toFixed(1)},${toSvgY(p.y).toFixed(1)}`).join(' ')
  const labeled = pts.filter((_, i) => i % Math.ceil(pts.length / 6) === 0).map(p => ({
    svgX: toSvgX(p.x), svgY: toSvgY(p.y), x: p.x, y: p.y,
  }))
  return { path, zeroY: zeroSvgY, pts: labeled }
})

// ─── Format ────────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  return Math.round(n).toLocaleString('tr-TR') + ' ₺'
}
function fmtK(n: number): string {
  const abs = Math.abs(Math.round(n))
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) return sign + (abs / 1_000_000).toFixed(1) + 'M ₺'
  if (abs >= 1_000)    return sign + (abs / 1000).toFixed(0) + 'K ₺'
  return sign + abs + ' ₺'
}
</script>

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
        <p class="text-slate-400 mt-1 text-sm">Master Plan v4.3 · B2C · B2B · BarterBorsa · Vergi Kırılımı</p>
      </Motion>
    </div>

    <div class="max-w-5xl mx-auto px-4 py-8 space-y-6">

      <!-- Fiyat Hesaplayıcı -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-purple-400 font-bold uppercase tracking-wider text-xs mb-4">Menü Fiyat Hesaplayıcı — %8 Hizmet + %20 KDV</h2>
        <div class="flex items-center gap-3 flex-wrap">
          <label class="text-slate-400 text-sm">Menü tutarı</label>
          <input
            v-model.number="menuPrice"
            type="number" min="100" max="10000" step="50"
            class="w-28 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-purple-500"
          />
          <span class="text-slate-400 text-sm">₺</span>
        </div>
        <div class="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2 text-sm">
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">%50 indirimli</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">Hizmet (%8)</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5 * 0.08) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">KDV (%20×hizmet)</p>
            <p class="font-bold text-white">{{ fmt(menuPrice * 0.5 * 0.08 * 0.20) }}</p>
          </div>
          <div class="bg-black/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">Toplam ödeme</p>
            <p class="font-black text-purple-400">{{ fmt(menuPrice * 0.5 * 1.096) }}</p>
          </div>
          <div class="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <p class="text-slate-500 text-xs">Tasarruf</p>
            <p class="font-black text-emerald-400">{{ fmt(menuPrice - menuPrice * 0.5 * 1.096) }}</p>
          </div>
        </div>
      </section>

      <!-- B2C Parametreler + Tier Dağılımı -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-purple-400 font-bold uppercase tracking-wider text-xs mb-4">BazarX — B2C Parametreler</h2>
        <div class="space-y-2.5 mb-5">
          <SliderRow label="B2C üye sayısı"         v-model="b2c.members"       :min="50"  :max="5000"  :step="50"  :display="(v) => v.toLocaleString('tr-TR') + ' üye'" />
          <SliderRow label="Üye başı aylık harcama" v-model="b2c.avgSpend"      :min="200" :max="15000" :step="100" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <SliderRow label="Satıcı komisyon (ort.)" v-model="b2c.commissionPct" :min="6"   :max="12"    :step="1"   :display="(v) => '%' + v" />
          <SliderRow label="Reklam geliri / ay"     v-model="b2c.adRevenue"     :min="0"   :max="200000" :step="5000" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <SliderRow label="Hediye çeki gideri"     v-model="b2c.voucherCost"  :min="0"   :max="50000"  :step="1000" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
        </div>

        <!-- Tier Dağılımı Grid -->
        <div class="border-t border-white/10 pt-4">
          <div class="flex items-center justify-between mb-3">
            <p class="text-slate-400 text-xs uppercase tracking-wider">Tier Dağılımı</p>
            <span
              class="text-xs font-bold px-2 py-0.5 rounded-full"
              :class="tierValid ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'"
            >
              Toplam: {{ tierTotal }}%{{ tierValid ? ' ✓' : ' — 100 olmalı' }}
            </span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div
              v-for="(tier, idx) in TIERS"
              :key="idx"
              class="bg-black/20 rounded-xl p-2.5"
            >
              <div class="flex items-center gap-1.5 mb-1.5">
                <div class="w-2 h-2 rounded-full" :class="tier.color" />
                <p class="text-slate-300 text-xs font-semibold truncate">{{ tier.label }}</p>
              </div>
              <p class="text-slate-500 text-xs mb-1">{{ tier.fee.toLocaleString('tr-TR') }}₺/ay</p>
              <input
                type="range" :min="0" :max="70" step="1"
                :value="tierPcts[idx]"
                class="w-full accent-purple-500"
                @input="updateTier(idx, +($event.target as HTMLInputElement).value)"
              />
              <div class="flex justify-between text-xs mt-0.5">
                <span class="text-slate-500">%{{ tierPcts[idx] }}</span>
                <span class="text-slate-600">{{ Math.round(b2c.members * tierPcts[idx] / 100) }} üye</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- B2B Parametreler -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-emerald-400 font-bold uppercase tracking-wider text-xs mb-4">TicariTakas — B2B Parametreler</h2>
        <div class="space-y-2.5">
          <SliderRow label="CORE (12.000₺/yıl, %12)"  v-model="b2b.core"       :min="0" :max="200" :step="1"    :display="(v) => v + ' üye'" />
          <SliderRow label="PRIME (48.000₺/yıl, %10)" v-model="b2b.prime"      :min="0" :max="100" :step="1"    :display="(v) => v + ' üye'" />
          <SliderRow label="ELITE (120.000₺/yıl, %8)" v-model="b2b.elite"      :min="0" :max="50"  :step="1"    :display="(v) => v + ' üye'" />
          <SliderRow label="APEX (300.000₺/yıl, %6)"  v-model="b2b.apex"       :min="0" :max="20"  :step="1"    :display="(v) => v + ' üye'" />
          <SliderRow label="Üye başı aylık takas ciro" v-model="b2b.avgTrade"  :min="10000" :max="500000" :step="5000" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <SliderRow label="TicariTakas reklam / ay"   v-model="b2b.adRevenue" :min="0" :max="200000" :step="5000" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
        </div>
      </section>

      <!-- BarterBorsa Parametreler -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-amber-400 font-bold uppercase tracking-wider text-xs mb-4">BarterBorsa — Kurumsal Parametreler</h2>
        <div class="space-y-2.5">
          <SliderRow label="Aktif kurum sayısı"     v-model="bb.firms"    :min="0" :max="50"        :step="1"      :display="(v) => v + ' kurum'" />
          <SliderRow label="Kurum başı SaaS bedeli" v-model="bb.saas"     :min="5000" :max="100000" :step="1000"   :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
          <SliderRow label="Kurum başı işlem hacmi" v-model="bb.tradeVol" :min="100000" :max="10000000" :step="100000" :display="(v) => (v/1000000).toFixed(1) + 'M ₺'" />
          <SliderRow label="BarterBorsa reklam / ay" v-model="bb.adRevenue" :min="0" :max="100000" :step="5000"   :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
        </div>
      </section>

      <!-- Operasyon -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-slate-400 font-bold uppercase tracking-wider text-xs mb-3">Operasyon Gideri (BX %50 · TT %30 · BB %20)</h2>
        <SliderRow label="Aylık toplam gider" v-model="opsCost" :min="20000" :max="300000" :step="5000" :display="(v) => v.toLocaleString('tr-TR') + ' ₺'" />
      </section>

      <!-- Konsolide Özet -->
      <Motion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.4 }"
      >
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Toplam brüt gelir</p>
            <p class="text-lg font-black text-blue-400 mt-1">{{ fmt(calc.brutGelir) }}</p>
          </div>
          <div class="bg-red-600/10 border border-red-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Toplam gider</p>
            <p class="text-lg font-black text-red-400 mt-1">{{ fmt(calc.toplamGider) }}</p>
          </div>
          <div class="bg-amber-600/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <p class="text-xs text-slate-400">Vergi yükü</p>
            <p class="text-lg font-black text-amber-400 mt-1">{{ fmt(calc.vergiYuku) }}</p>
          </div>
          <div
            class="rounded-2xl p-4 text-center border"
            :class="calc.netKar >= 0 ? 'bg-emerald-600/10 border-emerald-500/30' : 'bg-red-600/10 border-red-500/30'"
          >
            <p class="text-xs text-slate-400">Konsolide net kâr</p>
            <p class="text-lg font-black mt-1" :class="calc.netKar >= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ fmt(calc.netKar) }}
            </p>
          </div>
        </div>

        <!-- Platform bazlı 3 panel -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <!-- BazarX -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 class="text-purple-400 font-bold text-sm mb-3">BazarX — B2C</h3>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Aidat geliri</span>
                <span class="text-white font-medium">{{ fmt(calc.aidatGeliri) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Satıcı komisyonu</span>
                <span class="text-white font-medium">{{ fmt(calc.bxSatKom) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Hizmet bedeli</span>
                <span class="text-white font-medium">{{ fmt(calc.bxHizmet + calc.bxHizmetKdv) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Giderler</span>
                <span class="text-red-400 font-medium">{{ fmt(calc.bxGider) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Vergi</span>
                <span class="text-amber-400 font-medium">{{ fmt(calc.bxVergi) }}</span>
              </div>
              <div class="flex justify-between pt-1.5 font-bold">
                <span class="text-white">Net kâr</span>
                <span :class="calc.bxNet >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ fmt(calc.bxNet) }}</span>
              </div>
            </div>
          </div>

          <!-- TicariTakas -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 class="text-emerald-400 font-bold text-sm mb-3">TicariTakas — B2B</h3>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Aidat (aylık)</span>
                <span class="text-white font-medium">{{ fmt(calc.ttAidat) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">İşlem komisyonu</span>
                <span class="text-white font-medium">{{ fmt(calc.ttKom) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Operasyon</span>
                <span class="text-red-400 font-medium">{{ fmt(calc.ttOps) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">KDV + Stopaj + KV</span>
                <span class="text-amber-400 font-medium">{{ fmt(calc.ttVergi) }}</span>
              </div>
              <div class="flex justify-between pt-1.5 font-bold">
                <span class="text-white">Net kâr</span>
                <span :class="calc.ttNet >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ fmt(calc.ttNet) }}</span>
              </div>
            </div>
          </div>

          <!-- BarterBorsa -->
          <div class="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 class="text-amber-400 font-bold text-sm mb-3">BarterBorsa — Kurumsal</h3>
            <div class="space-y-1 text-xs">
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">SaaS lisans</span>
                <span class="text-white font-medium">{{ fmt(calc.bbSaas) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">İşlem yönetim (%6)</span>
                <span class="text-white font-medium">{{ fmt(calc.bbKom) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">Operasyon</span>
                <span class="text-red-400 font-medium">{{ fmt(calc.bbOps) }}</span>
              </div>
              <div class="flex justify-between py-0.5 border-b border-white/5">
                <span class="text-slate-400">KDV + KV</span>
                <span class="text-amber-400 font-medium">{{ fmt(calc.bbKdvN + calc.bbKv) }}</span>
              </div>
              <div class="flex justify-between pt-1.5 font-bold">
                <span class="text-white">Net kâr</span>
                <span :class="calc.bbNet >= 0 ? 'text-emerald-400' : 'text-red-400'">{{ fmt(calc.bbNet) }}</span>
              </div>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Gelir/Gider Bar Grafik -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Gelir & Gider Dağılımı</h2>
        <div class="overflow-x-auto">
          <svg :width="CHART_W" :height="CHART_H + 24" class="min-w-full">
            <!-- Sıfır çizgisi -->
            <line :x1="0" :y1="CHART_H - 20" :x2="CHART_W" :y2="CHART_H - 20"
                  stroke="rgba(255,255,255,0.1)" stroke-width="1" />
            <!-- Barlar -->
            <g v-for="(bar, i) in barSvg" :key="i">
              <rect
                :x="bar.x" :y="bar.y"
                :width="bar.barW" :height="bar.h"
                :fill="bar.col" rx="3" opacity="0.85"
              />
              <!-- Değer etiketi -->
              <text
                :x="bar.x + bar.barW / 2"
                :y="bar.val >= 0 ? bar.y - 2 : bar.y + bar.h + 10"
                fill="rgba(255,255,255,0.6)"
                font-size="7"
                text-anchor="middle"
              >{{ fmtK(bar.val) }}</text>
              <!-- Alt etiket -->
              <text
                :x="bar.x + bar.barW / 2"
                :y="CHART_H + 14"
                fill="rgba(148,163,184,0.7)"
                font-size="7"
                text-anchor="middle"
              >{{ bar.label }}</text>
            </g>
          </svg>
        </div>
      </section>

      <!-- Vergi Tablosu §5.2 -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Vergisel Yükümlülükler — Aylık</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <!-- BazarX KDV -->
          <div class="bg-black/20 rounded-xl p-4 space-y-2">
            <p class="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">BazarX KDV</p>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">Tahakkuk (%20)</span>
              <span class="text-white">{{ fmt(calc.bxKdvT - calc.bxHizmetKdv) }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">Hizmet KDV'si</span>
              <span class="text-white">{{ fmt(calc.bxHizmetKdv) }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">İndirilecek KDV</span>
              <span class="text-emerald-400">−{{ fmt(calc.bxKdvI) }}</span>
            </div>
            <div class="flex justify-between font-bold pt-1">
              <span class="text-white">Net KDV</span>
              <span class="text-red-400">{{ fmt(calc.bxKdvN) }}</span>
            </div>
          </div>
          <!-- TT KDV + Stopaj -->
          <div class="bg-black/20 rounded-xl p-4 space-y-2">
            <p class="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">TicariTakas KDV + Stopaj</p>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">KDV (%20)</span>
              <span class="text-white">{{ fmt(calc.ttKdv) }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">Stopaj (%10×kom.)</span>
              <span class="text-white">{{ fmt(calc.ttStopaj) }}</span>
            </div>
            <div class="flex justify-between font-bold pt-1">
              <span class="text-white">Toplam</span>
              <span class="text-red-400">{{ fmt(calc.ttKdv + calc.ttStopaj) }}</span>
            </div>
          </div>
          <!-- KV + Damga -->
          <div class="bg-black/20 rounded-xl p-4 space-y-2">
            <p class="text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">Kurumlar V. + Damga</p>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">KV (%25→aylık)</span>
              <span class="text-white">{{ fmt(calc.bxKv + calc.ttKv + calc.bbKv) }}</span>
            </div>
            <div class="flex justify-between border-b border-white/5 pb-1">
              <span class="text-slate-500">Damga (‰1)</span>
              <span class="text-white">{{ fmt(calc.bxDamga) }}</span>
            </div>
            <div class="flex justify-between font-bold pt-1">
              <span class="text-white">Konsolide toplam</span>
              <span class="text-red-400">{{ fmt(calc.vergiYuku) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Kırılım Noktası Grafiği -->
      <section class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h2 class="text-slate-300 font-bold text-xs uppercase tracking-wider mb-4">Kırılım Noktası — B2C Üye Sayısına Göre Net Kâr</h2>
        <div class="overflow-x-auto">
          <svg :width="CHART_W" :height="CHART_H + 24" class="min-w-full">
            <!-- Sıfır çizgisi -->
            <line :x1="10" :y1="lineSvg.zeroY" :x2="CHART_W - 10" :y2="lineSvg.zeroY"
                  stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="4,4" />
            <!-- Çizgi -->
            <path :d="lineSvg.path" fill="none" stroke="#a855f7" stroke-width="2" />
            <!-- Nokta etiketleri -->
            <g v-for="(pt, i) in lineSvg.pts" :key="i">
              <circle :cx="pt.svgX" :cy="pt.svgY" r="3"
                      :fill="pt.y >= 0 ? '#34d399' : '#f87171'" />
              <text
                :x="pt.svgX"
                :y="pt.svgY - 5"
                fill="rgba(148,163,184,0.7)"
                font-size="7"
                text-anchor="middle"
              >{{ pt.x.toLocaleString('tr-TR') }}ü</text>
            </g>
          </svg>
        </div>
        <p class="text-slate-500 text-xs mt-2 text-center">
          Yatay: B2C üye sayısı · Dikey: Konsolide net kâr · Mor çizgi sıfırı geçtiği nokta kırılım noktasıdır
        </p>
      </section>

      <!-- Uyarılar -->
      <div v-if="!tierValid" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-400">
        ⚠️ Tier dağılımı toplamı {{ tierTotal }}% — 100% olmalıdır.
      </div>
      <div v-if="calc.netKar < 0" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
        ⚠️ Model zarar ediyor. Üye sayısını artırın veya operasyon giderini düşürün.
      </div>
      <div v-if="calc.bbNet < 0" class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-sm text-amber-400">
        ⚠️ BarterBorsa bu kurum sayısıyla kârsız.
      </div>

    </div>
  </div>
</template>
