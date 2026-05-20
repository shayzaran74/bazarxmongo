<template>
  <div class="bazarx-go min-h-screen bg-[var(--bg)] text-[var(--ink)] antialiased">

    <!-- CSS token tanımları (index.vue ile senkron) -->
    <style>
      .bazarx-go {
        --bg: #fafaf8; --ink: #111; --brand: #ff6b35; --brand-deep: #c94b1f;
        --brand-soft: #ff9e78; --surface: #f5f5f3; --surface-2: #ebebea;
        --accent: #22c55e;
      }
    </style>

    <!-- Header -->
    <header class="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-black/[0.06] shadow-sm">
      <div class="max-w-4xl mx-auto flex items-center justify-between px-5 py-4">
        <div class="flex items-center gap-3">
          <NuxtLink to="/bazarx-go" class="p-2 rounded-full hover:bg-[var(--surface)] transition-all">
            <ArrowLeftIcon class="w-5 h-5" />
          </NuxtLink>
          <div>
            <h1 class="font-black text-lg leading-none">QR Cüzdanım</h1>
            <p class="text-xs text-black/40 mt-0.5">{{ activeCount }} aktif kod</p>
          </div>
        </div>
        <NuxtLink to="/bazarx-go/membership"
          class="bg-[var(--brand-deep)] text-white px-4 py-2 rounded-full text-xs font-black hover:bg-[var(--brand)] transition-all">
          + Menü Ekle
        </NuxtLink>
      </div>
    </header>

    <div class="max-w-4xl mx-auto px-5 py-8 space-y-6">

      <!-- Yükleniyor -->
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-40 bg-[var(--surface)] rounded-3xl animate-pulse" />
      </div>

      <!-- Boş durum -->
      <div v-else-if="purchases.length === 0"
        class="flex flex-col items-center justify-center py-24 text-center space-y-4">
        <div class="w-20 h-20 rounded-3xl bg-[var(--surface)] flex items-center justify-center text-4xl">🎟️</div>
        <h2 class="font-black text-xl">Henüz QR kodun yok</h2>
        <p class="text-black/50 text-sm max-w-xs">Restoran menüsü satın alarak QR cüzdanını doldurmaya başla.</p>
        <NuxtLink to="/bazarx-go/membership"
          class="bg-[var(--brand-deep)] text-white px-8 py-3 rounded-full text-sm font-black hover:bg-[var(--brand)] transition-all">
          Üyelik Seç
        </NuxtLink>
      </div>

      <template v-else>
        <!-- Filtre -->
        <div class="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button v-for="f in FILTERS" :key="f.value"
            class="shrink-0 px-4 py-2 rounded-full text-xs font-black transition-all"
            :class="filter === f.value
              ? 'bg-[var(--ink)] text-white'
              : 'bg-[var(--surface)] text-black/60 hover:bg-[var(--surface-2)]'"
            @click="filter = f.value">
            {{ f.label }}
          </button>
        </div>

        <!-- QR Kartları -->
        <div class="space-y-4">
          <div v-for="p in filteredPurchases" :key="p.id"
            class="bg-white rounded-3xl border border-black/[0.06] shadow-sm overflow-hidden">

            <!-- Üst bölüm: Restoran bilgisi + kategori badge -->
            <div class="p-5 flex items-start justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="CATEGORY_COLORS[p.menuCategory ?? 6]">
                    {{ CATEGORY_NAMES[p.menuCategory ?? 6] }}
                  </span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-600'">
                    {{ STATUS_LABELS[p.status] ?? p.status }}
                  </span>
                </div>
                <h3 class="font-black text-base leading-tight truncate">{{ p.menuTitle || p.listingId }}</h3>
                <p class="text-xs text-black/40 mt-0.5">
                  {{ p.restaurantName || 'Restoran' }}
                </p>
              </div>
              <!-- Kalan gün -->
              <div class="shrink-0 text-center">
                <span class="block text-2xl font-black" :class="daysLeft(p.qrExpiresAt) <= 3 ? 'text-red-500' : 'text-[var(--brand-deep)]'">
                  {{ daysLeft(p.qrExpiresAt) }}
                </span>
                <span class="text-[10px] text-black/40 font-bold uppercase tracking-wider">gün kaldı</span>
              </div>
            </div>

            <!-- QR Kodu göster -->
            <div class="px-5 pb-4 flex gap-3">
              <!-- Ana QR -->
              <div v-if="p.status === 'ACTIVE' || p.status === 'PARTIALLY_REDEEMED'"
                class="flex-1 bg-[var(--surface)] rounded-2xl p-4 text-center space-y-2">
                <p class="text-[10px] font-black uppercase tracking-widest text-black/40">Ana QR</p>
                <div class="font-mono text-xs font-black tracking-widest bg-white rounded-xl px-3 py-2 select-all border border-black/[0.06]">
                  {{ p.qrCode }}
                </div>
                <div class="flex gap-2">
                  <button class="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-[var(--brand-deep)] bg-[var(--brand-deep)]/5 rounded-xl py-2 hover:bg-[var(--brand-deep)]/10 transition-all"
                    @click="copyQr(p.qrCode)">
                    <ClipboardDocumentIcon class="w-3 h-3" />
                    Kopyala
                  </button>
                  <button class="flex-1 flex items-center justify-center gap-1 text-[10px] font-black text-black/50 bg-black/5 rounded-xl py-2 hover:bg-black/10 transition-all"
                    @click="openTransfer(p)">
                    <ArrowUpRightIcon class="w-3 h-3" />
                    Devret
                  </button>
                </div>
              </div>

              <!-- 1+1 QR -->
              <div v-if="p.oneFreeQrCode && !p.oneFreeUsedAt"
                class="flex-1 bg-green-50 rounded-2xl p-4 text-center space-y-2 border border-green-100">
                <p class="text-[10px] font-black uppercase tracking-widest text-green-600">1+1 Ücretsiz</p>
                <div class="font-mono text-xs font-black tracking-widest bg-white rounded-xl px-3 py-2 select-all border border-green-200">
                  {{ p.oneFreeActivatedAt ? p.oneFreeQrCode : '••••••••••' }}
                </div>
                <button v-if="!p.oneFreeActivatedAt"
                  class="w-full text-[10px] font-black text-green-700 bg-green-100 rounded-xl py-2 hover:bg-green-200 transition-all"
                  @click="activateOneFree(p.id)">
                  🎁 Aktive Et
                </button>
                <button v-else
                  class="w-full text-[10px] font-black text-green-700 bg-green-100 rounded-xl py-2 hover:bg-green-200 transition-all"
                  @click="copyQr(p.oneFreeQrCode!)">
                  Kopyala
                </button>
              </div>
            </div>

            <!-- Alt aksiyon: Rezervasyon butonu -->
            <div v-if="p.status === 'ACTIVE'"
              class="px-5 pb-5">
              <NuxtLink :to="`/bazarx-go/reservation/${p.id}`"
                class="block w-full text-center bg-[var(--ink)] text-white text-xs font-black py-3 rounded-2xl hover:bg-black/80 transition-all">
                📅 Rezervasyon Yap
              </NuxtLink>
            </div>

          </div>
        </div>
      </template>
    </div>

    <!-- Devir Modalı -->
    <div v-if="transferModal.open" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div class="fixed inset-0 bg-black/40 backdrop-blur-sm" @click="transferModal.open = false" />
      <div class="relative bg-white rounded-3xl w-full max-w-md p-8 space-y-6">
        <h2 class="font-black text-xl">Menüyü Devret</h2>
        <p class="text-sm text-black/50">QR'ı devretmek istediğin kişinin kullanıcı ID'sini gir. Devir geri alınamaz.</p>
        <div class="space-y-2">
          <label class="text-[10px] font-black uppercase tracking-widest text-black/40 block">Alıcı Kullanıcı ID</label>
          <input v-model="transferModal.toUserId" type="text" placeholder="user_abc123..."
            class="w-full bg-[var(--surface)] rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--brand)] transition-all" />
        </div>
        <div class="flex gap-3">
          <button class="flex-1 py-3 rounded-2xl text-sm font-black bg-[var(--surface)] hover:bg-[var(--surface-2)]"
            @click="transferModal.open = false">Vazgeç</button>
          <button :disabled="transferModal.loading || !transferModal.toUserId"
            class="flex-1 py-3 rounded-2xl text-sm font-black bg-[var(--brand-deep)] text-white disabled:opacity-50 hover:bg-[var(--brand)] transition-all"
            @click="confirmTransfer">
            {{ transferModal.loading ? 'Devrediliyor...' : 'Devret' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeftIcon, ClipboardDocumentIcon, ArrowUpRightIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({ layout: false })
useHead({ title: 'QR Cüzdanım — BazarX Go' })

interface Purchase {
  id: string
  listingId: string
  menuTitle?: string
  restaurantName?: string
  status: string
  qrCode: string
  qrExpiresAt: string
  oneFreeQrCode?: string
  oneFreeActivatedAt?: string
  oneFreeUsedAt?: string
  menuCategory?: number
  isTransferred: boolean
}

const { $api } = useApi()
const toast = useNuxtApp().$toast

const purchases  = ref<Purchase[]>([])
const loading    = ref(true)
const filter     = ref('ACTIVE')

const FILTERS = [
  { value: 'ACTIVE', label: '✅ Aktif' },
  { value: 'ALL',    label: '🗂 Tümü' },
  { value: 'EXPIRED',label: '⏰ Süresi Dolan' },
]

const CATEGORY_NAMES: Record<number, string> = {
  1: 'VIP Fine Dining', 2: 'Mid-Point', 3: 'Casual Dining',
  4: 'Tatlı & Pastane', 5: 'Kahve & İçecek', 6: 'Dondurma & Ekler',
}

const CATEGORY_COLORS: Record<number, string> = {
  1: 'bg-purple-100 text-purple-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-orange-100 text-orange-700',
  4: 'bg-pink-100 text-pink-700',
  5: 'bg-amber-100 text-amber-700',
  6: 'bg-cyan-100 text-cyan-700',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif', PARTIALLY_REDEEMED: 'Kısmen Kullanıldı',
  EXPIRED: 'Süresi Doldu', TRANSFERRED: 'Devredildi',
  REDEEMED: 'Kullanıldı', CANCELLED: 'İptal',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:             'bg-green-100 text-green-700',
  PARTIALLY_REDEEMED: 'bg-amber-100 text-amber-700',
  EXPIRED:            'bg-red-100 text-red-600',
  TRANSFERRED:        'bg-gray-100 text-gray-500',
  REDEEMED:           'bg-gray-100 text-gray-500',
}

const activeCount = computed(() => purchases.value.filter(p => p.status === 'ACTIVE').length)

const filteredPurchases = computed(() => {
  if (filter.value === 'ALL') return purchases.value
  return purchases.value.filter(p => p.status === filter.value)
})

const daysLeft = (expiresAt: string): number => {
  const diff = new Date(expiresAt).getTime() - Date.now()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

const fetchWallet = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<{ success: boolean; data: Purchase[] }>('/api/v1/menu/wallet?all=true')
    purchases.value = res.data ?? []
  } catch {
    toast.error('QR\'lar yüklenemedi')
  } finally {
    loading.value = false
  }
}

const copyQr = (code: string): void => {
  navigator.clipboard.writeText(code).then(() => toast.success('QR kodu kopyalandı'))
}

const activateOneFree = async (purchaseId: string): Promise<void> => {
  try {
    await $api(`/api/v1/menu/activate-one-free/${purchaseId}`, { method: 'POST' })
    toast.success('1+1 hakkı aktive edildi!')
    await fetchWallet()
  } catch {
    toast.error('Aktivasyon başarısız')
  }
}

// Devir modal
const transferModal = reactive({
  open: false, loading: false, purchaseId: '', toUserId: '',
})

const openTransfer = (p: Purchase): void => {
  transferModal.purchaseId = p.id
  transferModal.toUserId   = ''
  transferModal.open       = true
}

const confirmTransfer = async (): Promise<void> => {
  if (!transferModal.toUserId.trim()) return
  transferModal.loading = true
  try {
    await $api(`/api/v1/menu/transfer/${transferModal.purchaseId}`, {
      method: 'POST',
      body: { toUserId: transferModal.toUserId },
    })
    toast.success('Menü başarıyla devredildi!')
    transferModal.open = false
    await fetchWallet()
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string } })?.data?.message
    toast.error(msg ?? 'Devir başarısız')
  } finally {
    transferModal.loading = false
  }
}

onMounted(fetchWallet)
</script>

<style scoped>
.scrollbar-none { scrollbar-width: none; }
.scrollbar-none::-webkit-scrollbar { display: none; }
</style>
