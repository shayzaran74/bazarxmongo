<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen">

    <!-- Başlık -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-orange-500">BAZARX-GO · ANALİTİK</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Kârlılık <span class="text-orange-500">Dashboard</span>
        </h1>
      </div>
      <!-- Periyot seçici -->
      <div class="flex gap-2">
        <button v-for="p in PERIODS" :key="p.value"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="period === p.value ? 'bg-gray-900 text-white' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'"
          @click="setPeriod(p.value)">
          {{ p.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div v-for="i in 8" :key="i" class="h-28 bg-gray-100 rounded-2xl animate-pulse" />
    </div>

    <template v-else-if="data">

      <!-- Gelir KPI'ları -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div v-for="kpi in revenueKPIs" :key="kpi.label"
          class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-3">
          <div class="flex items-center justify-between">
            <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ kpi.label }}</p>
            <span class="text-lg">{{ kpi.icon }}</span>
          </div>
          <p class="text-2xl font-black text-gray-900 tracking-tighter">{{ kpi.value }}</p>
          <p class="text-[10px] text-gray-400 font-bold">{{ kpi.sub }}</p>
        </div>
      </div>

      <!-- QR İstatistikleri + Rezervasyon -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- QR Durumu -->
        <div class="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm space-y-5">
          <h2 class="font-black text-sm uppercase tracking-tight text-gray-900">QR Durumu</h2>
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 rounded-2xl p-5 text-center">
              <p class="text-3xl font-black text-green-700">{{ data.qrStats.active }}</p>
              <p class="text-[10px] font-black text-green-600 uppercase tracking-widest mt-1">Aktif QR</p>
            </div>
            <div class="bg-red-50 rounded-2xl p-5 text-center">
              <p class="text-3xl font-black text-red-600">{{ data.qrStats.expired }}</p>
              <p class="text-[10px] font-black text-red-500 uppercase tracking-widest mt-1">Süresi Dolmuş</p>
            </div>
          </div>
        </div>

        <!-- Rezervasyon Özeti -->
        <div class="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm space-y-5">
          <h2 class="font-black text-sm uppercase tracking-tight text-gray-900">Rezervasyonlar</h2>
          <div class="space-y-3">
            <div v-for="r in reservationRows" :key="r.label"
              class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-2 h-2 rounded-full" :class="r.color" />
                <span class="text-xs font-bold text-gray-600">{{ r.label }}</span>
              </div>
              <span class="font-black text-gray-900 text-sm">{{ r.value }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Kategori bazlı gelir -->
      <div class="bg-white rounded-[2rem] border border-gray-100 p-7 shadow-sm space-y-5">
        <h2 class="font-black text-sm uppercase tracking-tight text-gray-900">Kategori Bazlı Satış Geliri</h2>
        <div class="space-y-3">
          <div v-for="(rev, cat) in categoryRevenue" :key="cat"
            class="flex items-center gap-4">
            <span class="text-[10px] font-black text-gray-500 w-40 shrink-0">{{ CATEGORY_NAMES[Number(cat)] }}</span>
            <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-orange-500 rounded-full transition-all"
                :style="{ width: `${maxCatRev > 0 ? (rev / maxCatRev) * 100 : 0}%` }" />
            </div>
            <span class="text-sm font-black text-gray-900 w-24 text-right shrink-0">{{ formatCurrency(rev) }}</span>
          </div>
        </div>
      </div>

    </template>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'GO Kârlılık Dashboard — Admin' })

interface RevenueData {
  period: number
  sales: { totalCount: number; totalRevenue: number; serviceFeeRev: number; vatCollected: number; netRevenue: number }
  qrStats: { active: number; expired: number }
  reservations: { pending: number; confirmed: number; cancelled: number; completed: number }
  byCategory: Record<number, number>
}

const { $api } = useApi()
const toast = useNuxtApp().$toast

const data    = ref<RevenueData | null>(null)
const loading = ref(true)
const period  = ref(30)

const PERIODS = [
  { value: 7,   label: '7 Gün' },
  { value: 30,  label: '30 Gün' },
  { value: 90,  label: '90 Gün' },
  { value: 365, label: '1 Yıl' },
]

const CATEGORY_NAMES: Record<number, string> = {
  1: 'VIP & Fine Dining', 2: 'Mid-Point & Casual',
  3: 'Casual Dining', 4: 'Tatlı & Pastane',
  5: 'Kahve & İçecek',  6: 'Dondurma & Ekler',
}

const formatCurrency = (v: number): string =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(v)

const revenueKPIs = computed(() => {
  if (!data.value) return []
  const s = data.value.sales
  return [
    { label: 'Toplam Satış',    icon: '🎟️', value: `${s.totalCount} QR`,      sub: `Son ${data.value.period} gün` },
    { label: 'Brüt Gelir',     icon: '💰', value: formatCurrency(s.totalRevenue), sub: 'Kullanıcı ödemeleri' },
    { label: 'Hizmet Bedeli',  icon: '📊', value: formatCurrency(s.serviceFeeRev), sub: '%8 platform payı' },
    { label: 'Net Kâr',        icon: '✅', value: formatCurrency(s.netRevenue), sub: 'KDV sonrası' },
  ]
})

const reservationRows = computed(() => {
  if (!data.value) return []
  const r = data.value.reservations
  return [
    { label: 'Onay Bekliyor', color: 'bg-amber-500',  value: r.pending },
    { label: 'Onaylandı',     color: 'bg-green-500',  value: r.confirmed },
    { label: 'Tamamlandı',    color: 'bg-blue-500',   value: r.completed },
    { label: 'İptal',         color: 'bg-gray-300',   value: r.cancelled },
  ]
})

const categoryRevenue = computed(() => data.value?.byCategory ?? {})
const maxCatRev = computed(() => Math.max(...Object.values(categoryRevenue.value), 0))

const fetchRevenue = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data: RevenueData }>(`/api/v1/admin/go/revenue?period=${period.value}`)
    data.value = res.data
  } catch { toast.error('Veriler yüklenemedi') } finally { loading.value = false }
}

const setPeriod = (p: number) => { period.value = p; fetchRevenue() }
onMounted(fetchRevenue)
</script>
