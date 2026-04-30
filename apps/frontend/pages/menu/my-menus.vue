<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-950 to-purple-950/10 pb-20">
    <div class="max-w-2xl mx-auto px-4 pt-10">
      <Motion
        :initial="{ opacity: 0, filter: 'blur(12px)', y: 28 }"
        :animate="{ opacity: 1, filter: 'blur(0px)', y: 0 }"
        :transition="{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }"
      >
        <h1 class="text-2xl font-black text-white mb-2">Menülerim</h1>
        <p class="text-slate-400 text-sm mb-8">Aktif QR kodlarınız ve 1+1 haklarınız</p>
      </Motion>

      <div v-if="pending" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-40 bg-white/5 rounded-2xl animate-pulse" />
      </div>

      <div v-else-if="purchases.length" class="space-y-4">
        <Motion
          v-for="(p, i) in purchases"
          :key="p.id"
          :initial="{ opacity: 0, y: 20 }"
          :animate="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.4, delay: i * 0.09 }"
          class="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div class="flex items-start justify-between mb-3">
            <div>
              <h3 class="text-white font-bold">{{ p.menuTitle }}</h3>
              <p class="text-slate-400 text-sm">{{ p.restaurant?.name }}</p>
            </div>
            <span
              class="text-xs font-bold px-2.5 py-1 rounded-full"
              :class="{
                'bg-emerald-500/20 text-emerald-400': p.status === 'ACTIVE',
                'bg-amber-500/20 text-amber-400':     p.status === 'PARTIALLY_REDEEMED',
                'bg-slate-500/20 text-slate-400':     p.status === 'REDEEMED',
              }"
            >
              {{ statusLabel(p.status) }}
            </span>
          </div>

          <!-- Ana QR -->
          <div class="bg-black/30 rounded-xl p-4 text-center mb-3">
            <p class="text-xs text-slate-500 mb-1">Ana Menü QR</p>
            <p class="font-mono text-purple-300 font-bold text-lg tracking-widest">{{ p.qrCode }}</p>
            <p class="text-xs text-slate-500 mt-1">Son: {{ formatDate(p.qrExpiresAt) }}</p>
          </div>

          <!-- 1+1 QR -->
          <div v-if="p.oneFreeQrCode && !p.oneFreeUsed" class="mb-3">
            <div v-if="p.oneFreeActivated" class="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
              <p class="text-xs text-emerald-400 mb-1">1+1 Bedava QR (aktif)</p>
              <p class="font-mono text-emerald-300 font-bold text-lg tracking-widest">{{ p.oneFreeQrCode }}</p>
            </div>
            <Motion v-else :while-hover="{ scale: 1.05 }" :while-tap="{ scale: 0.95 }">
              <button
                class="w-full bg-emerald-600/20 border border-emerald-500/30 hover:bg-emerald-600/30 text-emerald-400 font-bold py-3 rounded-xl transition-colors text-sm"
                :disabled="activating === p.id"
                @click="activateOneFree(p.id)"
              >
                {{ activating === p.id ? 'Aktive ediliyor...' : '1+1 Bedava Hakkımı Aktive Et' }}
              </button>
            </Motion>
          </div>

          <div v-if="p.oneFreeUsed" class="text-center text-slate-500 text-xs">
            1+1 hakkı kullanıldı
          </div>

          <div class="flex justify-between text-xs text-slate-500 mt-2">
            <span>Ödenen: {{ Number(p.paidAmount).toLocaleString('tr-TR') }}₺</span>
            <span>+{{ p.xpEarned }} XP kazanıldı</span>
          </div>
        </Motion>
      </div>

      <div v-else class="text-center py-20">
        <p class="text-slate-500 text-lg mb-4">Henüz aktif menünüz yok</p>
        <NuxtLink to="/menu" class="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Menülere Gözat
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] })

import { ref } from 'vue'
const { $api } = useApi()
const toast    = useNuxtApp().$toast

interface Purchase {
  id: string; status: string; menuTitle: string
  restaurant?: { name: string }
  paidAmount: number; qrCode: string; qrExpiresAt: string
  oneFreeQrCode: string; oneFreeActivated: boolean; oneFreeUsed: boolean
  xpEarned: number
}

const purchases  = ref<Purchase[]>([])
const pending    = ref(true)
const activating = ref<string | null>(null)

function statusLabel(s: string): string {
  return { ACTIVE: 'Aktif', PARTIALLY_REDEEMED: 'Kısmi Kullanım', REDEEMED: 'Kullanıldı' }[s] ?? s
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('tr-TR')
}

async function activateOneFree(purchaseId: string) {
  activating.value = purchaseId
  try {
    await $api(`/api/menu/activate-one-free/${purchaseId}`, { method: 'POST' })
    toast?.success('1+1 hakkınız aktive edildi!')
    await fetchPurchases()
  } catch (e: unknown) {
    const err = e as { data?: { message?: string } }
    toast?.error(err.data?.message ?? 'Aktivasyon başarısız')
  } finally {
    activating.value = null
  }
}

async function fetchPurchases() {
  pending.value = true
  try {
    const res = await $api<Purchase[]>('/api/menu/my-purchases')
    purchases.value = Array.isArray(res.data) ? res.data : []
  } finally { pending.value = false }
}

onMounted(fetchPurchases)
</script>
