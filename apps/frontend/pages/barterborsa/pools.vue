<!-- apps/frontend/pages/barterborsa/pools.vue -->
<!-- Master Plan v4.3 §4 — Kör Havuz (Blind Pool) Listesi -->
<!-- Kimlik gizli · SmartCap %25 uyarısı · Talep akışı -->

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const { apiBase } = useRuntimeConfig().public

interface Pool {
  id:             string
  name:           string
  totalStock:     number
  availableStock: number
  smartCapMaxQty: number
  utilizationPct: number
}

const pools      = ref<Pool[]>([])
const pending    = ref(false)
const error      = ref<string | null>(null)
const requesting = ref<string | null>(null)
const qty        = ref<Record<string, number>>({})

async function fetchPools(groupId: string = 'default'): Promise<void> {
  pending.value = true
  error.value   = null
  try {
    const data = await $fetch<Pool[]>(
      `${apiBase}/api/v1/barterborsa/pools/group/${groupId}`,
    )
    pools.value = data
    data.forEach(p => { if (!qty.value[p.id]) qty.value[p.id] = 1 })
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Havuzlar yüklenemedi'
  } finally {
    pending.value = false
  }
}

async function request(poolId: string): Promise<void> {
  requesting.value = poolId
  try {
    await $fetch(`${apiBase}/api/v1/barterborsa/pools/${poolId}/request`, {
      method: 'POST',
      body:   { quantity: qty.value[poolId] ?? 1 },
    })
    await fetchPools()
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Talep gönderilemedi'
  } finally {
    requesting.value = null
  }
}

// SmartCap %25'e yaklaşıyorsa uyarı
function smartCapWarning(pool: Pool, requested: number): boolean {
  return requested >= pool.smartCapMaxQty
}

function utilizationColor(pct: number): string {
  if (pct >= 90) return 'bg-red-500'
  if (pct >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

onMounted(() => fetchPools())
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-amber-950/5 to-slate-950 pb-24">

    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          Kör <span class="text-amber-400">Havuzlar</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          Kimlik gizli · Tek işlemde max %25 SmartCap · §4
        </p>
      </Motion>
    </div>

    <div class="max-w-2xl mx-auto px-4 space-y-5">

      <!-- Kör Havuz Notu -->
      <Motion
        :initial="{ opacity: 0, y: 16 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.45, delay: 0.08 }"
      >
        <div class="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3 text-xs text-amber-400">
          🔒 Havuzlarda karşı bayi kimliği gizlidir. Kendi havuzunuzdan talep edemezsiniz.
        </div>
      </Motion>

      <!-- Yükleniyor / Hata -->
      <div v-if="pending" class="space-y-3">
        <div v-for="i in 3" :key="i" class="h-36 bg-white/5 rounded-2xl animate-pulse" />
      </div>
      <div v-else-if="error" class="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
        {{ error }}
      </div>
      <div v-else-if="pools.length === 0" class="text-center text-slate-500 py-16">
        Bu grupta aktif havuz bulunmuyor.
      </div>

      <!-- Havuz Kartları -->
      <div v-else class="space-y-4">
        <div v-for="(pool, idx) in pools" :key="pool.id">
          <Motion
            :initial="{ opacity: 0, y: 20 }"
            :animate="{ opacity: 1, y: 0 }"
            :transition="{ duration: 0.4, delay: 0.12 + idx * 0.08 }"
          >
            <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div class="flex items-start justify-between mb-3">
                <div>
                  <p class="text-white font-bold">{{ pool.name }}</p>
                  <p class="text-slate-500 text-xs">SmartCap: max {{ pool.smartCapMaxQty.toLocaleString('tr-TR') }} adet/işlem</p>
                </div>
                <span class="text-xs px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20 font-semibold">
                  %{{ pool.utilizationPct }} dolu
                </span>
              </div>

              <!-- Stok çubuğu -->
              <div class="mb-3">
                <div class="flex justify-between text-xs text-slate-500 mb-1">
                  <span>{{ pool.availableStock.toLocaleString('tr-TR') }} mevcut</span>
                  <span>{{ pool.totalStock.toLocaleString('tr-TR') }} toplam</span>
                </div>
                <div class="bg-white/10 rounded-full h-2">
                  <div
                    class="h-2 rounded-full transition-all"
                    :class="utilizationColor(pool.utilizationPct)"
                    :style="{ width: pool.utilizationPct + '%' }"
                  />
                </div>
              </div>

              <!-- SmartCap uyarısı -->
              <div
                v-if="smartCapWarning(pool, qty[pool.id] ?? 1)"
                class="mb-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-xs text-red-400"
              >
                ⚠️ Talep miktarı SmartCap limitine ulaşıyor (max {{ pool.smartCapMaxQty.toLocaleString('tr-TR') }})
              </div>

              <!-- Talep formu -->
              <div class="flex items-center gap-3">
                <div class="flex items-center gap-2 flex-1">
                  <label class="text-slate-400 text-xs">Miktar</label>
                  <input
                    v-model.number="qty[pool.id]"
                    type="number"
                    :min="1" :max="pool.smartCapMaxQty"
                    class="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                  <span class="text-slate-500 text-xs">/ max {{ pool.smartCapMaxQty.toLocaleString('tr-TR') }}</span>
                </div>

                <Motion
                  :while-hover="{ scale: 1.04 }"
                  :while-tap="{ scale: 0.96 }"
                  as="button"
                  class="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                  :class="requesting === pool.id
                    ? 'bg-white/10 text-slate-400 cursor-wait'
                    : pool.availableStock === 0
                      ? 'bg-white/5 text-slate-600 cursor-not-allowed'
                      : 'bg-amber-600 text-white hover:bg-amber-500'"
                  :disabled="requesting === pool.id || pool.availableStock === 0"
                  @click="request(pool.id)"
                >
                  {{ requesting === pool.id ? 'Gönderiliyor…' : pool.availableStock === 0 ? 'Stok yok' : 'Talep Et' }}
                </Motion>
              </div>
            </div>
          </Motion>
        </div>
      </div>

      <!-- Alt not -->
      <div class="bg-slate-900/60 border border-white/8 rounded-xl px-4 py-3 text-xs text-slate-500 text-center">
        Grup içi takaslarda %6 sistem yönetim bedeli uygulanır · KVKK kapsamında açık rızayla sınırlı
      </div>

    </div>
  </div>
</template>
