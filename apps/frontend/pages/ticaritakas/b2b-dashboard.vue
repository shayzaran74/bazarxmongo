<template>
  <AccessGuard :requiresAuth="true" :requiresVendor="true">
    <div class="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      <B2BSidebar 
        :pendingOrderCount="0"
        :fullName="authStore.fullName"
        :userEmail="authStore.user?.email"
        :avatarUrl="authStore.user?.avatar"
        @logout="authStore.logout()"
      />

      <div class="flex-1 flex flex-col min-h-0 overflow-hidden">
      <!-- Top Navigation / Header -->
      <header class="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 flex-shrink-0">
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

      <!-- Main Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[#F8FAFC]">
        <div class="max-w-[1400px] mx-auto space-y-8">
          
          <!-- Hero Section -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div class="lg:col-span-7 space-y-4">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span class="text-[10px] font-black uppercase tracking-widest">Elite Kurumsal Üyelik</span>
              </div>
              <h2 class="text-[44px] leading-[1.1] font-black text-md3-primary tracking-tightest">
                Stratejik Takas ile <br/>
                <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Nakit Akışınızı</span> Güçlendirin.
              </h2>
              <p class="text-slate-500 text-lg font-medium max-w-xl">
                Atıl stoklarınızı ve kapasitenizi değerlendirin, ihtiyacınız olan ürün ve hizmetlere nakit harcamadan ulaşın.
              </p>
              <div class="flex gap-4 pt-4">
                <NuxtLink to="/ticaritakas/inbox" class="px-8 py-4 bg-md3-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
                  YENİ İLAN OLUŞTUR
                </NuxtLink>
                <NuxtLink to="/ticaritakas/trade-pool/all" class="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">
                  HAVUZU İNCELE
                </NuxtLink>
              </div>
            </div>

            <!-- Stats Grid -->
            <div class="lg:col-span-5 grid grid-cols-2 gap-4">
              <div 
                v-for="(stat, i) in metrics" 
                :key="i"
                class="p-6 bg-white rounded-3xl shadow-ambient border border-slate-50 hover:border-blue-100 transition-colors group"
              >
                <div class="flex justify-between items-start mb-4">
                  <div class="p-2 rounded-xl" :class="stat.color">
                    <Icon :name="stat.icon" size="20" :class="stat.iconColor" />
                  </div>
                  <span class="text-[10px] font-black text-slate-300 group-hover:text-blue-200 transition-colors uppercase">Canlı</span>
                </div>
                <h3 class="text-2xl font-black text-md3-primary tracking-tighter">{{ stat.value }}</h3>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{{ stat.label }}</p>
                
                <div v-if="stat.bar" class="mt-4 space-y-2">
                  <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-1000" :style="`width: ${stat.barPct}%`" />
                  </div>
                  <p class="text-[9px] font-bold text-slate-500">{{ stat.sub }}</p>
                </div>
                <p v-else class="mt-4 text-[9px] font-bold text-blue-500 italic">{{ stat.sub }}</p>
              </div>
            </div>
          </div>

          <!-- Mid Section -->
          <div 
            v-motion
            :initial="{ opacity: 0, y: 28, filter: 'blur(12px)' }"
            :visible-once="{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 700, delay: 100, ease: [0.25, 0.46, 0.45, 0.94] } }"
            class="grid grid-cols-1 lg:grid-cols-12 gap-6"
          >
            <!-- Active Trade Opportunities -->
            <div class="lg:col-span-8 bg-white rounded-xl shadow-ambient">
              <div class="p-6 border-b border-slate-100 flex justify-between items-center">
                <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Aktif Takas Fırsatları</h4>
                <NuxtLink to="/ticaritakas/trade-pool/all" class="text-sm font-bold text-primary-600 hover:underline">Tümünü Gör</NuxtLink>
              </div>
              <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div
                  v-for="(opp, index) in opportunities"
                  :key="index"
                  class="p-4 border border-slate-100 rounded-xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer group relative overflow-hidden"
                  @click="navigateTo(`/ticaritakas/trade-pool/${opp.id}`)"
                >
                  <div class="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full -mr-8 -mt-8 group-hover:bg-blue-500/10 transition-colors" />
                  
                  <div class="flex gap-4 relative z-10">
                    <div class="h-20 w-20 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform">
                      <img v-if="opp.image" :src="opp.image" class="w-full h-full object-cover" />
                      <Icon v-else :name="opp.icon" size="32" class="text-blue-500/50 group-hover:text-blue-500" />
                    </div>
                    <div class="flex-1">
                      <div class="flex justify-between items-start">
                        <p class="font-black text-sm text-[#002444] group-hover:text-blue-600 transition-colors">{{ opp.title }}</p>
                        <span class="bg-blue-50 text-blue-700 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">{{ opp.category }}</span>
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

            <!-- Right Panel -->
            <div class="lg:col-span-4 space-y-6">
              <!-- XP Subsidy Manager -->
              <div class="bg-white p-6 rounded-xl shadow-ambient">
                <div class="flex items-center gap-3 mb-5">
                  <div class="p-2 bg-tertiary-fixed rounded-lg text-on-tertiary-fixed-variant">
                    <Icon name="heroicons:shield-check" size="24" class="text-blue-400" />
                  </div>
                  <h4 class="font-bold text-md3-primary">XP Teşvik Paneli</h4>
                </div>
                <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p class="text-sm font-bold text-primary-container">Otomatik Teşvik</p>
                    <p class="text-[10px] text-slate-500 mt-0.5">%50 komisyon indirimi aktif</p>
                  </div>
                  <div class="w-11 h-6 bg-md3-secondary rounded-full relative cursor-pointer">
                    <div class="absolute top-[2px] right-[2px] w-5 h-5 bg-white rounded-full shadow" />
                  </div>
                </div>
                <div class="mt-5">
                  <p class="text-xs text-slate-500 mb-2">Aktif Çarpanlar:</p>
                  <div class="flex gap-2 flex-wrap">
                    <span class="px-2 py-1 bg-tertiary-fixed/30 text-on-tertiary-fixed-variant text-[10px] font-black rounded border border-tertiary-fixed">x1.5 BÜYÜME</span>
                    <span class="px-2 py-1 bg-secondary-container/30 text-on-secondary-fixed-variant text-[10px] font-black rounded border border-secondary-container">x2.0 SADAKAT</span>
                  </div>
                </div>
              </div>

              <!-- Compliance Watchtower -->
              <div class="bg-primary-container p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div class="absolute -right-4 -bottom-4 opacity-10">
                  <Icon name="heroicons:shield-check" size="24" class="text-blue-400" />
                </div>
                <div class="relative z-10">
                  <h4 class="text-on-primary font-bold mb-4 flex items-center gap-2">
                    <Icon name="heroicons:shield-check" size="24" class="text-blue-400" />
                    Uyumluluk Merkezi
                  </h4>
                  <div class="p-4 bg-white/10 rounded-lg border border-white/10">
                    <div class="flex items-center justify-between">
                      <span class="text-xs text-white/70">Mevcut Durum:</span>
                      <span class="text-xs font-black text-secondary-fixed-dim uppercase tracking-widest">Sistem Güvenli</span>
                    </div>
                    <div class="mt-3 flex gap-1">
                      <div v-for="i in 4" :key="i" class="h-1 flex-1 bg-secondary-fixed-dim rounded-full" />
                    </div>
                  </div>
                  <button class="w-full mt-4 py-2 bg-white/10 hover:bg-white/20 text-on-primary text-xs font-bold rounded-lg transition-colors border border-white/20" type="button">
                    DENETİMİ ÇALIŞTIR
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Transactions Table -->
          <div class="lg:col-span-12 bg-white rounded-xl shadow-ambient overflow-hidden">
            <div class="p-6 border-b border-slate-100 flex justify-between items-center">
              <h4 class="text-[20px] leading-[28px] font-semibold text-md3-primary">Son İşlemler</h4>
              <NuxtLink to="/barterborsa/islem-gecmisi" class="text-sm font-bold text-primary-600 hover:underline">Tümünü Gör</NuxtLink>
            </div>
            <div class="overflow-x-auto">
              <table class="w-full text-left">
                <thead class="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">İşlem No</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Karşı Taraf</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Kategori</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Tarih</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Değer (TL)</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Durum</th>
                    <th class="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr v-for="tx in recentTx" :key="tx.id" class="hover:bg-slate-50 transition-colors group">
                    <td class="px-6 py-4 text-sm font-medium text-slate-900">{{ tx.id }}</td>
                    <td class="px-6 py-4 text-sm text-slate-600 font-bold">{{ tx.partner }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500 italic">{{ tx.category }}</td>
                    <td class="px-6 py-4 text-sm text-slate-500">{{ tx.date }}</td>
                    <td class="px-6 py-4 text-sm font-black text-md3-primary">{{ tx.value }}</td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider" :class="tx.statusClass">{{ tx.status }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <NuxtLink v-if="tx.status === 'BEKLEMEDE'" :to="`/ticaritakas/trade-pool/offer/counter/${tx.rawId}`" class="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all border border-blue-100">
                          KARŞI TEKLİF
                        </NuxtLink>
                        <NuxtLink :to="`/ticaritakas/trade-pool/offer/detail/${tx.rawId}`" class="p-1.5 hover:bg-slate-200 rounded-lg transition-colors text-slate-400" title="Teklif Detayı">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </NuxtLink>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  </AccessGuard>
</template>

<script setup lang="ts">
import B2BSidebar from '~/components/layout/vendor/VendorSidebar.vue'
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

const metrics = ref([
  { label: 'TAKAS HAVUZU BAKİYESİ', value: '0 TL', icon: 'account_balance_wallet', color: 'bg-primary-container', iconColor: 'text-blue-600', bar: true, barPct: 0, sub: 'Limit: 1,500,000 TL' },
  { label: 'BEKLEYEN TEKLİFLER', value: '0', icon: 'stars', color: 'bg-tertiary-container', iconColor: 'text-tertiary-container', sub: 'İşlem bekleniyor' },
  { label: 'AKTİF İLANLAR', value: '0', icon: 'gavel', color: 'bg-primary-container', iconColor: 'text-primary-container', sub: 'Takas havuzunda' },
  { label: 'TASARRUF EDİLEN KOMİSYON', value: '0 TL', icon: 'savings', color: 'bg-secondary-container', iconColor: 'text-md3-secondary', sub: 'XP çarpanları ile' },
])

const opportunities = ref<any[]>([])
const recentTx = ref<any[]>([])

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const compRes = await $api<any>('/api/v1/companies/me')
    if (compRes.success && (compRes.data || (compRes as any).company)) {
      myCompany.value = compRes.data || (compRes as any).company || null
    }

    const [surplusRes, offersRes] = await Promise.all([
      $api<any>('/api/v1/surplus', { query: { limit: 4 } }),
      $api<any>('/api/v1/offers/my'),
    ])

    if (surplusRes.success) {
      const items = (surplusRes as any).items || surplusRes.data || []
      opportunities.value = items.slice(0, 4).map((item: any) => ({
        id: item.id,
        title: item.title,
        category: item.category || 'Genel',
        desc: item.description || 'Açıklama bulunmuyor.',
        value: `${item.unitPrice || 0} TL`,
        image: Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null,
        icon: 'inventory_2'
      }))
      metrics.value[2].value = String(surplusRes.meta?.total || items.length)
    }

    if (offersRes.success) {
      const allOffers = (offersRes as any).offers || offersRes.data || []
      recentTx.value = allOffers.slice(0, 5).map((offer: any) => ({
        rawId: offer.id,
        surplusId: offer.surplusItemId,
        id: `#TRX-${offer.id.substring(0, 5).toUpperCase()}`,
        partner: offer.toCompany?.name || offer.fromCompany?.name || 'Karşı Taraf',
        category: 'Ticari Takas',
        date: new Date(offer.createdAt).toLocaleDateString('tr-TR'),
        value: `${offer.cashAmount || 0}`,
        status: offer.status === 'PENDING' ? 'BEKLEMEDE' : offer.status,
        statusClass: offer.status === 'COMPLETED' || offer.status === 'ACCEPTED' 
          ? 'bg-secondary-container text-on-secondary-fixed-variant' 
          : 'bg-tertiary-fixed text-on-tertiary-fixed-variant'
      }))
      metrics.value[1].value = String(allOffers.filter((o: any) => o.status === 'PENDING').length)
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
