<template>
  <div class="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10 min-h-screen">

    <!-- Başlık -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <span class="text-[10px] font-black uppercase tracking-widest text-indigo-500">YÖNETİM PANELİ</span>
        <h1 class="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mt-1">
          Kullanıcı <span class="text-indigo-600">Loyalty</span> Yönetimi
        </h1>
        <p class="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest">BRONZE / SILVER / GOLD / PLATINUM / DIAMOND — XP VE TİER YÖNETİM MERKEZİ</p>
      </div>
      <!-- XP Eşikleri kısa yol butonu -->
      <button class="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
        @click="showXpThresholds = !showXpThresholds">
        {{ showXpThresholds ? '← Listeye Dön' : '⚙️ XP Eşikleri' }}
      </button>

      <!-- Tier dağılımı -->
      <div class="flex gap-3 flex-wrap">
        <div v-for="t in LOYALTY_TIERS" :key="t"
          class="flex flex-col items-center px-4 py-3 bg-white rounded-2xl shadow-sm border border-gray-100 min-w-[70px]">
          <span class="text-[9px] font-black uppercase" :class="LOYALTY_COLORS[t].text">{{ t }}</span>
          <span class="text-xl font-black text-gray-900 tracking-tighter">{{ tierCounts[t] ?? 0 }}</span>
        </div>
      </div>
    </div>

    <!-- XP Eşik Konfigürasyonu (§4 Tasarım Notu) -->
    <div v-if="showXpThresholds" class="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm space-y-6">
      <h2 class="font-black text-sm uppercase tracking-tight text-gray-900">XP Eşik Yapılandırması</h2>
      <p class="text-xs text-gray-500">Loyalty tier geçişleri için gerekli minimum XP değerlerini ayarlayın.</p>
      <div class="space-y-4">
        <div v-for="t in xpThresholds" :key="t.tier" class="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
          <div class="w-28 shrink-0">
            <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest"
              :class="LOYALTY_COLORS[t.tier as LoyaltyTier]?.badge ?? 'bg-gray-200 text-gray-700'">
              {{ t.tier }}
            </span>
          </div>
          <div class="flex-1">
            <label class="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Min. XP</label>
            <input v-model.number="t.minXp" type="number" min="0"
              class="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-black focus:outline-none focus:border-indigo-400 transition-all" />
          </div>
          <button :disabled="savingThreshold === t.tier"
            class="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shrink-0"
            @click="saveXpThreshold(t.tier, t.minXp)">
            {{ savingThreshold === t.tier ? '...' : 'Kaydet' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Filtreler -->
    <div v-if="!showXpThresholds" class="flex flex-wrap gap-4 items-center bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
      <input
        v-model="search"
        type="text"
        placeholder="E-posta ile ara..."
        class="flex-1 min-w-[200px] bg-neutral-50 border border-transparent rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-indigo-400 transition-all"
        @input="debouncedFetch"
      />
      <div class="flex gap-2 flex-wrap">
        <button
          v-for="t in ['HEPSİ', ...LOYALTY_TIERS]" :key="t"
          class="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
          :class="loyaltyFilter === (t === 'HEPSİ' ? '' : t)
            ? 'bg-gray-900 text-white shadow-lg'
            : 'bg-neutral-50 text-gray-500 hover:bg-gray-100'"
          @click="setFilter(t === 'HEPSİ' ? '' : t)"
        >{{ t }}</button>
      </div>
    </div>

    <!-- Tablo -->
    <div v-if="!showXpThresholds" class="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 gap-4">
        <div class="h-12 w-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        <p class="text-[10px] font-black uppercase tracking-widest text-gray-400">Yükleniyor...</p>
      </div>

      <div v-else-if="users.length === 0" class="py-20 text-center">
        <p class="text-gray-400 font-black uppercase text-sm">Kullanıcı bulunamadı</p>
      </div>

      <table v-else class="w-full text-left border-separate border-spacing-0">
        <thead>
          <tr class="bg-neutral-50/50">
            <th v-for="h in ['KULLANICI', 'ROL', 'TİER', 'MEVCUT XP', 'TOPLAM XP', 'SEVİYE', 'İŞLEM']"
              :key="h" class="px-7 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              {{ h }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-neutral-50">
          <tr v-for="u in users" :key="u.userId" class="hover:bg-neutral-50/30 transition-all">

            <!-- Kullanıcı -->
            <td class="px-7 py-5">
              <div class="font-black text-sm text-gray-900">{{ u.email }}</div>
              <div class="text-[10px] text-gray-400 font-bold mt-0.5">{{ u.userId.slice(0, 8) }}...</div>
            </td>

            <!-- Rol -->
            <td class="px-7 py-5">
              <span class="px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-600">
                {{ u.role }}
              </span>
            </td>

            <!-- Tier -->
            <td class="px-7 py-5">
              <span class="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                :class="LOYALTY_COLORS[u.tier as LoyaltyTier]?.badge ?? 'bg-gray-200 text-gray-700'">
                {{ u.tier }}
              </span>
            </td>

            <!-- Mevcut XP -->
            <td class="px-7 py-5">
              <span class="text-sm font-black text-indigo-600">{{ u.currentXp.toLocaleString('tr-TR') }}</span>
            </td>

            <!-- Toplam XP -->
            <td class="px-7 py-5">
              <span class="text-sm font-black text-gray-500">{{ u.lifetimeXp.toLocaleString('tr-TR') }}</span>
            </td>

            <!-- Seviye -->
            <td class="px-7 py-5">
              <span class="text-sm font-black text-gray-900">{{ u.level }}</span>
            </td>

            <!-- İşlem -->
            <td class="px-7 py-5">
              <button
                class="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all"
                @click="openXpModal(u)"
              >+ XP Ekle</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Sayfalama -->
    <div class="flex items-center justify-between">
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        Toplam {{ total }} kullanıcı — Sayfa {{ page }} / {{ totalPages }}
      </p>
      <div class="flex gap-3">
        <button :disabled="page <= 1" class="px-5 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black disabled:opacity-40 hover:bg-gray-50 transition-all shadow-sm" @click="prevPage">← Önceki</button>
        <button :disabled="page >= totalPages" class="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black disabled:opacity-40 hover:bg-black transition-all shadow-sm" @click="nextPage">Sonraki →</button>
      </div>
    </div>

    <!-- XP Ekleme Modal -->
    <div v-if="xpModal.open" class="fixed inset-0 z-[300] flex items-center justify-center px-4">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-sm" @click="closeXpModal" />
      <div class="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 space-y-8">
        <div>
          <h2 class="text-2xl font-black text-gray-900 italic uppercase tracking-tighter">Manuel XP Ekle</h2>
          <p class="text-[10px] font-black text-gray-400 mt-1 uppercase tracking-widest">{{ xpModal.email }}</p>
        </div>

        <div class="space-y-5">
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">XP Miktarı</label>
            <input
              v-model.number="xpModal.amount"
              type="number"
              min="1"
              placeholder="Örn: 500"
              class="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div class="space-y-2">
            <label class="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Açıklama (opsiyonel)</label>
            <input
              v-model="xpModal.reason"
              type="text"
              placeholder="Örn: Kampanya ödülü"
              class="w-full bg-neutral-50 border-2 border-transparent rounded-2xl px-5 py-4 text-sm font-black focus:bg-white focus:border-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div class="flex gap-4 justify-end pt-2">
          <button class="px-8 py-4 rounded-2xl text-[10px] font-black text-gray-400 hover:text-gray-900 uppercase tracking-widest transition-all" @click="closeXpModal">Vazgeç</button>
          <button
            :disabled="xpModal.saving || !xpModal.amount || xpModal.amount <= 0"
            class="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl disabled:opacity-50 active:scale-95"
            @click="submitXp"
          >{{ xpModal.saving ? 'Ekleniyor...' : 'XP Ekle' }}</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useHead({ title: 'Kullanıcı Loyalty Yönetimi // BAZARX' })

type LoyaltyTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

interface UserLoyaltyItem {
  userId: string
  email: string
  role: string
  status: string
  tier: string
  currentXp: number
  lifetimeXp: number
  level: number
}

interface Pagination { page: number; limit: number; total: number }
interface ApiResponse { success: boolean; data: UserLoyaltyItem[]; pagination: Pagination }

const { $api } = useApi()
const toast = useNuxtApp().$toast

const LOYALTY_TIERS: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

const LOYALTY_COLORS: Record<LoyaltyTier, { text: string; badge: string }> = {
  BRONZE:   { text: 'text-amber-800',  badge: 'bg-amber-700 text-white' },
  SILVER:   { text: 'text-gray-600',   badge: 'bg-gray-400 text-white' },
  GOLD:     { text: 'text-yellow-700', badge: 'bg-yellow-500 text-white' },
  PLATINUM: { text: 'text-blue-700',   badge: 'bg-blue-500 text-white' },
  DIAMOND:  { text: 'text-purple-700', badge: 'bg-purple-600 text-white' },
}

const users        = ref<UserLoyaltyItem[]>([])
const loading      = ref(true)
const search       = ref('')
// XP Eşik konfigürasyonu
const showXpThresholds  = ref(false)
const xpThresholds      = ref<{ tier: string; minXp: number }[]>([])
const savingThreshold   = ref<string | null>(null)
const loyaltyFilter = ref('')
const page         = ref(1)
const total        = ref(0)
const limit        = 20

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)))
const tierCounts = computed(() => {
  const c: Record<string, number> = {}
  LOYALTY_TIERS.forEach(t => { c[t] = 0 })
  users.value.forEach(u => { if (u.tier in c) c[u.tier]++ })
  return c
})

// XP Modal state
const xpModal = reactive({
  open:   false,
  userId: '',
  email:  '',
  amount: 0,
  reason: '',
  saving: false,
})

const fetchUsers = async (): Promise<void> => {
  loading.value = true
  try {
    const params = new URLSearchParams({
      page: String(page.value),
      limit: String(limit),
      ...(search.value && { search: search.value }),
      ...(loyaltyFilter.value && { tier: loyaltyFilter.value }),
    })
    const res = await $api<ApiResponse>(`/api/v1/admin/users/loyalty?${params}`)
    users.value = res.data ?? []
    total.value = res.pagination?.total ?? 0
  } catch {
    toast.error('Kullanıcılar yüklenemedi')
  } finally {
    loading.value = false
  }
}

const openXpModal = (u: UserLoyaltyItem): void => {
  xpModal.userId = u.userId
  xpModal.email  = u.email
  xpModal.amount = 0
  xpModal.reason = ''
  xpModal.open   = true
}

const closeXpModal = (): void => { xpModal.open = false }

const submitXp = async (): Promise<void> => {
  if (!xpModal.amount || xpModal.amount <= 0) return
  xpModal.saving = true
  try {
    await $api(`/api/v1/admin/users/${xpModal.userId}/xp`, {
      method: 'PATCH',
      body: { amount: xpModal.amount, reason: xpModal.reason || undefined },
    })
    toast.success(`${xpModal.amount} XP eklendi`)
    closeXpModal()
    await fetchUsers()
  } catch {
    toast.error('XP eklenemedi')
  } finally {
    xpModal.saving = false
  }
}

const setFilter = (t: string): void => { loyaltyFilter.value = t; page.value = 1; fetchUsers() }
const prevPage = (): void => { if (page.value > 1) { page.value--; fetchUsers() } }
const nextPage = (): void => { if (page.value < totalPages.value) { page.value++; fetchUsers() } }

let debounceTimer: ReturnType<typeof setTimeout>
const debouncedFetch = (): void => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { page.value = 1; fetchUsers() }, 400)
}

const fetchXpThresholds = async (): Promise<void> => {
  try {
    const res = await $api<{ success: boolean; data: { tier: string; minXp: number }[] }>('/api/v1/admin/users/loyalty/xp-thresholds')
    xpThresholds.value = res.data ?? []
  } catch { /* sessizce */ }
}

const saveXpThreshold = async (tier: string, minXp: number): Promise<void> => {
  savingThreshold.value = tier
  try {
    await $api(`/api/v1/admin/users/loyalty/xp-thresholds/${tier}`, { method: 'PATCH', body: { minXp } })
    toast.success(`${tier} XP eşiği güncellendi`)
  } catch { toast.error('Güncellenemedi') } finally { savingThreshold.value = null }
}

onMounted(() => {
  fetchUsers()
  fetchXpThresholds()
})
</script>
