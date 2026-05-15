<!-- apps/frontend/pages/ticaritakas/commission-calc.vue -->
<!-- Master Plan v4.3 §3.2 — B2B Komisyon Hesaplayıcı -->
<!-- Standart · Grup içi · XP indirimli preview -->

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

const tiers = [
  { label: 'CORE',  std: 12, group: 9,  xpDisc: 6  },
  { label: 'PRIME', std: 10, group: 8,  xpDisc: 5  },
  { label: 'ELITE', std: 8,  group: 7,  xpDisc: 4  },
  { label: 'APEX',  std: 6,  group: 6,  xpDisc: 3  },
]

const selectedTier = ref(0)
const amount       = ref(100_000)
const isGroup      = ref(false)
const xpToApply    = ref(0)

const tier = computed(() => tiers[selectedTier.value])

const calc = computed(() => {
  const t         = tier.value
  const amt       = amount.value
  // §3.2 — XP ve grup içi aynı anda uygulanamaz
  const rate      = isGroup.value ? t.group : (xpToApply.value > 0 ? t.xpDisc : t.std)
  const rateType  = isGroup.value ? 'Grup İçi' : (xpToApply.value > 0 ? 'XP İndirimli' : 'Standart')
  const totalComm = Math.round(amt * rate / 100)
  const maxXp     = Math.round(amt * t.std / 100 * 0.5) // komisyonun max %50'si XP
  const effectXp  = Math.min(xpToApply.value, maxXp)
  const cashComm  = isGroup.value ? totalComm : Math.max(0, totalComm - effectXp)
  const vendorNet = amt - (isGroup.value ? totalComm : Math.round(amt * t.std / 100))
  return { rate, rateType, totalComm, cashComm, xpComm: effectXp, vendorNet, maxXp }
})

function fmt(n: number): string {
  return Math.round(n).toLocaleString('tr-TR') + ' ₺'
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 via-green-950/5 to-slate-950 pb-24">

    <div class="text-center px-4 pt-16 pb-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">
          Komisyon <span class="text-emerald-400">Hesaplayıcı</span>
        </h1>
        <p class="mt-3 text-slate-400 text-lg max-w-lg mx-auto">
          Standart · Grup içi · XP indirimli oran preview
        </p>
      </Motion>
    </div>

    <div class="max-w-xl mx-auto px-4 space-y-5">

      <!-- Tier seçimi -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.1 }">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5">
          <p class="text-slate-400 text-xs uppercase tracking-wider mb-3">Tier Seçin</p>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="(t, i) in tiers" :key="i"
              class="py-2.5 rounded-xl text-sm font-bold transition-colors border"
              :class="selectedTier === i
                ? 'bg-emerald-600 border-emerald-500 text-white'
                : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'"
              @click="selectedTier = i"
            >
              {{ t.label }}
            </button>
          </div>
        </div>
      </Motion>

      <!-- Parametreler -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.16 }">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">

          <!-- İşlem tutarı -->
          <div>
            <label class="text-slate-400 text-xs uppercase tracking-wider">İşlem Tutarı</label>
            <div class="flex items-center gap-3 mt-2">
              <input
                type="range" :min="10000" :max="2000000" :step="10000"
                v-model.number="amount"
                class="flex-1 accent-emerald-500"
              />
              <span class="text-white font-black text-sm w-32 text-right tabular-nums">{{ amount.toLocaleString('tr-TR') }} ₺</span>
            </div>
          </div>

          <!-- Grup içi toggle — §3.2: XP ile birlikte uygulanamaz -->
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white text-sm font-semibold">Grup İçi İşlem</p>
              <p class="text-slate-500 text-xs">Ekosistem içi — XP indirimi devre dışı</p>
            </div>
            <button
              class="w-12 h-6 rounded-full transition-colors relative"
              :class="isGroup ? 'bg-emerald-600' : 'bg-white/10'"
              @click="isGroup = !isGroup; if(isGroup) xpToApply = 0"
            >
              <span
                class="absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow"
                :class="isGroup ? 'left-6.5 translate-x-0' : 'left-0.5'"
              />
            </button>
          </div>

          <!-- XP kullanımı — §3.3: maks komisyonun %50'si -->
          <div :class="isGroup ? 'opacity-30 pointer-events-none' : ''">
            <div class="flex items-center justify-between mb-1">
              <label class="text-slate-400 text-xs uppercase tracking-wider">XP Kullanımı (maks %50)</label>
              <span class="text-xs text-slate-500">Maks: {{ calc.maxXp.toLocaleString('tr-TR') }} XP</span>
            </div>
            <div class="flex items-center gap-3">
              <input
                type="range" :min="0" :max="calc.maxXp" :step="100"
                v-model.number="xpToApply"
                class="flex-1 accent-purple-500"
              />
              <span class="text-purple-400 font-bold text-sm w-24 text-right tabular-nums">{{ xpToApply.toLocaleString('tr-TR') }} XP</span>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Sonuç -->
      <Motion :initial="{ opacity: 0, y: 20 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.5, delay: 0.22 }">
        <div class="bg-emerald-600/10 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
          <div class="flex items-center justify-between mb-2">
            <p class="text-emerald-400 font-bold">Hesaplama Sonucu</p>
            <span class="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg font-semibold">
              %{{ calc.rate }} — {{ calc.rateType }}
            </span>
          </div>

          <div class="space-y-2 text-sm">
            <div class="flex justify-between py-1.5 border-b border-white/5">
              <span class="text-slate-400">İşlem tutarı</span>
              <span class="text-white font-bold">{{ fmt(amount) }}</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-white/5">
              <span class="text-slate-400">Toplam komisyon</span>
              <span class="text-white font-bold">{{ fmt(calc.totalComm) }}</span>
            </div>
            <div v-if="!isGroup && calc.xpComm > 0" class="flex justify-between py-1.5 border-b border-white/5">
              <span class="text-slate-400">XP ile ödenen</span>
              <span class="text-purple-400 font-bold">{{ calc.xpComm.toLocaleString('tr-TR') }} XP</span>
            </div>
            <div class="flex justify-between py-1.5 border-b border-white/5">
              <span class="text-slate-400">Nakit komisyon</span>
              <span class="text-red-400 font-bold">{{ fmt(calc.cashComm) }}</span>
            </div>
            <div class="flex justify-between py-2 font-bold text-base">
              <span class="text-white">Vendor net gelir</span>
              <span class="text-emerald-400">{{ fmt(calc.vendorNet) }}</span>
            </div>
          </div>
        </div>
      </Motion>

      <!-- Oranlar tablosu -->
      <Motion :initial="{ opacity: 0, y: 16 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.4, delay: 0.3 }">
        <div class="bg-white/5 border border-white/10 rounded-2xl p-4 overflow-x-auto">
          <p class="text-slate-400 text-xs uppercase tracking-wider mb-3">Master Plan §3.2 — Tüm Oranlar</p>
          <table class="w-full text-xs text-center">
            <thead>
              <tr class="text-slate-500 border-b border-white/10">
                <th class="pb-2 text-left">Tier</th>
                <th class="pb-2">Standart</th>
                <th class="pb-2">Grup İçi</th>
                <th class="pb-2">XP İndirimli</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(t, i) in tiers" :key="i"
                  class="border-b border-white/5"
                  :class="selectedTier === i ? 'text-white font-bold' : 'text-slate-400'">
                <td class="py-1.5 text-left">{{ t.label }}</td>
                <td>%{{ t.std }}</td>
                <td class="text-emerald-400">%{{ t.group }}</td>
                <td class="text-purple-400">%{{ t.xpDisc }}</td>
              </tr>
            </tbody>
          </table>
          <p class="text-slate-600 text-xs mt-2">XP indirimi + grup içi oran aynı işlemde uygulanamaz</p>
        </div>
      </Motion>

    </div>
  </div>
</template>
