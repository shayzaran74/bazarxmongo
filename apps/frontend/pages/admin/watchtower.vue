<!-- apps/frontend/pages/admin/watchtower.vue -->
<!-- Master Plan v4.3 §3.4 — Watchtower Admin UI -->
<!-- PriceFloor + SmartCap ihlal logları -->

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] })

const { apiBase } = useRuntimeConfig().public

interface WatchtowerFlag {
  id:          string
  vendorId:    string
  flagType:    string
  description: string
  severity:    string
  createdAt:   string
  resolved:    boolean
}

const flags   = ref<WatchtowerFlag[]>([])
const pending = ref(false)
const error   = ref<string | null>(null)
const page    = ref(1)
const filter  = ref<'ALL' | 'PRICE_FLOOR' | 'SMART_CAP'>('ALL')

async function fetchFlags(): Promise<void> {
  pending.value = true
  error.value   = null
  try {
    const data = await $fetch<WatchtowerFlag[]>(
      `${apiBase}/api/v1/trust-score/admin/watchtower/flags?page=${page.value}&limit=20`,
    )
    flags.value = data
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Bayraklar yüklenemedi'
  } finally {
    pending.value = false
  }
}

const filtered = computed(() =>
  filter.value === 'ALL' ? flags.value : flags.value.filter(f => f.flagType === filter.value),
)

function severityClass(s: string): string {
  const map: Record<string, string> = {
    HIGH:   'bg-red-500/10 text-red-400 border-red-500/30',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    LOW:    'bg-blue-500/10 text-blue-400 border-blue-500/30',
  }
  return map[s] ?? 'bg-white/5 text-slate-400 border-white/10'
}

onMounted(fetchFlags)
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/5 to-slate-950 pb-24">

    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          Watch<span class="text-red-400">tower</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          PriceFloor & SmartCap ihlal bayrakları · §3.4
        </p>
      </Motion>
    </div>

    <div class="max-w-3xl mx-auto px-4 space-y-5">

      <!-- Filtre + Yenile -->
      <div class="flex items-center gap-3 flex-wrap">
        <button
          v-for="f in ['ALL', 'PRICE_FLOOR', 'SMART_CAP']" :key="f"
          class="px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors"
          :class="filter === f
            ? 'bg-red-600 border-red-500 text-white'
            : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'"
          @click="filter = f as typeof filter"
        >
          {{ f === 'ALL' ? 'Tümü' : f === 'PRICE_FLOOR' ? 'Fiyat Tabanı' : 'SmartCap' }}
        </button>
        <button
          class="ml-auto px-4 py-1.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-colors"
          @click="fetchFlags"
        >
          ↺ Yenile
        </button>
      </div>

      <!-- Yükleniyor / Hata -->
      <div v-if="pending" class="space-y-2">
        <div v-for="i in 5" :key="i" class="h-20 bg-white/5 rounded-2xl animate-pulse" />
      </div>
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
        {{ error }}
      </div>

      <!-- Bayrak listesi -->
      <template v-else>
        <div v-if="filtered.length === 0" class="text-center text-slate-500 py-16">
          Bu filtrede bayrak yok.
        </div>

        <div v-for="(flag, idx) in filtered" :key="flag.id">
          <Motion
            :initial="{ opacity: 0, x: -16 }"
            :animate="{ opacity: 1, x: 0 }"
            :transition="{ duration: 0.35, delay: idx * 0.06 }"
          >
            <div
              class="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-start gap-4"
              :class="{ 'opacity-40': flag.resolved }"
            >
              <!-- Severity badge -->
              <span
                class="shrink-0 px-2 py-0.5 rounded-lg text-xs font-bold border uppercase"
                :class="severityClass(flag.severity)"
              >
                {{ flag.severity }}
              </span>

              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <p class="text-white text-sm font-semibold">{{ flag.flagType }}</p>
                  <span v-if="flag.resolved" class="text-xs text-emerald-400">✓ Çözüldü</span>
                </div>
                <p class="text-slate-400 text-xs">{{ flag.description }}</p>
                <p class="text-slate-600 text-xs mt-1">Vendor: {{ flag.vendorId }}</p>
              </div>

              <p class="text-slate-500 text-xs shrink-0">
                {{ new Date(flag.createdAt).toLocaleDateString('tr-TR') }}
              </p>
            </div>
          </Motion>
        </div>
      </template>

      <!-- Sistem notu -->
      <div class="bg-slate-900/60 border border-white/8 rounded-xl px-4 py-3 text-xs text-slate-500 text-center">
        Tüm bayraklar şifreli AuditLog'a kaydedilir · KVKK md.5, 10, 12 kapsamında
      </div>

    </div>
  </div>
</template>
