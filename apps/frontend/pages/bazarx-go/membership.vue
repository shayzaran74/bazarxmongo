<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">
<!-- Header -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06]">
      <div class="max-w-6xl mx-auto flex items-center gap-4 px-5 py-4">
        <NuxtLink to="/bazarx-go" class="p-2 rounded-full hover:bg-[var(--surface)] transition-all">
          <ArrowLeftIcon class="w-5 h-5" />
        </NuxtLink>
        <div>
          <h1 class="font-black text-lg leading-none">Üyelik Seç</h1>
          <p class="text-xs text-black/40 mt-0.5">Ödediğinin 2 katı menü hakkı</p>
        </div>
      </div>
    </header>

    <div class="max-w-6xl mx-auto px-5 py-10 space-y-12">

      <!-- Hero açıklama -->
      <div class="text-center space-y-3 max-w-2xl mx-auto">
        <div class="inline-flex items-center gap-2 px-4 py-2 bg-[var(--brand)]/10 rounded-full text-xs font-black text-[var(--brand-deep)] uppercase tracking-widest">
          ⚡ BazarX-GO Üyeliği
        </div>
        <h2 class="text-3xl md:text-4xl font-black leading-tight">
          Aylık aidatının<br>
          <span class="text-[var(--brand-deep)]">2 katı</span> menü hakkı kazan
        </h2>
        <p class="text-black/50 text-sm leading-relaxed">
          Restorana git, QR göster, öde — teslimat yok, bekleme yok.
          Üst tierlerde VIP restoranlara erişim açılır.
        </p>
      </div>

      <!-- Mevcut abonelik bilgisi -->
      <div v-if="currentTier"
        class="max-w-xl mx-auto bg-green-50 border border-green-200 rounded-3xl p-6 flex items-center justify-between gap-4">
        <div>
          <p class="text-[10px] font-black uppercase tracking-widest text-green-600">Mevcut Üyeliğin</p>
          <p class="font-black text-lg text-green-900 mt-1">{{ TIER_NAMES[currentTier] }}</p>
          <p class="text-xs text-green-700 mt-0.5">Menü hakkı: {{ formatCurrency(SUBSCRIPTION_FEES[currentTier] * 2) }}/ay</p>
        </div>
        <NuxtLink to="/bazarx-go/wallet"
          class="bg-green-600 text-white px-5 py-2.5 rounded-full text-xs font-black hover:bg-green-700 transition-all">
          Cüzdanım
        </NuxtLink>
      </div>

      <!-- Tier kartları -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div v-for="tier in TIERS" :key="tier.id"
          class="relative bg-white rounded-3xl border-2 overflow-hidden transition-all hover:-translate-y-1 hover:shadow-xl"
          :class="[
            currentTier === tier.id ? 'border-[var(--brand-deep)]' : 'border-black/[0.06]',
            tier.popular ? 'ring-2 ring-[var(--brand)]/30' : ''
          ]">

          <!-- Popüler badge -->
          <div v-if="tier.popular"
            class="absolute top-3 right-3 bg-[var(--brand-deep)] text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
            En Popüler
          </div>

          <!-- Renk şeridi -->
          <div class="h-1.5 w-full" :style="{ backgroundColor: tier.color }" />

          <div class="p-6 space-y-5">
            <!-- Tier adı + grup -->
            <div>
              <span class="text-[10px] font-black uppercase tracking-widest" :style="{ color: tier.color }">
                {{ tier.group }}
              </span>
              <h3 class="font-black text-xl mt-1">{{ tier.name }}</h3>
            </div>

            <!-- Fiyat -->
            <div>
              <div class="flex items-baseline gap-1">
                <span class="text-3xl font-black">{{ formatCurrency(tier.price) }}</span>
                <span class="text-xs text-black/40 font-bold">/ay</span>
              </div>
              <p class="text-xs text-black/50 mt-1">
                → <span class="font-black text-[var(--brand-deep)]">{{ formatCurrency(tier.price * 2) }}</span> menü hakkı
              </p>
            </div>

            <!-- Kategori erişimi -->
            <div class="space-y-1.5">
              <p class="text-[10px] font-black uppercase tracking-widest text-black/40">Erişim</p>
              <div class="flex flex-wrap gap-1">
                <span v-for="cat in tier.categories" :key="cat"
                  class="px-2 py-0.5 bg-[var(--surface)] rounded-full text-[10px] font-bold text-black/60">
                  {{ cat }}
                </span>
              </div>
            </div>

            <!-- XP şartı -->
            <div v-if="tier.xpRequired" class="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-2xl px-3 py-2">
              <span>⭐</span>
              <span class="font-bold">Min. XP şartı var</span>
            </div>

            <!-- Seç butonu -->
            <button
              :disabled="currentTier === tier.id || purchasing === tier.id"
              class="w-full py-3 rounded-2xl text-sm font-black transition-all"
              :class="currentTier === tier.id
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-[var(--ink)] text-white hover:bg-black/80 active:scale-95'"
              @click="selectTier(tier.id)"
            >
              <span v-if="currentTier === tier.id">✓ Mevcut Plan</span>
              <span v-else-if="purchasing === tier.id">İşleniyor...</span>
              <span v-else>Bu Planı Seç</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SSS özeti -->
      <div class="max-w-2xl mx-auto space-y-4">
        <h3 class="font-black text-xl text-center">Nasıl çalışır?</h3>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div v-for="step in HOW_IT_WORKS" :key="step.step"
            class="bg-white rounded-3xl p-6 border border-black/[0.06] text-center space-y-2">
            <div class="text-3xl">{{ step.emoji }}</div>
            <p class="font-black text-sm">{{ step.title }}</p>
            <p class="text-xs text-black/50 leading-relaxed">{{ step.desc }}</p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: false })
useHead({ title: 'Üyelik Seç — BazarX Go' })

const { $api } = useApi()
const toast = useNuxtApp().$toast

const currentTier = ref<string | null>(null)
const purchasing  = ref<string | null>(null)

const SUBSCRIPTION_FEES: Record<string, number> = {
  BRONZE_P1: 199,  BRONZE_P2: 399,
  SILVER_P1: 699,  SILVER_P2: 999,
  GOLD_P1:   1499, GOLD_P2:   1999,
  DIAMOND_P1:2999, DIAMOND_P2:4999,
}

const TIER_NAMES: Record<string, string> = {
  BRONZE_P1: 'Bronz Prime 1',  BRONZE_P2: 'Bronz Prime 2',
  SILVER_P1: 'Gümüş Prime 1', SILVER_P2: 'Gümüş Prime 2',
  GOLD_P1:   'Altın Prime 1',  GOLD_P2:   'Altın Prime 2',
  DIAMOND_P1:'Elmas Prime 1',  DIAMOND_P2:'Elmas Prime 2',
}

const TIERS = [
  {
    id: 'BRONZE_P1', group: 'Bronz', name: 'Prime 1', price: 199,
    color: '#b45309', popular: false, xpRequired: false,
    categories: ['Dondurma & Ekler'],
  },
  {
    id: 'BRONZE_P2', group: 'Bronz', name: 'Prime 2', price: 399,
    color: '#b45309', popular: false, xpRequired: false,
    categories: ['Kahve', 'Dondurma'],
  },
  {
    id: 'SILVER_P1', group: 'Gümüş', name: 'Prime 1', price: 699,
    color: '#6b7280', popular: true, xpRequired: false,
    categories: ['Tatlı', 'Kahve', 'Dondurma'],
  },
  {
    id: 'SILVER_P2', group: 'Gümüş', name: 'Prime 2', price: 999,
    color: '#6b7280', popular: false, xpRequired: false,
    categories: ['Casual', 'Tatlı', '+daha'],
  },
  {
    id: 'GOLD_P1', group: 'Altın', name: 'Prime 1', price: 1499,
    color: '#d97706', popular: false, xpRequired: true,
    categories: ['Mid-Point', 'Casual', '+daha'],
  },
  {
    id: 'GOLD_P2', group: 'Altın', name: 'Prime 2', price: 1999,
    color: '#d97706', popular: false, xpRequired: true,
    categories: ['Mid-Point (Genişletilmiş)', '+daha'],
  },
  {
    id: 'DIAMOND_P1', group: 'Elmas', name: 'Prime 1', price: 2999,
    color: '#7c3aed', popular: false, xpRequired: true,
    categories: ['VIP Fine Dining', 'Tüm Kategoriler'],
  },
  {
    id: 'DIAMOND_P2', group: 'Elmas', name: 'Prime 2', price: 4999,
    color: '#7c3aed', popular: false, xpRequired: true,
    categories: ['VIP Fine Dining', 'Öncelikli Rezervasyon'],
  },
]

const HOW_IT_WORKS = [
  { step: 1, emoji: '🎟️', title: 'Üye Ol', desc: 'Aylık aidat öde, 2 katı değerinde menü hakkı kazan.' },
  { step: 2, emoji: '🍽️', title: 'Menü Satın Al', desc: 'Restoran listesinden istediğin menüyü seç, QR cüzdanına düşsün.' },
  { step: 3, emoji: '📲', title: 'Restorana Git', desc: 'QR\'ı restorana göster — nakit ödemesiz menünü al.' },
]

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v)

const fetchCurrentTier = async (): Promise<void> => {
  try {
    const res = await $api<{ success: boolean; data: { tier?: string } }>('/api/v1/subscriptions/me')
    currentTier.value = res.data?.tier ?? null
  } catch { /* giriş yoksa null kalır */ }
}

const selectTier = async (tierId: string): Promise<void> => {
  purchasing.value = tierId
  try {
    await $api('/api/v1/subscriptions/subscribe', {
      method: 'POST',
      body: { tier: tierId },
    })
    currentTier.value = tierId
    toast.success(`${TIER_NAMES[tierId]} üyeliğin başlatıldı! 🎉`)
    navigateTo('/bazarx-go/wallet')
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    toast.error(msg ?? 'Üyelik başlatılamadı')
  } finally {
    purchasing.value = null
  }
}

onMounted(fetchCurrentTier)
</script>

<style scoped>
.bazarx-go {
  --bg: #fafaf8; --ink: #111; --brand: #ff6b35; --brand-deep: #c94b1f;
  --brand-soft: #ff9e78; --surface: #f5f5f3; --surface-2: #ebebea;
}
</style>
