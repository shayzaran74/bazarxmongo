<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true">
    <div class="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <!-- Top Navigation / Header -->
      <header class="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <div class="h-10 w-10 rounded-xl bg-primary-container flex items-center justify-center text-primary">
            <Icon name="heroicons:briefcase" size="24" />
          </div>
          <div>
            <h1 class="text-[22px] font-black tracking-tight text-md3-primary leading-none">TicariTakas <span class="text-blue-500">B2B</span></h1>
            <p class="text-[11px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Kurumsal Takas Portalı</p>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <div class="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <span class="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Durumu: Aktif</span>
          </div>
          <button class="p-2 text-slate-400 hover:text-primary transition-colors relative">
            <Icon name="heroicons:bell" size="24" />
            <span class="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div class="h-10 w-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden">
            <img :src="authStore.user?.avatar || '/placeholder-user.jpg'" class="w-full h-full object-cover">
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="p-6 bg-[#F8FAFC]">

        <!-- Hero + Metrikler -->
        <div class="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center mb-8">
          <div class="xl:col-span-6 space-y-4">
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              <span class="text-[10px] font-black uppercase tracking-widest">Elite Kurumsal Üyelik</span>
            </div>
            <h2 class="text-[38px] leading-[1.1] font-black text-md3-primary tracking-tightest">
              Stratejik Takas ile <br/>
              <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Nakit Akışınızı</span> Güçlendirin.
            </h2>
            <p class="text-slate-500 text-base font-medium max-w-xl">
              Atıl stoklarınızı ve kapasitenizi değerlendirin, ihtiyacınız olan ürün ve hizmetlere nakit harcamadan ulaşın.
            </p>
            <div class="flex gap-3 pt-2">
              <NuxtLink to="/ticaritakas/inbox" class="px-6 py-3 bg-md3-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                YENİ İLAN OLUŞTUR
              </NuxtLink>
              <NuxtLink to="/ticaritakas/trade-pool/all" class="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                HAVUZU İNCELE
              </NuxtLink>
            </div>
          </div>

          <!-- Metrikler -->
          <div class="xl:col-span-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div
              v-for="(stat, i) in metrics"
              :key="i"
              class="p-4 bg-white rounded-2xl shadow-ambient border border-slate-50 hover:border-blue-100 transition-colors group"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="p-1.5 rounded-lg" :class="stat.color">
                  <Icon :name="stat.icon" size="16" :class="stat.iconColor" />
                </div>
                <span class="text-[9px] font-black text-slate-300 uppercase">Canlı</span>
              </div>
              <h3 class="text-xl font-black text-md3-primary tracking-tighter">{{ stat.value }}</h3>
              <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{{ stat.label }}</p>
              <div v-if="stat.bar" class="mt-3 space-y-1">
                <div class="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" :style="`width: ${stat.barPct}%`" />
                </div>
                <p class="text-[9px] font-bold text-slate-400">{{ stat.sub }}</p>
              </div>
              <p v-else class="mt-3 text-[9px] font-bold text-blue-500 italic">{{ stat.sub }}</p>
            </div>
          </div>
        </div>

        <!-- İçerik Alanı: Sol Arama Barı + Sağ Fırsatlar -->
        <div class="flex gap-6 items-start">

          <!-- Sol Arama Barı -->
          <aside class="w-72 flex-shrink-0 bg-white rounded-2xl shadow-ambient border border-slate-100 overflow-hidden sticky top-24">
            <!-- Başlık -->
            <div class="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Icon name="heroicons:funnel" size="18" class="text-blue-500" />
                <span class="font-black text-sm text-md3-primary">Detaylı Arama</span>
              </div>
              <button
                v-if="hasActiveFilters"
                class="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors"
                type="button"
                @click="clearFilters"
              >
                Temizle
              </button>
            </div>

            <div class="p-5 space-y-5">

              <!-- Anahtar Kelime -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Anahtar Kelime</label>
                <div class="relative">
                  <Icon name="heroicons:magnifying-glass" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="filters.keyword"
                    type="text"
                    placeholder="İlan başlığı, açıklama..."
                    class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <!-- Kategori -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kategori</label>
                <select
                  v-model="filters.category"
                  class="w-full px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                >
                  <option value="">Tüm Kategoriler</option>
                  <option v-for="cat in availableCategories" :key="cat" :value="cat">{{ cat }}</option>
                </select>
              </div>

              <!-- Fiyat Aralığı -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Takas Değeri (TL)</label>
                <div class="flex gap-2">
                  <input
                    v-model="filters.minPrice"
                    type="number"
                    placeholder="Min"
                    min="0"
                    class="w-1/2 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                  <input
                    v-model="filters.maxPrice"
                    type="number"
                    placeholder="Max"
                    min="0"
                    class="w-1/2 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <!-- Şehir -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Şehir</label>
                <div class="relative">
                  <Icon name="heroicons:map-pin" size="16" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    v-model="filters.city"
                    type="text"
                    placeholder="İstanbul, Ankara..."
                    class="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <!-- Sırala -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sıralama</label>
                <div class="space-y-1.5">
                  <label
                    v-for="opt in sortOptions"
                    :key="opt.value"
                    class="flex items-center gap-2.5 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                    :class="filters.sort === opt.value ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'"
                  >
                    <input type="radio" v-model="filters.sort" :value="opt.value" class="accent-blue-600" />
                    <span class="text-xs font-semibold">{{ opt.label }}</span>
                  </label>
                </div>
              </div>

              <!-- Hızlı Filtreler -->
              <div>
                <label class="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Hızlı Filtreler</label>
                <div class="flex flex-wrap gap-2">
                  <button
                    v-for="tag in quickTags"
                    :key="tag.value"
                    type="button"
                    class="px-3 py-1.5 text-[10px] font-black rounded-full border transition-all uppercase tracking-wider"
                    :class="activeQuickTag === tag.value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600'"
                    @click="toggleQuickTag(tag.value)"
                  >
                    {{ tag.label }}
                  </button>
                </div>
              </div>

            </div>

            <!-- Sonuç sayısı -->
            <div class="px-5 py-3 bg-slate-50 border-t border-slate-100">
              <p class="text-[11px] text-slate-500">
                <span class="font-black text-md3-primary">{{ filteredOpportunities.length }}</span>
                ilan bulundu
              </p>
            </div>
          </aside>

          <!-- Aktif Takas Fırsatları -->
          <div class="flex-1 bg-white rounded-2xl shadow-ambient overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <div class="flex items-center gap-3">
                <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Aktif Takas Fırsatları</h4>
                <span class="px-2.5 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-black rounded-full">{{ filteredOpportunities.length }}</span>
              </div>
              <NuxtLink to="/ticaritakas/trade-pool/all" class="text-sm font-bold text-primary-600 hover:underline">Tümünü Gör</NuxtLink>
            </div>

            <!-- Boş durum -->
            <div v-if="filteredOpportunities.length === 0" class="flex flex-col items-center justify-center py-20 text-center px-8">
              <div class="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Icon name="heroicons:magnifying-glass" size="28" class="text-slate-300" />
              </div>
              <p class="font-black text-slate-700 mb-1">Sonuç bulunamadı</p>
              <p class="text-sm text-slate-400">Filtrelerinizi değiştirerek tekrar deneyin.</p>
              <button class="mt-4 text-sm font-bold text-blue-500 hover:underline" type="button" @click="clearFilters">Filtreleri Temizle</button>
            </div>

            <div v-else class="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <div
                v-for="(opp, index) in filteredOpportunities"
                :key="opp.id"
                class="p-4 border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative overflow-hidden"
                @click="navigateTo(`/ticaritakas/trade-pool/${opp.id}`)"
              >
                <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
                <div class="flex gap-4 relative z-10">
                  <div class="h-20 w-20 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                    <img v-if="opp.image" :src="opp.image" class="w-full h-full object-cover" />
                    <Icon v-else :name="opp.icon" size="32" class="text-blue-500/50 group-hover:text-blue-500" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-2">
                      <p class="font-black text-sm text-[#002444] group-hover:text-blue-600 transition-colors truncate">{{ opp.title }}</p>
                      <span class="bg-blue-50 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shrink-0">{{ opp.category }}</span>
                    </div>
                    <p class="text-[11px] text-slate-500 mt-1 line-clamp-1 font-medium">{{ opp.desc }}</p>
                    <div class="mt-4 flex justify-between items-center">
                      <div class="flex flex-col">
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Takas Değeri</span>
                        <span class="text-sm font-black text-[#002444]">{{ opp.value }}</span>
                      </div>
                      <div class="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest">Detaylar</span>
                        <Icon name="heroicons:arrow-right" size="14" class="text-blue-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Son İşlemler -->
        <div class="mt-6 bg-white rounded-2xl shadow-ambient border border-slate-100 overflow-hidden">
          <div class="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div class="flex items-center gap-3">
              <Icon name="heroicons:clock" size="20" class="text-blue-500" />
              <h4 class="text-[18px] font-semibold text-md3-primary">Son İşlemler</h4>
            </div>
            <NuxtLink to="/ticaritakas/offers" class="text-sm font-bold text-primary-600 hover:underline">Tümünü Gör</NuxtLink>
          </div>

          <div v-if="recentTx.length === 0" class="flex flex-col items-center justify-center py-12 text-center px-8">
            <Icon name="heroicons:document-text" size="32" class="text-slate-200 mb-3" />
            <p class="font-bold text-slate-500 text-sm">Henüz işlem bulunmuyor</p>
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th class="px-6 py-3 text-left">İşlem No</th>
                  <th class="px-6 py-3 text-left">Karşı Taraf</th>
                  <th class="px-6 py-3 text-left">Tür</th>
                  <th class="px-6 py-3 text-left">Tarih</th>
                  <th class="px-6 py-3 text-right">Tutar</th>
                  <th class="px-6 py-3 text-center">Durum</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr
                  v-for="tx in recentTx"
                  :key="tx.rawId"
                  class="hover:bg-slate-50/60 transition-colors cursor-pointer"
                  @click="navigateTo(`/ticaritakas/offers/${tx.rawId}`)"
                >
                  <td class="px-6 py-3.5 font-black text-xs text-blue-600">{{ tx.id }}</td>
                  <td class="px-6 py-3.5 font-medium text-slate-700">{{ tx.partner }}</td>
                  <td class="px-6 py-3.5 text-slate-500 text-xs">{{ tx.category }}</td>
                  <td class="px-6 py-3.5 text-slate-400 text-xs">{{ tx.date }}</td>
                  <td class="px-6 py-3.5 text-right font-black text-slate-700">{{ tx.value }} TL</td>
                  <td class="px-6 py-3.5 text-center">
                    <span :class="['inline-flex px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest', tx.statusClass]">
                      {{ tx.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  </AccessGuard>
</template>

<script setup lang="ts">
import TtAccessBarrier from '~/components/ticaritakas/TtAccessBarrier.vue'

definePageMeta({ layout: false })

useHead({
  title: 'TicariTakas B2B — Kurumsal Panel',
  meta: [{ name: 'description', content: 'TicariTakas B2B kurumsal takas paneli — Elite üyelik, trade pool, XP yönetimi' }],
})

const { $api } = useApi()
const authStore = useAuthStore()

// Access Control
const isVendor = computed(() => {
  return authStore.isAuthenticated && (authStore.user?.role === 'VENDOR' || authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN')
})

// State
const loading = ref(true)
const myCompany = ref<any>(null)

// Tier → havuz limiti eşlemesi (MasterPlan v4.3 §3)
const TIER_LIMITS: Record<string, number> = {
  CORE:  150_000,
  PRIME: 500_000,
  ELITE: 1_500_000,
  APEX:  10_000_000,
}

const metrics = ref([
  { label: 'TAKAS HAVUZU BAKİYESİ', value: '—', icon: 'account_balance_wallet', color: 'bg-primary-container', iconColor: 'text-blue-600', bar: true, barPct: 0, sub: 'Veri yükleniyor...' },
  { label: 'BEKLEYEN TEKLİFLER',    value: '—', icon: 'stars',                  color: 'bg-tertiary-container', iconColor: 'text-tertiary-container', sub: 'Veri yükleniyor...' },
  { label: 'AKTİF İLANLAR',        value: '—', icon: 'gavel',                  color: 'bg-primary-container', iconColor: 'text-primary-container',  sub: 'Veri yükleniyor...' },
  { label: 'XP BAKİYESİ',          value: '—', icon: 'savings',                color: 'bg-secondary-container', iconColor: 'text-md3-secondary',    sub: 'Veri yükleniyor...' },
])

const opportunities = ref<any[]>([])
const recentTx = ref<any[]>([])

// Arama/Filtreleme State
const filters = ref({ keyword: '', category: '', minPrice: '', maxPrice: '', city: '', sort: 'newest' })
const activeQuickTag = ref('')

const sortOptions = [
  { value: 'newest', label: 'En Yeni' },
  { value: 'price_asc', label: 'Fiyat: Artan' },
  { value: 'price_desc', label: 'Fiyat: Azalan' },
  { value: 'title', label: 'İsme Göre' },
]

const quickTags = [
  { value: 'high_value', label: '100K+ TL' },
  { value: 'recent', label: 'Bu Hafta' },
  { value: 'no_cash', label: 'Nakitsiz' },
]

const availableCategories = computed(() => [...new Set(opportunities.value.map((o: any) => o.category).filter(Boolean))])

const hasActiveFilters = computed(() =>
  !!(filters.value.keyword || filters.value.category || filters.value.minPrice ||
     filters.value.maxPrice || filters.value.city || activeQuickTag.value || filters.value.sort !== 'newest')
)

const filteredOpportunities = computed(() => {
  let result = [...opportunities.value]
  if (filters.value.keyword) {
    const kw = filters.value.keyword.toLowerCase()
    result = result.filter((o: any) => o.title.toLowerCase().includes(kw) || o.desc.toLowerCase().includes(kw))
  }
  if (filters.value.category) result = result.filter((o: any) => o.category === filters.value.category)
  if (filters.value.minPrice) result = result.filter((o: any) => parseFloat(o.rawPrice ?? 0) >= parseFloat(filters.value.minPrice))
  if (filters.value.maxPrice) result = result.filter((o: any) => parseFloat(o.rawPrice ?? 0) <= parseFloat(filters.value.maxPrice))
  if (filters.value.city) { const c = filters.value.city.toLowerCase(); result = result.filter((o: any) => o.city?.toLowerCase().includes(c)) }
  if (activeQuickTag.value === 'high_value') result = result.filter((o: any) => parseFloat(o.rawPrice ?? 0) >= 100_000)
  if (filters.value.sort === 'price_asc') result.sort((a: any, b: any) => parseFloat(a.rawPrice ?? 0) - parseFloat(b.rawPrice ?? 0))
  else if (filters.value.sort === 'price_desc') result.sort((a: any, b: any) => parseFloat(b.rawPrice ?? 0) - parseFloat(a.rawPrice ?? 0))
  else if (filters.value.sort === 'title') result.sort((a: any, b: any) => a.title.localeCompare(b.title, 'tr'))
  return result
})

const clearFilters = () => { filters.value = { keyword: '', category: '', minPrice: '', maxPrice: '', city: '', sort: 'newest' }; activeQuickTag.value = '' }
const toggleQuickTag = (val: string) => { activeQuickTag.value = activeQuickTag.value === val ? '' : val }

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const compRes = await $api<any>('/api/v1/companies/me')
    if (compRes.success && (compRes.data || (compRes as any).company)) {
      myCompany.value = compRes.data || (compRes as any).company || null
    }

    const [surplusRes, offersRes, barterRes] = await Promise.all([
      $api<any>('/api/v1/surplus', { query: { limit: 20 } }),
      $api<any>('/api/v1/offers/my'),
      $api<any>('/api/v1/barter/info').catch(() => null),
    ])

    if (surplusRes?.success) {
      const items = (surplusRes as any).items || surplusRes.data || []
      opportunities.value = items.map((item: any) => ({
        id:       item.id,
        title:    item.title,
        category: item.category || 'Genel',
        desc:     item.description || 'Açıklama bulunmuyor.',
        value:    `${item.unitPrice || 0} TL`,
        rawPrice: String(item.unitPrice || 0),
        city:     item.location?.split(',')[0]?.trim() || '',
        image:    Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
        icon:     'inventory_2',
      }))
      metrics.value[2].value = String(surplusRes.meta?.total || items.length)
    }

    if (offersRes?.success) {
      const currentVendorId = authStore.user?.vendorId
      const allOffers = (offersRes as any).offers || offersRes.data || []
      // Sadece bu vendor'a ait teklifler gösterilir — vendorId filtresi
      const myOffers = currentVendorId
        ? allOffers.filter((o: any) => o.fromVendorId === currentVendorId || o.toVendorId === currentVendorId)
        : allOffers
      metrics.value[1].value = String(myOffers.filter((o: any) => o.status === 'PENDING').length)
      recentTx.value = myOffers.slice(0, 5).map((offer: any) => ({
        rawId:    offer.id,
        id:       `#TRX-${offer.id.substring(0, 5).toUpperCase()}`,
        partner:  offer.toCompany?.name || offer.fromCompany?.name || 'Karşı Taraf',
        category: 'Ticari Takas',
        date:     new Date(offer.createdAt).toLocaleDateString('tr-TR'),
        value:    `${offer.cashAmount || 0}`,
        status:   offer.status === 'PENDING' ? 'BEKLEMEDE'
          : offer.status === 'ACCEPTED' ? 'KABUL EDİLDİ'
          : offer.status === 'COMPLETED' ? 'TAMAMLANDI'
          : offer.status === 'REJECTED' ? 'REDDEDİLDİ'
          : offer.status,
        statusClass: offer.status === 'COMPLETED' || offer.status === 'ACCEPTED'
          ? 'bg-green-50 text-green-700'
          : offer.status === 'REJECTED'
            ? 'bg-red-50 text-red-700'
            : 'bg-amber-50 text-amber-700',
      }))
    }

    // Barter info → havuz bakiyesi + XP metrikleri
    if (barterRes?.success && barterRes.data) {
      const info = barterRes.data
      const barterBal = Number(info.barterBalance ?? 0)
      const tier: string = (info.tier as string) || 'ELITE'
      const poolLimit = TIER_LIMITS[tier] ?? TIER_LIMITS.ELITE
      const barPct = poolLimit > 0 ? Math.min(100, Math.round((barterBal / poolLimit) * 100)) : 0
      const formattedBal   = new Intl.NumberFormat('tr-TR').format(barterBal)
      const formattedLimit = new Intl.NumberFormat('tr-TR').format(poolLimit)
      metrics.value[0].value  = `${formattedBal} TL`
      metrics.value[0].sub    = `Limit: ${formattedLimit} TL`
      metrics.value[0].barPct = barPct

      const commXP = Number(info.commissionXP ?? 0)
      metrics.value[3].value = `${new Intl.NumberFormat('tr-TR').format(commXP)} XP`
    }
  } catch {
    // Dashboard verisi yüklenemedi — metrikler sıfır gösterilecek
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>
