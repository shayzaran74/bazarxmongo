<template>
  <div class="min-h-screen bg-neutral-50">

    <!-- ── HERO ──────────────────────────────────────────────────────────── -->
    <section
      class="relative overflow-hidden"
      :style="{ background: currentTierData?.bgGradient ?? 'linear-gradient(135deg,#1e3a5f,#0f1f36)' }"
    >
      <div class="absolute inset-0 bg-black/20 pointer-events-none" />
      <div class="relative max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">

        <!-- Sol: mevcut tier -->
        <div class="flex-1 text-white space-y-4">
          <span class="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">MÜŞTERİ YATIRIM KATEGORİSİ</span>
          <div class="flex items-center gap-6">
            <span class="text-7xl drop-shadow-2xl">{{ currentTierData?.icon ?? '🏆' }}</span>
            <div>
              <h1 class="text-5xl font-black italic tracking-tighter uppercase leading-none">
                {{ currentTierData?.nametr ?? currentVendorTier }}
              </h1>
              <p class="text-sm font-bold opacity-70 mt-2">{{ currentTierData?.description }}</p>
            </div>
          </div>
          <div class="flex gap-4 mt-4">
            <div class="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-2xl font-black italic">%{{ ((currentTierData?.commissionRate.cash ?? 0.12) * 100).toFixed(0) }}</span>
              <span class="text-[9px] font-black uppercase opacity-60">Nakit Komisyon</span>
            </div>
            <div class="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-2xl font-black italic">{{ currentTierData?.xpMultiplier ?? 1 }}x</span>
              <span class="text-[9px] font-black uppercase opacity-60">XP Çarpanı</span>
            </div>
            <div class="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-center">
              <span class="block text-2xl font-black italic">%{{ ((currentTierData?.roiRate ?? 0.5) * 100).toFixed(0) }}</span>
              <span class="text-[9px] font-black uppercase opacity-60">ROI Oranı</span>
            </div>
          </div>
        </div>

        <!-- Sağ: XP / Loyalty bilgisi -->
        <div class="w-full md:w-80 bg-white/10 backdrop-blur-md border border-white/20 rounded-[2rem] p-8 text-white space-y-5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-black uppercase tracking-widest opacity-70">SADAKAT SEVİYESİ</span>
            <span
              class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
              :class="loyaltyBadgeClass"
            >{{ xpData.tier }}</span>
          </div>

          <div class="space-y-2">
            <div class="flex justify-between text-xs font-black">
              <span>{{ xpData.currentXp.toLocaleString('tr-TR') }} XP</span>
              <span class="opacity-60">{{ xpData.nextTierMinXp.toLocaleString('tr-TR') }} XP</span>
            </div>
            <div class="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full bg-white transition-all duration-1000"
                :style="{ width: `${xpProgressPercent}%` }"
              />
            </div>
            <p class="text-[9px] font-black uppercase opacity-60 text-right">
              {{ xpData.isMaxTier ? 'EN ÜST SEVİYE' : `SONRAKİ TİER İÇİN ${(xpData.nextTierMinXp - xpData.currentXp).toLocaleString('tr-TR')} XP` }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 pt-2 border-t border-white/10">
            <div class="text-center">
              <span class="block text-xl font-black italic">{{ xpData.currentXp.toLocaleString('tr-TR') }}</span>
              <span class="text-[9px] font-black uppercase opacity-60">Mevcut XP</span>
            </div>
            <div class="text-center">
              <span class="block text-xl font-black italic">{{ xpData.lifetimeXp.toLocaleString('tr-TR') }}</span>
              <span class="text-[9px] font-black uppercase opacity-60">Toplam XP</span>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- ── TİER KARŞILAŞTIRMA ────────────────────────────────────────────── -->
    <section class="max-w-7xl mx-auto px-6 py-16 space-y-10">
      <div class="text-center space-y-2">
        <span class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">SEVİYE KARŞILAŞTIRMASI</span>
        <h2 class="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">TİCARİ TAKAS TİER SİSTEMİ</h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div
          v-for="(td, key) in TIER_BENEFITS"
          :key="key"
          class="bg-white rounded-[2.5rem] shadow-sm border-2 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
          :class="currentVendorTier === key
            ? 'border-current scale-[1.02] shadow-xl'
            : 'border-gray-100'"
          :style="currentVendorTier === key ? { borderColor: td.color } : {}"
        >
          <!-- Tier header -->
          <div class="p-6 text-white relative overflow-hidden" :style="{ background: td.bgGradient }">
            <div class="flex justify-between items-start">
              <span class="text-4xl">{{ td.icon }}</span>
              <div class="flex flex-col items-end gap-1">
                <span class="px-3 py-1 bg-black/20 rounded-xl text-[10px] font-black uppercase tracking-widest">{{ key }}</span>
                <span v-if="currentVendorTier === key" class="px-2 py-0.5 bg-white text-[9px] font-black uppercase tracking-widest rounded-lg" :style="{ color: td.color }">AKTİF</span>
              </div>
            </div>
            <h3 class="mt-4 text-xl font-black italic uppercase tracking-tighter">{{ td.nametr }}</h3>
            <p class="text-white/70 text-[10px] font-bold mt-1 leading-relaxed">{{ td.description }}</p>
          </div>

          <!-- Komisyon -->
          <div class="p-5 border-b border-gray-50 grid grid-cols-2 gap-3">
            <div class="bg-gray-50 rounded-2xl p-3 text-center">
              <span class="block text-xl font-black text-gray-900">%{{ (td.commissionRate.cash * 100).toFixed(0) }}</span>
              <span class="text-[9px] font-black uppercase text-gray-400">Nakit</span>
            </div>
            <div class="bg-gray-50 rounded-2xl p-3 text-center">
              <span class="block text-xl font-black text-gray-900">{{ td.xpMultiplier }}x</span>
              <span class="text-[9px] font-black uppercase text-gray-400">XP Çarpanı</span>
            </div>
          </div>

          <!-- Limitler -->
          <div class="p-5 border-b border-gray-50 space-y-2">
            <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 block">LİMİTLER</span>
            <div v-for="row in [
              ['Çekim', formatCurrency(td.limits.dailyWithdraw)],
              ['Transfer', formatCurrency(td.limits.dailyTransfer)],
              ['Barter Havuz', td.limits.barterPoolLimit ? formatCurrency(td.limits.barterPoolLimit) : 'Sınırsız'],
            ]" :key="row[0]" class="flex justify-between text-xs">
              <span class="text-gray-500 font-bold">{{ row[0] }}</span>
              <span class="font-black text-gray-900">{{ row[1] }}</span>
            </div>
          </div>

          <!-- Avantajlar -->
          <div class="p-5 space-y-2">
            <span class="text-[9px] font-black uppercase tracking-widest text-gray-400 block">AVANTAJLAR</span>
            <ul class="space-y-2">
              <li v-for="b in td.benefits.slice(0, 4)" :key="b" class="flex items-start gap-2 text-[10px] font-bold text-gray-700">
                <span class="w-4 h-4 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0 text-[8px]">✓</span>
                {{ b }}
              </li>
            </ul>
          </div>

          <!-- Aidat -->
          <div class="px-5 pb-5">
            <div
              class="w-full text-center py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              :class="currentVendorTier === key ? 'text-white' : 'bg-gray-50 text-gray-500'"
              :style="currentVendorTier === key ? { backgroundColor: td.color } : {}"
            >
              {{ currentVendorTier === key ? '✓ MEVCUT SEVİYENİZ' : formatCurrency(td.limits.dailyWithdraw / 10) + ' / YIL' }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── TIER YÜKSELTMESİ CTA ─────────────────────────────────────────── -->
    <section v-if="currentVendorTier !== 'APEX'" class="max-w-4xl mx-auto px-6 py-8">
      <div
        class="rounded-[2rem] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8"
        :style="{ background: currentTierData?.bgGradient }"
      >
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-widest opacity-70">MEVCUT SEVİYENİZ</p>
          <h2 class="text-3xl font-black italic uppercase tracking-tighter">{{ currentTierData?.nametr }} → {{ TIER_BENEFITS[nextTierKey!]?.nametr }}</h2>
          <p class="text-sm font-bold opacity-80">Tier yükseltmek için son 1 ayda {{ formatCurrency(TIER_BENEFITS[currentVendorTier].limits.barterPoolLimit ? TIER_BENEFITS[currentVendorTier].limits.barterPoolLimit! * 5 : 0) }} ciro şartı aranır.</p>
        </div>
        <button
          :disabled="upgrading"
          class="shrink-0 bg-white font-black text-[11px] uppercase tracking-widest px-10 py-5 rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          :style="{ color: currentTierData?.color }"
          @click="openUpgradeModal"
        >
          {{ upgrading ? 'İşleniyor...' : `${TIER_BENEFITS[nextTierKey!]?.nametr} Tier\'e Yükselt →` }}
        </button>
      </div>
    </section>

    <!-- Yükseltme Modalı -->
    <div v-if="upgradeModal" class="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="upgradeModal = false" />
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 space-y-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">Tier Yükseltme</h2>
          <p class="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{{ currentVendorTier }} → {{ nextTierKey }}</p>
        </div>
        <div class="bg-gray-50 rounded-2xl p-6 space-y-3">
          <div class="flex justify-between text-sm">
            <span class="font-bold text-gray-600">Yeni yıllık aidat</span>
            <span class="font-black text-gray-900">{{ nextTierKey ? formatCurrency(TIER_BENEFITS[nextTierKey].limits.dailyWithdraw * 10) : '—' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="font-bold text-gray-600">Komisyon indirimi</span>
            <span class="font-black text-green-600">%{{ nextTierKey ? ((TIER_BENEFITS[currentVendorTier].commissionRate.cash - TIER_BENEFITS[nextTierKey].commissionRate.cash) * 100).toFixed(0) : 0 }} tasarruf</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="font-bold text-gray-600">XP ile ödeme (maks %50)</span>
            <span class="font-black text-indigo-600">{{ xpData.currentXp.toLocaleString('tr-TR') }} XP mevcut</span>
          </div>
        </div>
        <div class="space-y-3">
          <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Kullanılacak XP Miktarı</label>
          <input v-model.number="xpToUse" type="number" min="0" :max="xpData.currentXp"
            class="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-indigo-500 outline-none transition-all" />
        </div>
        <div class="flex gap-4 pt-2">
          <button class="px-8 py-4 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest" @click="upgradeModal = false">Vazgeç</button>
          <button :disabled="upgrading"
            class="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
            @click="confirmUpgrade">
            {{ upgrading ? 'Yükseltiliyor...' : 'Yükseltmeyi Onayla' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── SSS ───────────────────────────────────────────────────────────── -->
    <section class="max-w-3xl mx-auto px-6 pb-20 space-y-6">
      <h2 class="text-2xl font-black italic uppercase tracking-tighter text-gray-900 text-center">Sıkça Sorulan Sorular</h2>
      <div
        v-for="(faq, i) in FAQS"
        :key="i"
        class="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden"
      >
        <button
          class="w-full flex items-center justify-between p-6 text-left group"
          @click="openFaq = openFaq === i ? null : i"
        >
          <span class="text-sm font-black text-gray-900 uppercase tracking-tight">{{ faq.q }}</span>
          <span class="text-gray-400 font-black text-lg transition-transform duration-300" :class="openFaq === i ? 'rotate-45' : ''">+</span>
        </button>
        <div v-show="openFaq === i" class="px-6 pb-6">
          <p class="text-xs font-bold text-gray-500 leading-relaxed">{{ faq.a }}</p>
        </div>
      </div>
    </section>

  </div>
</template>

<script setup lang="ts">
import { TIER_BENEFITS, type TierKey } from '~/utils/tierBenefits'

useHead({
  title: 'Tier Avantajları — TicariTakas',
  meta: [{ name: 'description', content: 'TicariTakas tier avantajlarını keşfedin. Daha fazla indirim, yüksek limitler ve özel ayrıcalıklar.' }],
})

// ── Tipler ──────────────────────────────────────────────────────────────────

interface VendorTierResponse {
  success: boolean
  data: { tier?: string; vendorId?: string | null }
}

interface XpBalanceResponse {
  success: boolean
  data: {
    currentXp?: number
    lifetimeXp?: number
    level?: number
    tier?: string
    nextTierXp?: number
  }
}

interface XpState {
  tier: string
  currentXp: number
  lifetimeXp: number
  nextTierMinXp: number
  isMaxTier: boolean
}

// ── Reaktif state ────────────────────────────────────────────────────────────

const { $api } = useApi()

const currentVendorTier = ref<TierKey>('CORE')
const xpData = ref<XpState>({
  tier: 'BRONZE',
  currentXp: 0,
  lifetimeXp: 0,
  nextTierMinXp: 1000,
  isMaxTier: false,
})
const openFaq    = ref<number | null>(null)
const upgradeModal = ref(false)
const upgrading    = ref(false)
const xpToUse      = ref(0)

const TIER_ORDER: TierKey[] = ['CORE', 'PRIME', 'ELITE', 'APEX']
const nextTierKey = computed<TierKey | null>(() => {
  const idx = TIER_ORDER.indexOf(currentVendorTier.value)
  return idx >= 0 && idx < TIER_ORDER.length - 1 ? TIER_ORDER[idx + 1] : null
})

const openUpgradeModal = (): void => {
  xpToUse.value = 0
  upgradeModal.value = true
}

const confirmUpgrade = async (): Promise<void> => {
  if (!nextTierKey.value) return
  upgrading.value = true
  try {
    await $api('/api/v1/subscriptions/upgrade', {
      method: 'POST',
      body: { newTier: nextTierKey.value, xpAmount: xpToUse.value },
    })
    currentVendorTier.value = nextTierKey.value
    upgradeModal.value = false
    useNuxtApp().$toast?.success(`${TIER_BENEFITS[nextTierKey.value].nametr} tier'a yükseltildiniz!`)
  } catch (error: unknown) {
    const msg = (error as { data?: { message?: string } })?.data?.message
    useNuxtApp().$toast?.error(msg ?? 'Yükseltme işlemi başarısız')
  } finally {
    upgrading.value = false
  }
}

// ── Computed ─────────────────────────────────────────────────────────────────

const currentTierData = computed(() => TIER_BENEFITS[currentVendorTier.value])

const xpProgressPercent = computed(() => {
  if (xpData.value.isMaxTier) return 100
  const pct = (xpData.value.currentXp / xpData.value.nextTierMinXp) * 100
  return Math.min(Math.round(pct), 100)
})

const loyaltyBadgeClass = computed(() => ({
  BRONZE:   'bg-amber-700/40 text-amber-100',
  SILVER:   'bg-gray-400/30 text-gray-100',
  GOLD:     'bg-yellow-400/30 text-yellow-100',
  PLATINUM: 'bg-blue-400/30 text-blue-100',
  DIAMOND:  'bg-purple-400/30 text-purple-100',
}[xpData.value.tier] ?? 'bg-white/20 text-white'))

// ── Yardımcılar ───────────────────────────────────────────────────────────────

const LOYALTY_THRESHOLDS: Record<string, number> = {
  BRONZE: 0, SILVER: 1000, GOLD: 5000, PLATINUM: 15000, DIAMOND: 50000,
}
const LOYALTY_ORDER = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

function resolveNextTierXp(tierName: string, currentXp: number): { nextXp: number; isMax: boolean } {
  const idx = LOYALTY_ORDER.indexOf(tierName)
  if (idx === -1 || idx === LOYALTY_ORDER.length - 1) return { nextXp: currentXp, isMax: true }
  return { nextXp: LOYALTY_THRESHOLDS[LOYALTY_ORDER[idx + 1]] ?? currentXp, isMax: false }
}

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v)

// ── API çağrıları ─────────────────────────────────────────────────────────────

async function fetchVendorTier(): Promise<void> {
  try {
    const res = await $api<VendorTierResponse>('/api/v1/tiers/me')
    const tier = res?.data?.tier as TierKey | undefined
    if (tier && tier in TIER_BENEFITS) currentVendorTier.value = tier
  } catch { /* kullanıcı satıcı değilse CORE varsayılan olarak kalır */ }
}

async function fetchXpBalance(): Promise<void> {
  try {
    const res = await $api<XpBalanceResponse>('/api/v1/xp/balance')
    const d = res?.data ?? {}
    const tier   = d.tier ?? 'BRONZE'
    const curXp  = d.currentXp ?? 0
    const { nextXp, isMax } = resolveNextTierXp(tier, curXp)
    xpData.value = {
      tier,
      currentXp:    curXp,
      lifetimeXp:   d.lifetimeXp ?? 0,
      nextTierMinXp:nextXp,
      isMaxTier:    isMax,
    }
  } catch { /* XP sistemi erişilemezse sıfır göster */ }
}

onMounted(() => {
  fetchVendorTier()
  fetchXpBalance()
})

// ── SSS içeriği ───────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: 'Tier\'ım nasıl yükselir?',
    a: 'Tier\'ınız yıllık aidat planınıza ve platform üzerindeki işlem hacminize göre belirlenir. Üst tier\'a geçmek için ilgili yıllık aidatı ödeyerek ve son 1 aydaki 5× ciro koşulunu sağlayarak yükseltme talebinde bulunabilirsiniz.',
  },
  {
    q: 'Komisyon oranları ne zaman geçerli olur?',
    a: 'Tier yükseltmeniz onaylandıktan hemen sonra yeni komisyon oranları aktif hale gelir. Düşürme durumunda eski avantajlarınız 30 gün boyunca korunur.',
  },
  {
    q: 'XP nedir ve nasıl kazanılır?',
    a: 'XP (Deneyim Puanı) platformdaki sadakatinizi ölçen sadakat puanıdır. Sipariş ve barter işlemlerinden, günlük girişten ve referanslardan kazanılır. XP ile komisyon indiriminden yararlanabilirsiniz.',
  },
  {
    q: 'Barter havuz limiti ne anlama geliyor?',
    a: 'Barter havuz limitiniz, takas havuzunda aynı anda açık tutabileceğiniz maksimum teklif toplamını ifade eder. APEX seviyesinde bu limit sınırsızdır.',
  },
]
</script>
