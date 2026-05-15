<!-- apps/frontend/pages/membership/referrals.vue -->
<!-- Master Plan v4.3 §2.6 — Referans Paneli -->
<!-- Tek katmanlı: 3 referans hedefi, XP kazanımı, bonus ödül göstergesi -->

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const {
  stats,
  pending,
  shareUrl,
  progressPct,
  thirdBonusUnlocked,
  generateCode,
} = useReferral()

const copied = ref(false)

async function copyCode(): Promise<void> {
  const url = shareUrl.value
  if (!url) {
    await generateCode()
    return
  }
  if (import.meta.client) {
    await navigator.clipboard.writeText(url)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  }
}

// Referans adımı renk/durum
function stepState(idx: number): 'done' | 'active' | 'pending' {
  if (!stats.value) return 'pending'
  if (idx < stats.value.completed) return 'done'
  if (idx === stats.value.completed) return 'active'
  return 'pending'
}

const STEP_REWARDS = [
  { label: '1. Referans', xp: '20 XP', bonus: null },
  { label: '2. Referans', xp: '20 XP (toplam 40)', bonus: null },
  {
    label: '3. Referans',
    xp: '20 XP',
    bonus: '1+1 menü hakkı (alt tier) + %20 tier aidat indirimi',
  },
]
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/10 to-slate-950 pb-24">

    <!-- Başlık -->
    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          Arkadaşını <span class="text-purple-400">Davet Et</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          Her referans 20 XP · 3. kişide 1+1 menü + %20 tier indirimi
        </p>
      </Motion>
    </div>

    <div class="max-w-2xl mx-auto px-4 space-y-6">

      <!-- Referans Kodu Kartı -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.1 }"
      >
        <div class="bg-purple-600/10 border border-purple-500/30 rounded-2xl p-6">
          <p class="text-xs text-slate-400 uppercase tracking-wider mb-3">Referans Linkiniz</p>

          <div v-if="pending" class="h-12 bg-white/5 rounded-xl animate-pulse" />

          <div v-else-if="stats?.referralCode" class="flex items-center gap-3">
            <code class="flex-1 bg-slate-900/60 text-purple-300 text-sm font-mono px-4 py-3 rounded-xl truncate border border-white/5">
              {{ shareUrl }}
            </code>
            <Motion
              :while-hover="{ scale: 1.05 }"
              :while-tap="{ scale: 0.95 }"
              as="button"
              class="shrink-0 px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
              :class="copied
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-purple-600 text-white hover:bg-purple-500'"
              @click="copyCode"
            >
              {{ copied ? '✓ Kopyalandı' : 'Kopyala' }}
            </Motion>
          </div>

          <div v-else class="flex items-center gap-3">
            <p class="text-slate-400 text-sm flex-1">Henüz referans kodunuz yok.</p>
            <Motion
              :while-hover="{ scale: 1.05 }"
              :while-tap="{ scale: 0.95 }"
              as="button"
              class="px-4 py-3 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-500 transition-colors"
              @click="generateCode"
            >
              Kod Oluştur
            </Motion>
          </div>
        </div>
      </Motion>

      <!-- İlerleme Çubuğu -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.18 }"
      >
        <div class="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div class="flex justify-between items-center mb-3">
            <p class="text-white font-bold">Referans İlerlemesi</p>
            <span class="text-purple-400 font-black text-lg">
              {{ stats?.completed ?? 0 }} / 3
            </span>
          </div>
          <div class="bg-white/10 rounded-full h-2.5 mb-2">
            <div
              class="h-2.5 rounded-full transition-all duration-700"
              :class="thirdBonusUnlocked ? 'bg-emerald-500' : 'bg-purple-500'"
              :style="{ width: progressPct + '%' }"
            />
          </div>
          <p v-if="thirdBonusUnlocked" class="text-emerald-400 text-sm font-semibold">
            🎉 3 referans tamamlandı! Özel bonusunuz aktif.
          </p>
          <p v-else class="text-slate-400 text-sm">
            {{ stats?.remaining ?? 3 }} referans daha tamamlanınca özel bonus kazanacaksınız.
          </p>
        </div>
      </Motion>

      <!-- Adım Adım Ödüller -->
      <Motion
        :initial="{ opacity: 0, y: 20 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.5, delay: 0.24 }"
      >
        <div class="space-y-3">
          <p class="text-slate-400 text-xs uppercase tracking-wider px-1">Ödül Basamakları</p>

          <div
            v-for="(step, idx) in STEP_REWARDS"
            :key="idx"
          >
            <Motion
              :initial="{ opacity: 0, x: -16 }"
              :animate="{ opacity: 1, x: 0 }"
              :transition="{ duration: 0.4, delay: 0.28 + idx * 0.09 }"
            >
              <div
                class="flex items-start gap-4 p-4 rounded-2xl border transition-colors"
                :class="{
                  'bg-emerald-500/10 border-emerald-500/30': stepState(idx) === 'done',
                  'bg-purple-500/10 border-purple-500/40': stepState(idx) === 'active',
                  'bg-white/3 border-white/8': stepState(idx) === 'pending',
                }"
              >
                <!-- Durum ikonu -->
                <div
                  class="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  :class="{
                    'bg-emerald-500 text-white': stepState(idx) === 'done',
                    'bg-purple-600 text-white': stepState(idx) === 'active',
                    'bg-white/10 text-slate-500': stepState(idx) === 'pending',
                  }"
                >
                  <span v-if="stepState(idx) === 'done'">✓</span>
                  <span v-else>{{ idx + 1 }}</span>
                </div>

                <div class="flex-1 min-w-0">
                  <p
                    class="font-bold text-sm"
                    :class="{
                      'text-emerald-400': stepState(idx) === 'done',
                      'text-white': stepState(idx) === 'active',
                      'text-slate-400': stepState(idx) === 'pending',
                    }"
                  >
                    {{ step.label }}
                  </p>
                  <p class="text-xs text-slate-400 mt-0.5">{{ step.xp }}</p>
                  <p v-if="step.bonus" class="text-xs text-amber-400 mt-1 font-semibold">
                    🎁 {{ step.bonus }}
                  </p>
                </div>

                <!-- Referans kişisi bilgisi -->
                <div
                  v-if="stats?.referrals[idx]"
                  class="text-right"
                >
                  <p class="text-xs text-slate-500">
                    {{ new Date(stats.referrals[idx].joinedAt).toLocaleDateString('tr-TR') }}
                  </p>
                  <p
                    v-if="stats.referrals[idx].completedAt"
                    class="text-xs text-emerald-400 font-semibold"
                  >
                    Tamamlandı
                  </p>
                </div>
              </div>
            </Motion>
          </div>
        </div>
      </Motion>

      <!-- Yeni üye başına karşılama bonusu notu -->
      <Motion
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :transition="{ duration: 0.4, delay: 0.55 }"
      >
        <div class="bg-slate-900/60 border border-white/8 rounded-xl px-4 py-3 text-xs text-slate-500 text-center">
          Davet ettiğiniz kişi üye olunca 10 XP karşılama bonusu alır · Tek katmanlı sistem, zincirleme komisyon yoktur
        </div>
      </Motion>

    </div>
  </div>
</template>
