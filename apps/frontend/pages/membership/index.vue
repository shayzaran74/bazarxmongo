<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950 pb-24">

    <!-- Hero -->
    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          BazarX <span class="text-purple-400">Üyelik</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          Aidatının 2 katı menü hakkı · Hediye çekleri · XP ile tier atla
        </p>
      </Motion>
    </div>

    <!-- Mevcut üyelik bandı -->
    <div v-if="isActive" class="max-w-3xl mx-auto px-4 mb-10">
      <Motion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
        class="bg-purple-600/10 border border-purple-500/30 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <p class="text-xs text-slate-400 uppercase tracking-wider">Aktif Üyeliğiniz</p>
          <p class="text-xl font-black text-white mt-0.5">{{ currentTier }}</p>
          <p class="text-slate-400 text-sm">
            {{ membership.subscription?.monthlyFee?.toLocaleString('tr-TR') }}₺/ay ·
            Bitiş: {{ formatDate(membership.subscription?.endDate) }}
          </p>
        </div>

        <!-- Menü kredisi çubuğu -->
        <div class="flex-1 min-w-48">
          <div class="flex justify-between text-xs mb-1">
            <span class="text-slate-400">Menü kredisi</span>
            <span class="text-white font-bold">{{ menuCredit.remaining.toLocaleString('tr-TR') }}₺ kaldı</span>
          </div>
          <div class="bg-white/10 rounded-full h-2">
            <div
              class="bg-purple-500 h-2 rounded-full transition-all"
              :style="{ width: creditPct + '%' }"
            />
          </div>
          <p class="text-xs text-slate-500 mt-1">
            {{ menuCredit.used.toLocaleString('tr-TR') }}₺ / {{ menuCredit.total.toLocaleString('tr-TR') }}₺ kullanıldı
          </p>
        </div>

        <!-- Upgrade eligibility -->
        <div v-if="eligibility" class="text-sm">
          <p class="text-slate-400 text-xs">Yükseltme eşiği</p>
          <div class="flex items-center gap-2 mt-1">
            <div class="w-24 bg-white/10 rounded-full h-1.5">
              <div
                class="h-1.5 rounded-full transition-all"
                :class="eligibility.eligible ? 'bg-emerald-500' : eligibility.nearThreshold ? 'bg-amber-500' : 'bg-purple-500'"
                :style="{ width: Math.min(100, eligibility.revenueProgress) + '%' }"
              />
            </div>
            <span
              class="font-bold text-xs"
              :class="eligibility.eligible ? 'text-emerald-400' : eligibility.nearThreshold ? 'text-amber-400' : 'text-slate-400'"
            >
              %{{ eligibility.revenueProgress }}
            </span>
          </div>
          <p v-if="eligibility.nearThreshold && !eligibility.eligible" class="text-amber-400 text-xs mt-0.5">
            Neredeyse! Yükseltmeye hazır oluyorsunuz.
          </p>
          <p v-if="eligibility.eligible" class="text-emerald-400 text-xs mt-0.5 font-bold">
            Tier yükseltmeye hazırsınız!
          </p>
        </div>
      </Motion>
    </div>

    <!-- Plan kartları -->
    <div class="max-w-6xl mx-auto px-4">
      <div v-if="pending" class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="i in 8" :key="i" class="h-64 bg-white/5 rounded-2xl animate-pulse" />
      </div>

      <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Motion
          v-for="(plan, i) in plans"
          :key="plan.tier"
          :initial="{ opacity: 0, filter: 'blur(8px)', y: 20 }"
          :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
          :transition="{ duration: 0.45, delay: i * 0.09 }"
          :while-hover="{ y: -7, scale: 1.02 }"
          class="relative"
        >
          <div
            class="h-full border rounded-2xl p-5 flex flex-col transition-colors"
            :class="currentTier === plan.tier
              ? 'bg-purple-600/20 border-purple-500'
              : 'bg-white/5 border-white/10 hover:border-purple-500/40'"
          >
            <div v-if="currentTier === plan.tier" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-0.5 rounded-full">
              Aktif
            </div>
            <p class="text-xs text-slate-400 uppercase tracking-wider">{{ tierLabel(plan.tier) }}</p>
            <p class="text-2xl font-black text-white mt-1">{{ plan.monthlyFee.toLocaleString('tr-TR') }}<span class="text-sm font-normal text-slate-400">₺/ay</span></p>
            <p class="text-purple-400 text-xs mt-1">{{ plan.menuCredit.toLocaleString('tr-TR') }}₺ menü hakkı</p>
            <p class="text-slate-500 text-xs">Breakeven: {{ plan.breakeven.toLocaleString('tr-TR') }}₺/ay</p>

            <div class="flex-1" />

            <div class="mt-4 space-y-2">
              <Motion :while-hover="{ scale: 1.05 }" :while-tap="{ scale: 0.95 }">
                <button
                  v-if="!isActive"
                  class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                  :disabled="subscribing === plan.tier"
                  @click="doSubscribe(plan.tier)"
                >
                  {{ subscribing === plan.tier ? 'İşleniyor...' : 'Abone Ol' }}
                </button>
                <button
                  v-else-if="currentTier !== plan.tier && isHigherTier(plan.tier)"
                  class="w-full bg-emerald-600/80 hover:bg-emerald-600 text-white font-bold py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                  :disabled="!eligibility?.eligible || subscribing === plan.tier"
                  @click="doUpgrade(plan.tier)"
                >
                  {{ subscribing === plan.tier ? 'Yükseltiliyor...' : 'Yükselt' }}
                </button>
              </Motion>

              <button
                v-if="isActive && plan.annualFee && currentTier !== plan.tier && !isHigherTier(plan.tier)"
                class="w-full text-slate-500 hover:text-slate-300 text-xs py-1 transition-colors"
              >
                Yıllık: {{ plan.annualFee.toLocaleString('tr-TR') }}₺ (2 ay ücretsiz)
              </button>
            </div>
          </div>
        </Motion>
      </div>

      <!-- İptal -->
      <div v-if="isActive" class="text-center mt-8">
        <button class="text-slate-500 hover:text-red-400 text-sm transition-colors" @click="doCancel">
          Aboneliği iptal et (30 gün downgrade koruması)
        </button>
      </div>

      <!-- Hata -->
      <Transition name="fade">
        <div v-if="subscError" class="mt-6 max-w-lg mx-auto bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm text-center">
          {{ subscError }}
        </div>
      </Transition>
    </div>

    <!-- XP Bakiyesi -->
    <div class="max-w-xl mx-auto px-4 mt-10">
      <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
        <h3 class="text-white font-bold mb-3">XP Cüzdanım</h3>
        <div class="flex items-center justify-between">
          <div>
            <p class="text-3xl font-black text-purple-400">{{ xpBalance.toLocaleString('tr-TR') }}</p>
            <p class="text-slate-400 text-sm">XP Puanı (6 aylık geçerlilik)</p>
          </div>
          <div class="text-right text-sm text-slate-400">
            <p>Tier yükseltmede kullanılabilir:</p>
            <p class="font-bold text-white">Max %50 (1XP = 1₺)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

import { ref, computed, onMounted } from 'vue'
import type { SubscriptionTier } from '~/types/subscription'

const { plans, membership, pending, error: subscError, currentTier, isActive, menuCredit,
  eligibility, fetchPlans, fetchMyMembership, subscribe, upgrade, cancel } = useSubscription()
const { $api } = useApi()
const toast    = useNuxtApp().$toast

const subscribing = ref<SubscriptionTier | null>(null)
const xpBalance   = ref(0)

const creditPct = computed(() =>
  menuCredit.value.total ? Math.round((menuCredit.value.used / menuCredit.value.total) * 100) : 0,
)

const TIER_ORDER: SubscriptionTier[] = [
  'BRONZE_P1', 'BRONZE_P2', 'SILVER_P1', 'SILVER_P2',
  'GOLD_P1', 'GOLD_P2', 'DIAMOND_P1', 'DIAMOND_P2',
]

function isHigherTier(tier: SubscriptionTier): boolean {
  return TIER_ORDER.indexOf(tier) > TIER_ORDER.indexOf(currentTier.value ?? 'BRONZE_P1')
}

function tierLabel(tier: string): string {
  return tier.replace('_P1', ' Prime 1').replace('_P2', ' Prime 2')
    .replace('BRONZE', 'Bronz').replace('SILVER', 'Gümüş').replace('GOLD', 'Altın').replace('DIAMOND', 'Elmas')
}

function formatDate(d?: string): string {
  if (!d) return '-'
  return new Date(d).toLocaleDateString('tr-TR')
}

async function doSubscribe(tier: SubscriptionTier) {
  subscribing.value = tier
  try { await subscribe(tier); toast?.success('Abonelik başlatıldı!') }
  catch { toast?.error(subscError.value ?? 'Hata') }
  finally { subscribing.value = null }
}

async function doUpgrade(tier: SubscriptionTier) {
  subscribing.value = tier
  try { await upgrade(tier); toast?.success('Tier yükseltildi!') }
  catch { toast?.error(subscError.value ?? 'Hata') }
  finally { subscribing.value = null }
}

async function doCancel() {
  if (!confirm('Aboneliğinizi iptal etmek istiyor musunuz?')) return
  await cancel()
  toast?.success('Abonelik iptal edildi. 30 gün boyunca menü haklarınız geçerli.')
}

onMounted(async () => {
  await Promise.all([fetchPlans(), fetchMyMembership()])
  try {
    const res = await $api<{ currentXp: number }>('/api/loyalty/xp/balance')
    xpBalance.value = (res.data as Record<string, number>)?.currentXp ?? 0
  } catch {}
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
