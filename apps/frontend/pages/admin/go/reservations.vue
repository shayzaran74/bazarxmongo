<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen">

    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-orange-500">BAZARX-GO · YÖNETİM</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Rezervasyon <span class="text-orange-500">Yönetimi</span>
        </h1>
      </div>
    </div>

    <!-- Filtreler -->
    <div class="flex gap-3 flex-wrap bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <button v-for="f in STATUS_FILTERS" :key="f.value"
        class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        :class="statusFilter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        @click="setFilter(f.value)">
        {{ f.label }}
      </button>
    </div>

    <!-- Tablo -->
    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-gray-50/50">
            <th v-for="h in ['KULLANICI', 'RESTORAN', 'TARİH / SAAT', 'KİŞİ', 'DURUM', 'NOT', 'İŞLEM']"
              :key="h" class="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="r in reservations" :key="r.id" class="hover:bg-gray-50/30 transition-all">
            <td class="px-6 py-5">
              <div class="text-xs font-black text-gray-900 truncate max-w-[120px]">{{ r.userId.slice(0, 10) }}...</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-xs font-black text-gray-900 truncate max-w-[120px]">{{ r.vendorId.slice(0, 10) }}...</div>
            </td>
            <td class="px-6 py-5">
              <div class="text-xs font-black text-gray-900">{{ formatDate(r.date) }}</div>
              <div class="text-[10px] text-gray-400">{{ r.timeSlot }}</div>
            </td>
            <td class="px-6 py-5 text-sm font-black text-gray-900">{{ r.partySize }}</td>
            <td class="px-6 py-5">
              <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                :class="STATUS_COLORS[r.status] ?? 'bg-gray-100 text-gray-600'">
                {{ STATUS_LABELS[r.status] ?? r.status }}
              </span>
            </td>
            <td class="px-6 py-5 text-xs text-gray-400 max-w-[120px] truncate">{{ r.note || '—' }}</td>
            <td class="px-6 py-5">
              <div v-if="r.status === 'PENDING'" class="flex gap-2">
                <button :disabled="acting === r.id"
                  class="px-3 py-1.5 bg-green-50 text-green-700 border border-green-100 rounded-xl text-[9px] font-black uppercase hover:bg-green-100 transition-all disabled:opacity-50"
                  @click="updateStatus(r.id, 'CONFIRMED')">Onayla</button>
                <button :disabled="acting === r.id"
                  class="px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-xl text-[9px] font-black uppercase hover:bg-red-100 transition-all disabled:opacity-50"
                  @click="updateStatus(r.id, 'CANCELLED')">İptal</button>
              </div>
              <span v-else class="text-[10px] text-gray-400 font-bold">—</span>
            </td>
          </tr>
          <tr v-if="reservations.length === 0">
            <td colspan="7" class="px-7 py-16 text-center text-gray-400 text-sm font-bold">Rezervasyon bulunamadı</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam {{ total }} rezervasyon</p>
      <div class="flex gap-3">
        <button :disabled="page <= 1" class="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-gray-50 shadow-sm" @click="prevPage">← Önceki</button>
        <button :disabled="page >= totalPages" class="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black disabled:opacity-40 hover:bg-black shadow-sm" @click="nextPage">Sonraki →</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'GO Rezervasyon Yönetimi — Admin' })

interface Reservation {
  id: string; userId: string; vendorId: string; purchaseId: string
  date: string; timeSlot: string; partySize: number
  status: string; note?: string; vendorNote?: string
}

const { $api } = useApi()
const toast = useNuxtApp().$toast

const reservations = ref<Reservation[]>([])
const loading  = ref(true)
const acting   = ref<string | null>(null)
const statusFilter = ref('')
const page = ref(1); const total = ref(0); const limit = 20
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const STATUS_FILTERS = [
  { value: '',          label: 'Tümü' },
  { value: 'PENDING',   label: '⏳ Bekliyor' },
  { value: 'CONFIRMED', label: '✅ Onaylandı' },
  { value: 'COMPLETED', label: '🏁 Tamamlandı' },
  { value: 'CANCELLED', label: '❌ İptal' },
]
const STATUS_LABELS: Record<string, string> = {
  PENDING:   'Bekliyor', CONFIRMED: 'Onaylandı',
  COMPLETED: 'Tamamlandı', CANCELLED: 'İptal', NO_SHOW: 'Gelmedi',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING:   'bg-amber-50 text-amber-700',
  CONFIRMED: 'bg-green-50 text-green-700',
  COMPLETED: 'bg-blue-50 text-blue-700',
  CANCELLED: 'bg-gray-100 text-gray-500',
  NO_SHOW:   'bg-red-50 text-red-600',
}

const fetchReservations = async (): Promise<void> => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) })
    if (statusFilter.value) params.set('status', statusFilter.value)
    const res = await $api<{ success: boolean; data: Reservation[]; total: number }>(`/api/v1/admin/go/reservations?${params}`)
    reservations.value = res.data  ?? []
    total.value        = res.total ?? 0
  } catch { toast.error('Rezervasyonlar yüklenemedi') } finally { loading.value = false }
}

const setFilter = (v: string) => { statusFilter.value = v; page.value = 1; fetchReservations() }
const prevPage = () => { if (page.value > 1) { page.value--; fetchReservations() } }
const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchReservations() } }

const updateStatus = async (id: string, status: 'CONFIRMED' | 'CANCELLED'): Promise<void> => {
  acting.value = id
  try {
    await $api(`/api/v1/admin/go/reservations/${id}`, { method: 'PATCH', body: { status } })
    toast.success(status === 'CONFIRMED' ? 'Rezervasyon onaylandı' : 'Rezervasyon iptal edildi')
    await fetchReservations()
  } catch { toast.error('İşlem başarısız') } finally { acting.value = null }
}

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(fetchReservations)
</script>
