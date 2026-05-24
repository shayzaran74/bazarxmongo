<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Teminat Yönetimi
        </h1>
        <p class="text-sm text-gray-500">
          Takas tamamlandıktan sonra admin onayı bekleyen teminatları buradan serbest bırakabilirsiniz.
        </p>
      </div>
      <button
        class="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
        :disabled="loading"
        @click="fetchSessions"
      >
        Yenile
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-amber-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <p class="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Onay Bekleyen</p>
          <h2 class="text-3xl font-black">{{ pendingSessions.length }}</h2>
        </div>
      </div>
      <div class="bg-green-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div class="relative z-10">
          <p class="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Serbest Bırakılan</p>
          <h2 class="text-3xl font-black">{{ releasedCount }}</h2>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Toplam Bloke Tutar</p>
        <h2 class="text-3xl font-black text-gray-900">{{ fmt(totalBlocked) }} TL</h2>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="pendingSessions.length === 0" class="bg-white rounded-2xl border border-gray-100 p-12 text-center">
      <div class="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <h3 class="text-lg font-black text-gray-900 mb-1">Onay bekleyen teminat yok</h3>
      <p class="text-sm text-gray-400">Tüm teminatlar serbest bırakılmış durumda.</p>
    </div>

    <!-- Sessions Table -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead>
          <tr class="bg-gray-50 border-b border-gray-100">
            <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Session ID</th>
            <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teklif ID</th>
            <th class="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Teminat Tutarı</th>
            <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Durum</th>
            <th class="text-left px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tarih</th>
            <th class="text-right px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">İşlem</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in pendingSessions"
            :key="s.id"
            class="border-b border-gray-50 hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 font-mono text-xs text-gray-600">{{ s.id?.slice(-8) }}</td>
            <td class="px-6 py-4 font-mono text-xs text-gray-600">{{ s.tradeOfferId?.slice(-8) }}</td>
            <td class="px-6 py-4 text-right font-black text-gray-900">{{ fmt(parseDecimal(s.collateralAmount)) }} TL</td>
            <td class="px-6 py-4">
              <div class="flex flex-col gap-1">
                <span
                  v-if="daysSincePendingRelease(s.pendingReleaseAt) >= 3"
                  class="text-xs text-red-600 font-medium bg-red-50 px-2 py-0.5 rounded w-fit"
                >
                  ⚠ SLA aşıldı — {{ daysSincePendingRelease(s.pendingReleaseAt) }} gündür bekliyor
                </span>
                <span class="inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-100">
                  Onay Bekliyor
                </span>
              </div>
            </td>
            <td class="px-6 py-4 text-xs text-gray-500">{{ formatDate(s.updatedAt) }}</td>
            <td class="px-6 py-4 text-right">
              <button
                class="px-4 py-2 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-green-700 transition-all disabled:opacity-40"
                :disabled="releasing === s.id"
                @click="releaseCollateral(s.id)"
              >
                <span v-if="releasing === s.id">İşleniyor...</span>
                <span v-else>Serbest Bırak</span>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const { $api } = useApi()

const loading = ref(true)
const releasing = ref<string | null>(null)
const pendingSessions = ref<Record<string, unknown>[]>([])
const releasedCount = ref(0)

const parseDecimal = (val: unknown): number => {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val === 'string') return parseFloat(val) || 0
  if (typeof val === 'object' && val !== null && '$numberDecimal' in val) {
    return parseFloat((val as { $numberDecimal: string }).$numberDecimal) || 0
  }
  return 0
}

const totalBlocked = computed(() =>
  pendingSessions.value.reduce((acc, s) => acc + parseDecimal(s.collateralAmount), 0)
)

const fmt = (n: number) => new Intl.NumberFormat('tr-TR').format(n)

const formatDate = (d: unknown) => {
  if (!d) return '—'
  return new Date(d as string).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const daysSincePendingRelease = (pendingReleaseAt: unknown): number => {
  if (!pendingReleaseAt) return 0
  const diff = Date.now() - new Date(pendingReleaseAt as string).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const fetchSessions = async () => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data: Record<string, unknown>[] }>('/api/v1/admin/barter/swap/pending-release')
    pendingSessions.value = res.data ?? []
  } catch { /* hata */ } finally {
    loading.value = false
  }
}

const releaseCollateral = async (sessionId: string) => {
  releasing.value = sessionId
  try {
    const res = await $api<{ success: boolean; message?: string }>(`/api/v1/admin/barter/swap/${sessionId}/release-collateral`, {
      method: 'POST',
    })
    if (res.success) {
      pendingSessions.value = pendingSessions.value.filter(s => s.id !== sessionId)
      releasedCount.value++
      useNuxtApp().$toast?.success(res.message ?? 'Teminat serbest bırakıldı.')
    }
  } catch (err: unknown) {
    const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem başarısız.'
    useNuxtApp().$toast?.error(msg)
  } finally {
    releasing.value = null
  }
}

onMounted(() => fetchSessions())
</script>
