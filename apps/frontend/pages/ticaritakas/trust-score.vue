<!-- apps/frontend/pages/ticaritakas/trust-score.vue -->
<!-- Master Plan v4.3 §3.3 — TrustScore Dashboard -->
<!-- Ticari %40 · XP Sadakati %30 · Uyumluluk %30 -->

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const { data, pending, score, isFrozen, scoreColor, fetch } = useTrustScore()

onMounted(fetch)

// §3.3 ağırlık yapısı
const COMPONENTS = [
  {
    key:      'tradingPerformance',
    label:    'Ticari Performans',
    weight:   40,
    desc:     '90 günde işlem yoksa −10 puan/ay',
    icon:     '📈',
    color:    'blue',
  },
  {
    key:      'xpLoyalty',
    label:    'XP Sadakati',
    weight:   30,
    desc:     'Bakiye sıfırlanırsa −5 puan/ay',
    icon:     '⭐',
    color:    'purple',
  },
  {
    key:      'compliance',
    label:    'Uyumluluk',
    weight:   30,
    desc:     '2. ihlal −15, 3. ihlal hesap dondurma',
    icon:     '🛡',
    color:    'emerald',
  },
] as const

type ComponentKey = 'tradingPerformance' | 'xpLoyalty' | 'compliance'

function componentScore(key: ComponentKey): number {
  return data.value?.trustScore[key] ?? 0
}

function componentColor(score: number): string {
  if (score >= 90) return 'bg-emerald-500'
  if (score >= 70) return 'bg-blue-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}

function levelBadge(level: string): string {
  const map: Record<string, string> = {
    EXCELLENT: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    GOOD:      'text-blue-400 bg-blue-500/10 border-blue-500/30',
    FAIR:      'text-amber-400 bg-amber-500/10 border-amber-500/30',
    POOR:      'text-red-400 bg-red-500/10 border-red-500/30',
  }
  return map[level] ?? 'text-slate-400 bg-white/5 border-white/10'
}

function levelLabel(level: string): string {
  const map: Record<string, string> = {
    EXCELLENT: 'Mükemmel',
    GOOD:      'İyi',
    FAIR:      'Orta',
    POOR:      'Düşük',
  }
  return map[level] ?? level
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/5 to-slate-950 pb-24">

    <!-- Başlık -->
    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          Trust<span class="text-emerald-400">Score</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          Ticaret güven puanınız · Havuz erişimi ve komisyon indirimine etki eder
        </p>
      </Motion>
    </div>

    <div class="max-w-2xl mx-auto px-4 space-y-5">

      <!-- Toplam Skor Kartı -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <div
          class="rounded-2xl border p-6 text-center transition-colors"
          :class="isFrozen
            ? 'bg-red-500/10 border-red-500/40'
            : 'bg-white/5 border-white/10'"
        >
          <div v-if="pending" class="h-20 bg-white/5 rounded-xl animate-pulse" />
          <template v-else>
            <!-- Dondurulmuş uyarı -->
            <div
              v-if="isFrozen"
              class="mb-4 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded-xl text-red-400 text-sm font-semibold"
            >
              ⚠️ Hesabınız Watchtower tarafından donduruldu. Destek ile iletişime geçin.
            </div>

            <p
              class="text-7xl font-black tabular-nums"
              :class="scoreColor"
            >
              {{ score.toFixed(0) }}
            </p>
            <p class="text-slate-400 text-sm mt-1">/ 100</p>

            <span
              v-if="data?.trustScore.level"
              class="inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold border"
              :class="levelBadge(data.trustScore.level)"
            >
              {{ levelLabel(data.trustScore.level) }}
            </span>

            <p
              v-if="data?.trustScore.lastCalculatedAt"
              class="text-slate-500 text-xs mt-3"
            >
              Son güncelleme: {{ new Date(data.trustScore.lastCalculatedAt).toLocaleDateString('tr-TR') }}
            </p>
          </template>
        </div>
      </Motion>

      <!-- Bileşen Kırılımı -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.18 }"
      >
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-5">
          <p class="text-slate-400 text-xs uppercase tracking-wider">Puan Bileşenleri</p>

          <div
            v-for="(comp, idx) in COMPONENTS"
            :key="comp.key"
          >
            <Motion
              :initial="{ opacity: 0, x: -12 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.22 + idx * 0.08 }"
            >
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-base">{{ comp.icon }}</span>
                    <div>
                      <p class="text-white text-sm font-semibold">{{ comp.label }}</p>
                      <p class="text-slate-500 text-xs">Ağırlık: %{{ comp.weight }}</p>
                    </div>
                  </div>
                  <span
                    class="text-lg font-black tabular-nums"
                    :class="componentScore(comp.key) >= 70 ? 'text-emerald-400' : componentScore(comp.key) >= 50 ? 'text-amber-400' : 'text-red-400'"
                  >
                    {{ componentScore(comp.key).toFixed(0) }}
                  </span>
                </div>

                <!-- Bar -->
                <div class="bg-white/10 rounded-full h-1.5">
                  <div
                    class="h-1.5 rounded-full transition-all duration-700"
                    :class="componentColor(componentScore(comp.key))"
                    :style="{ width: componentScore(comp.key) + '%' }"
                  />
                </div>

                <p class="text-slate-600 text-xs">{{ comp.desc }}</p>
              </div>
            </Motion>
          </div>
        </div>
      </Motion>

      <!-- Tier Bilgisi -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.32 }"
      >
        <div v-if="data?.tierInfo" class="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p class="text-slate-400 text-xs uppercase tracking-wider mb-4">Tier Avantajları ({{ data.tier }})</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <p class="text-emerald-400 font-black text-xl">%{{ data.tierInfo.commissionRate }}</p>
              <p class="text-slate-400 text-xs mt-0.5">Standart Komisyon</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <p class="text-blue-400 font-black text-xl">%{{ data.tierInfo.groupRate }}</p>
              <p class="text-slate-400 text-xs mt-0.5">Grup İçi Oran</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <p class="text-purple-400 font-black text-xl">
                {{ (data.tierInfo.poolLimit / 1_000_000).toFixed(1) }}M ₺
              </p>
              <p class="text-slate-400 text-xs mt-0.5">Havuz Limiti</p>
            </div>
            <div class="bg-white/5 rounded-xl p-3 text-center">
              <p class="text-amber-400 font-black text-xl">
                {{ data.trustScore.violationCount }}
              </p>
              <p class="text-slate-400 text-xs mt-0.5">Aktif İhlal</p>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Notlar -->
      <Motion
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.4, delay: 0.4 }"
      >
        <div class="bg-slate-900/60 border border-white/8 rounded-xl px-4 py-3 text-xs text-slate-500 text-center space-y-1">
          <p>Puan her gün güncellenir · Ayın 1'inde tam yeniden hesaplama yapılır</p>
          <p>90 gün hareketsizlik −10 puan/ay · XP bakiyesi sıfır −5 puan/ay</p>
        </div>
      </Motion>

    </div>
  </div>
</template>
