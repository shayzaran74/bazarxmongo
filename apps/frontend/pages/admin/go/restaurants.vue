<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 min-h-screen">

    <!-- Başlık -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-orange-500">BAZARX-GO · YÖNETİM</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Restoran <span class="text-orange-500">Anlaşmaları</span>
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">
          LANSMaN ORTAĞI 3 FAZ YÖNETİMİ · 60 MENÜ DÖNGÜSÜ
        </p>
      </div>
      <button
        class="px-6 py-3 bg-orange-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg"
        @click="addModal.open = true">
        + Yeni Ortaklık Ekle
      </button>
    </div>

    <!-- Özet Kartlar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
      <div v-for="stat in stats" :key="stat.label"
        class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">{{ stat.label }}</p>
        <p class="text-3xl font-black text-gray-900 tracking-tighter mt-2">{{ stat.value }}</p>
      </div>
    </div>

    <!-- Filtreler -->
    <div class="flex gap-3 flex-wrap items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <button v-for="f in PHASE_FILTERS" :key="f.value"
        class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
        :class="phaseFilter === f.value ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'"
        @click="setPhaseFilter(f.value)">
        {{ f.label }}
      </button>
      <input v-model="cityFilter" type="text" placeholder="Şehir filtrele..."
        class="ml-auto bg-gray-50 border border-transparent rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:border-orange-400 transition-all"
        @input="debouncedFetch" />
    </div>

    <!-- Tablo -->
    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-orange-100 border-t-orange-500 rounded-full animate-spin" />
      </div>
      <table v-else class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-gray-50/50">
            <th v-for="h in ['RESTORAN', 'FAZ', 'MENÜ KOTASI', 'REKLAM HAKKI', 'BAŞLANGIÇ', 'İŞLEM']"
              :key="h" class="px-7 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="p in partners" :key="p.id" class="hover:bg-gray-50/30 transition-all">
            <!-- Restoran -->
            <td class="px-7 py-5">
              <div class="font-black text-sm text-gray-900">{{ p.restaurant.name || '—' }}</div>
              <div class="text-[10px] text-gray-400 mt-0.5">{{ p.restaurant.city }} {{ p.restaurant.district }}</div>
            </td>
            <!-- Faz -->
            <td class="px-7 py-5">
              <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                :class="PHASE_COLORS[p.phase]">
                {{ PHASE_LABELS[p.phase] }}
              </span>
            </td>
            <!-- Menü kotası ilerleme -->
            <td class="px-7 py-5 min-w-[160px]">
              <div class="flex items-center justify-between text-[10px] font-black text-gray-500 mb-1.5">
                <span>{{ p.distributedCount }} / {{ p.pledgedMenuCount }}</span>
                <span class="text-gray-900">%{{ p.progressPct }}</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-orange-500 rounded-full transition-all"
                  :style="{ width: `${p.progressPct}%` }" />
              </div>
              <div class="text-[9px] text-gray-400 mt-1">{{ p.remainingMenus }} menü kaldı</div>
            </td>
            <!-- Reklam hakkı -->
            <td class="px-7 py-5">
              <div class="font-black text-sm text-gray-900">{{ p.freeAdMonths - p.adMonthsUsed }} ay kaldı</div>
              <div class="text-[10px] text-gray-400">/ {{ p.freeAdMonths }} ay toplam</div>
            </td>
            <!-- Başlangıç -->
            <td class="px-7 py-5 text-xs text-gray-500 font-bold">
              {{ formatDate(p.startDate) }}
            </td>
            <!-- İşlem -->
            <td class="px-7 py-5">
              <button v-if="p.phase !== 'PHASE_3'"
                :disabled="advancing === p.id"
                class="px-4 py-2 bg-orange-50 text-orange-700 border border-orange-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all disabled:opacity-50"
                @click="advancePhase(p.id)">
                {{ advancing === p.id ? '...' : 'Faz İlerlet →' }}
              </button>
              <span v-else class="text-[10px] font-black text-green-600">✓ B2B Üyeliğe Davet Et</span>
            </td>
          </tr>
          <tr v-if="partners.length === 0">
            <td colspan="6" class="px-7 py-16 text-center text-gray-400 text-sm font-bold">
              Kayıt bulunamadı
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">Toplam {{ total }} ortak</p>
      <div class="flex gap-3">
        <button :disabled="page <= 1" class="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-gray-50 shadow-sm" @click="prevPage">← Önceki</button>
        <button :disabled="page >= totalPages" class="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black disabled:opacity-40 hover:bg-black shadow-sm" @click="nextPage">Sonraki →</button>
      </div>
    </div>

    <!-- Yeni Ortaklık Modalı -->
    <div v-if="addModal.open" class="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="addModal.open = false" />
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 space-y-7">
        <h2 class="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">Yeni Ortaklık</h2>
        <div class="space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Vendor ID</label>
            <input v-model="addModal.vendorId" type="text" placeholder="vendor_abc123..."
              class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Taahhüt (Menü)</label>
              <input v-model.number="addModal.pledgedMenuCount" type="number" min="1"
                class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all" />
            </div>
            <div class="space-y-2">
              <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Reklam (Ay)</label>
              <input v-model.number="addModal.freeAdMonths" type="number" min="1" max="12"
                class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none transition-all" />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Not (opsiyonel)</label>
            <textarea v-model="addModal.notes" rows="2"
              class="w-full bg-gray-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:border-orange-400 outline-none resize-none transition-all" />
          </div>
        </div>
        <div class="flex gap-4">
          <button class="flex-1 py-4 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest" @click="addModal.open = false">Vazgeç</button>
          <button :disabled="addModal.saving || !addModal.vendorId"
            class="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
            @click="createPartner">
            {{ addModal.saving ? 'Ekleniyor...' : 'Ortaklık Başlat' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'GO Restoran Anlaşmaları — Admin' })

interface Partner {
  id: string; phase: string
  pledgedMenuCount: number; distributedCount: number
  remainingMenus: number; progressPct: number
  freeAdMonths: number; adMonthsUsed: number
  startDate: string
  restaurant: { name: string; city: string; district: string }
}

const { $api } = useApi()
const toast = useNuxtApp().$toast

const partners   = ref<Partner[]>([])
const loading    = ref(true)
const advancing  = ref<string | null>(null)
const phaseFilter = ref('')
const cityFilter  = ref('')
const page = ref(1); const total = ref(0); const limit = 20
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))

const PHASE_FILTERS = [
  { value: '', label: 'Tümü' },
  { value: 'PHASE_1', label: 'Faz 1' },
  { value: 'PHASE_2', label: 'Faz 2' },
  { value: 'PHASE_3', label: 'Faz 3' },
]
const PHASE_LABELS: Record<string, string> = { PHASE_1: 'Faz 1 — Başlangıç', PHASE_2: 'Faz 2 — Kampanya', PHASE_3: 'Faz 3 — B2B' }
const PHASE_COLORS: Record<string, string> = {
  PHASE_1: 'bg-amber-50 text-amber-700 border border-amber-200',
  PHASE_2: 'bg-blue-50 text-blue-700 border border-blue-200',
  PHASE_3: 'bg-green-50 text-green-700 border border-green-200',
}

const stats = computed(() => [
  { label: 'Toplam Ortak', value: total.value },
  { label: 'Faz 1', value: partners.value.filter(p => p.phase === 'PHASE_1').length },
  { label: 'Faz 2', value: partners.value.filter(p => p.phase === 'PHASE_2').length },
  { label: 'Faz 3 (B2B)', value: partners.value.filter(p => p.phase === 'PHASE_3').length },
])

const fetchPartners = async (): Promise<void> => {
  loading.value = true
  try {
    const params = new URLSearchParams({ page: String(page.value), limit: String(limit) })
    if (phaseFilter.value) params.set('phase', phaseFilter.value)
    if (cityFilter.value)  params.set('city',  cityFilter.value)
    const res = await $api<{ success: boolean; items: Partner[]; total: number }>(`/api/v1/admin/go/launch-partners?${params}`)
    partners.value = res.items ?? []
    total.value    = res.total  ?? 0
  } catch { toast.error('Ortaklar yüklenemedi') } finally { loading.value = false }
}

const setPhaseFilter = (v: string) => { phaseFilter.value = v; page.value = 1; fetchPartners() }
const prevPage = () => { if (page.value > 1) { page.value--; fetchPartners() } }
const nextPage = () => { if (page.value < totalPages.value) { page.value++; fetchPartners() } }
let debTimer: ReturnType<typeof setTimeout>
const debouncedFetch = () => { clearTimeout(debTimer); debTimer = setTimeout(() => { page.value = 1; fetchPartners() }, 400) }

const advancePhase = async (id: string): Promise<void> => {
  advancing.value = id
  try {
    await $api(`/api/v1/admin/go/launch-partners/${id}/advance`, { method: 'PUT' })
    toast.success('Faz güncellendi')
    await fetchPartners()
  } catch { toast.error('Faz güncellenemedi') } finally { advancing.value = null }
}

const addModal = reactive({ open: false, saving: false, vendorId: '', pledgedMenuCount: 60, freeAdMonths: 1, notes: '' })

const createPartner = async (): Promise<void> => {
  addModal.saving = true
  try {
    await $api('/api/v1/admin/go/launch-partners', {
      method: 'POST',
      body: { vendorId: addModal.vendorId, pledgedMenuCount: addModal.pledgedMenuCount, freeAdMonths: addModal.freeAdMonths, notes: addModal.notes },
    })
    toast.success('Ortaklık başlatıldı')
    addModal.open = false
    await fetchPartners()
  } catch (e: unknown) {
    toast.error((e as { data?: { error?: string } })?.data?.error ?? 'Eklenemedi')
  } finally { addModal.saving = false }
}

const formatDate = (d: string): string =>
  new Date(d).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' })

onMounted(fetchPartners)
</script>
