<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 min-h-screen">

    <!-- Başlık -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">YÖNETİM PANELİ</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Satıcı <span class="text-indigo-600">Tier</span> Yönetimi
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">CORE / PRIME / ELITE / APEX — SATIÇI SEVİYE ATAMA MERKEZİ</p>
      </div>

      <!-- Özet istatistikler -->
      <div class="flex gap-4 flex-wrap">
        <div v-for="(count, tier) in tierCounts" :key="tier"
          class="flex flex-col items-center px-6 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[80px]">
          <span class="text-xs font-black uppercase" :class="TIER_COLORS[tier as TierKey]?.text">{{ tier }}</span>
          <span class="text-2xl font-black text-gray-900 tracking-tighter">{{ count }}</span>
        </div>
      </div>
    </div>

    <!-- Filtreler -->
    <div class="flex flex-wrap gap-4 items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <input
        v-model="search"
        type="text"
        placeholder="Firma veya e-posta ara..."
        class="flex-1 min-w-[200px] bg-neutral-50 border border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-400 transition-all"
        @input="debouncedFetch"
      />
      <div class="flex gap-2">
        <button
          v-for="t in ['HEPSİ', 'CORE', 'PRIME', 'ELITE', 'APEX']" :key="t"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="tierFilter === (t === 'HEPSİ' ? '' : t)
            ? 'bg-gray-900 text-white shadow-lg'
            : 'bg-neutral-50 text-gray-500 hover:bg-gray-100'"
          @click="setTierFilter(t === 'HEPSİ' ? '' : t)"
        >{{ t }}</button>
      </div>
    </div>

    <!-- Tablo -->
    <div class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
      </div>

      <div v-else-if="vendors.length === 0" class="py-20 text-center">
        <p class="text-gray-400 font-black uppercase text-sm">Satıcı bulunamadı</p>
      </div>

      <table v-else class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['FİRMA', 'E-POSTA', 'DURUM', 'MEVCUT TİER', 'TİER DEĞİŞTİR', '']"
              :key="h" class="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="vendor in vendors" :key="vendor.id" class="hover:bg-neutral-50/30 transition-all">

            <!-- Firma -->
            <td class="px-8 py-5">
              <div class="font-black text-gray-900 text-sm">{{ vendor.profile?.storeName || vendor.company?.name || '—' }}</div>
              <div class="text-[10px] text-gray-400 font-bold mt-0.5">{{ vendor.id.slice(0, 8) }}...</div>
            </td>

            <!-- E-posta -->
            <td class="px-8 py-5 text-sm text-gray-600 font-bold">{{ vendor.user?.email || '—' }}</td>

            <!-- Durum -->
            <td class="px-8 py-5">
              <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest"
                :class="STATUS_COLORS[vendor.status] ?? 'bg-gray-100 text-gray-600'">
                {{ vendor.status }}
              </span>
            </td>

            <!-- Mevcut tier -->
            <td class="px-8 py-5">
              <span class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                :class="TIER_COLORS[vendor.tier as TierKey]?.badge ?? 'bg-gray-200 text-gray-700'">
                {{ vendor.tier || 'CORE' }}
              </span>
            </td>

            <!-- Tier değiştir -->
            <td class="px-8 py-5">
              <select
                :value="vendor.tier || 'CORE'"
                :disabled="saving[vendor.id]"
                class="bg-neutral-50 border border-transparent rounded-xl px-3 py-2 text-xs font-black uppercase focus:outline-none focus:border-indigo-400 cursor-pointer transition-all disabled:opacity-50"
                @change="(e) => changeTier(vendor.id, (e.target as HTMLSelectElement).value)"
              >
                <option v-for="t in TIERS" :key="t" :value="t">{{ t }}</option>
              </select>
            </td>

            <!-- Spinner -->
            <td class="px-8 py-5 w-10">
              <div v-if="saving[vendor.id]" class="h-5 w-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Toplam {{ total }} satıcı — Sayfa {{ page }} / {{ totalPages }}
      </p>
      <div class="flex gap-3">
        <button :disabled="page <= 1" class="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm" @click="prevPage">← Önceki</button>
        <button :disabled="page >= totalPages" class="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black disabled:opacity-40 hover:bg-black transition-all shadow-sm" @click="nextPage">Sonraki →</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ChartBarIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Satıcı Tier Yönetimi // BAZARX' })

type TierKey = 'CORE' | 'PRIME' | 'ELITE' | 'APEX'

interface VendorItem {
  id: string
  status: string
  tier: string
  profile?: { storeName?: string }
  company?: { name?: string }
  user?: { email?: string }
}

interface ApiResponse<T> { success: boolean; data: T; total?: number }

const { $api } = useApi()
const toast = useNuxtApp().$toast

const TIERS: TierKey[] = ['CORE', 'PRIME', 'ELITE', 'APEX']

const TIER_COLORS: Record<TierKey, { text: string; badge: string }> = {
  CORE:  { text: 'text-slate-700',  badge: 'bg-slate-900 text-white' },
  PRIME: { text: 'text-blue-700',   badge: 'bg-blue-600 text-white' },
  ELITE: { text: 'text-purple-700', badge: 'bg-purple-600 text-white' },
  APEX:  { text: 'text-amber-700',  badge: 'bg-amber-500 text-white' },
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: 'bg-green-50 text-green-700 border border-green-200',
  PENDING:  'bg-amber-50 text-amber-700 border border-amber-200',
  REJECTED: 'bg-red-50 text-red-700 border border-red-200',
}

const vendors    = ref<VendorItem[]>([])
const loading    = ref(true)
const saving     = ref<Record<string, boolean>>({})
const search     = ref('')
const tierFilter = ref('')
const page       = ref(1)
const total      = ref(0)
const limit      = 20

const totalPages  = computed(() => Math.max(1, Math.ceil(total.value / limit)))
const tierCounts  = computed(() => {
  const counts: Record<string, number> = { CORE: 0, PRIME: 0, ELITE: 0, APEX: 0 }
  vendors.value.forEach(v => { if (v.tier && counts[v.tier] !== undefined) counts[v.tier]++ })
  return counts
})

const fetchVendors = async (): Promise<void> => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit),
      ...(search.value && { q: search.value }),
      ...(tierFilter.value && { tier: tierFilter.value }),
    })
    const res = await $api<ApiResponse<VendorItem[]>>(`/api/v1/admin/vendors?${params}`)
    vendors.value = res.data ?? []
    total.value   = res.total ?? 0
  } catch {
    toast.error('Satıcılar yüklenemedi')
  } finally {
    loading.value = false
  }
}

const changeTier = async (vendorId: string, newTier: string): Promise<void> => {
  saving.value[vendorId] = true
  try {
    await $api(`/api/v1/admin/vendors/${vendorId}`, {
      method: 'PUT',
      body: { tier: newTier },
    })
    const v = vendors.value.find(x => x.id === vendorId)
    if (v) v.tier = newTier
    toast.success(`${newTier} tier'ına güncellendi`)
  } catch {
    toast.error('Tier güncellenemedi')
  } finally {
    saving.value[vendorId] = false
  }
}

const setTierFilter = (t: string): void => { tierFilter.value = t; page.value = 1; fetchVendors() }
const prevPage = (): void => { if (page.value > 1) { page.value--; fetchVendors() } }
const nextPage = (): void => { if (page.value < totalPages.value) { page.value++; fetchVendors() } }

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = (): void => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchVendors() }, 400)
}

onMounted(fetchVendors)
</script>
