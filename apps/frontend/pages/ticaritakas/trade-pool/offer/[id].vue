<script setup lang="ts">
import TtAccessBarrier from '~/components/ticaritakas/TtAccessBarrier.vue'

const authStore = useAuthStore()
const isVendor = computed(() => {
  return authStore.isAuthenticated && (authStore.user?.role === 'VENDOR' || authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN')
})

const { $api } = useApi()
const route = useRoute()
const router = useRouter()
const opportunityId = route.params.id

interface OpportunityData {
  title: string
  listingCompany: string
  value: number
  image: string
  city: string
}

// State
const loading = ref(true)
const xpBalance = ref(0)
const opportunity = ref<OpportunityData>({
  title: 'Yükleniyor...',
  listingCompany: '...',
  value: 0,
  image: '/placeholder-image.jpg',
  city: '',
})

const offerType = ref('hybrid')
const barterAmount = ref(0)
const cashAmount = ref(0)
const xpEnabled = ref(true)
const note = ref('')

const resolveImage = (images: string[] | undefined): string => {
  if (!Array.isArray(images) || images.length === 0) return '/placeholder-image.jpg'
  const img = images[0]
  if (img.startsWith('http') || img.startsWith('data:')) return img
  const clean = img.startsWith('/') ? img : `/${img}`
  return clean.startsWith('/uploads') ? clean : `/uploads${clean}`
}

const fetchOpportunity = async (): Promise<void> => {
  loading.value = true
  try {
    const [surplusRes, barterRes] = await Promise.all([
      $api<{ success: boolean; data: Record<string, unknown> }>(`/api/v1/surplus/${opportunityId}`),
      $api<{ success: boolean; data: { commissionXP?: string } }>('/api/v1/barter/info').catch(() => null),
    ])

    if (surplusRes.success && surplusRes.data) {
      const d = surplusRes.data
      opportunity.value = {
        title:          String(d.title ?? ''),
        listingCompany: (d.company as { name?: string })?.name ?? 'Kurumsal Satıcı',
        value:          Number(d.unitPrice ?? 0),
        image:          resolveImage(d.images as string[] | undefined),
        city:           String(d.city ?? ''),
      }
      barterAmount.value = Math.round(opportunity.value.value * 0.6)
      cashAmount.value   = opportunity.value.value - barterAmount.value
    }

    if (barterRes?.success && barterRes.data) {
      xpBalance.value = Number(barterRes.data.commissionXP ?? 0)
    }
  } catch { /* hata filtresi tarafından işlenir */ } finally {
    loading.value = false
  }
}

const commission = computed(() => {
  const total = barterAmount.value + cashAmount.value
  const base = total * 0.04
  return xpEnabled.value ? base / 2 : base
})

const goToConfirmation = () => {
  router.push({
    path: `/ticaritakas/trade-pool/offer/confirm/${opportunityId}`,
    query: {
      barter: barterAmount.value,
      cash: cashAmount.value,
      note: note.value,
      type: offerType.value.toUpperCase()
    }
  })
}

onMounted(() => {
  fetchOpportunity()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <TtAccessBarrier v-if="!isVendor" />
    <div :class="{ 'blur-md pointer-events-none': !isVendor }">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="router.back()" class="p-2.5 bg-[#002444] text-white hover:bg-blue-900 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 class="text-xl font-black text-[#002444]">Hemen Teklif Ver</h1>
        </div>
        <!-- TrustScore Mini -->
        <div class="flex items-center gap-4 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200">
          <div class="flex flex-col text-right">
            <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">GÜVEN SKORUNUZ</span>
            <span class="text-xs font-black text-green-600 uppercase">Yüksek Güvenilirlik</span>
          </div>
          <div class="w-8 h-8 rounded-full border-2 border-green-500 flex items-center justify-center text-[10px] font-black text-green-700 bg-white shadow-inner">—</div>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 pt-10">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-xs">Veriler Hazırlanıyor...</p>
      </div>

      <div v-else class="grid grid-cols-12 gap-8 animate-in">
        <!-- Sol: Teklif Formu -->
        <div class="col-span-12 lg:col-span-8 space-y-8">
          <!-- Hedef Ürün Kartı -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col md:flex-row">
            <div class="md:w-1/3 aspect-video md:aspect-square relative overflow-hidden bg-slate-100">
              <img :src="opportunity.image" class="w-full h-full object-cover" @error="(e: Event) => ((e.target as HTMLImageElement).src = '/placeholder-image.jpg')" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
            <div class="p-8 md:w-2/3 flex flex-col justify-center">
              <div class="flex justify-between items-start mb-2">
                <span class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] italic">LİSTELEYEN: {{ opportunity.listingCompany }}</span>
                <span class="text-2xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(opportunity.value) }} TL</span>
              </div>
              <h3 class="text-xl font-black text-[#002444] mb-4">{{ opportunity.title }}</h3>
              <div class="flex gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span v-if="opportunity.city" class="flex items-center gap-1">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-blue-500">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  {{ opportunity.city }}, TR
                </span>
                <span class="flex items-center gap-1 text-green-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  Denetlendi
                </span>
              </div>
            </div>
          </div>

          <!-- Teklif Yapılandırma -->
          <div class="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h2 class="text-xl font-black text-[#002444] mb-10 flex items-center gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7 text-blue-500">
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <line x1="2" y1="10" x2="22" y2="10"></line>
              </svg>
              Teklifinizi Yapılandırın
            </h2>

            <div class="grid grid-cols-3 gap-4 mb-10">
              <button 
                v-for="type in [{id:'barter', label: 'Barter Kredisi', icon: 'wallet'}, {id:'hybrid', label: 'Karma Teklif', icon: 'layers'}, {id:'swap', label: 'Ürün Takası', icon: 'package'}]"
                :key="type.id"
                @click="offerType = type.id"
                class="flex flex-col items-center gap-3 p-6 rounded-3xl border-2 transition-all group"
                :class="offerType === type.id ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200'"
              >
                <div class="w-10 h-10 flex items-center justify-center">
                  <svg v-if="type.icon === 'wallet'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                  <svg v-if="type.icon === 'layers'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
                  <svg v-if="type.icon === 'package'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                </div>
                <span class="text-[10px] font-black uppercase tracking-widest">{{ type.label }}</span>
              </button>
            </div>

            <div class="grid md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">BARTER KREDİ TUTARI</label>
                <div class="relative">
                  <input v-model="barterAmount" type="number" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[#002444] font-black focus:border-blue-500 focus:bg-white transition-all outline-none" />
                  <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">TL</span>
                </div>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NAKİT TUTARI</label>
                <div class="relative">
                  <input v-model="cashAmount" type="number" class="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[#002444] font-black focus:border-blue-500 focus:bg-white transition-all outline-none" />
                  <span class="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">TL</span>
                </div>
              </div>
            </div>

            <div class="mt-8 space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TEKLİF NOTU (OPSİYONEL)</label>
              <textarea v-model="note" rows="3" placeholder="Satıcıya eklemek istediğiniz notu yazın..." class="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50 text-[#002444] font-medium focus:border-blue-500 focus:bg-white transition-all outline-none resize-none"></textarea>
            </div>

            <div v-if="offerType === 'swap'" class="mt-10 p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center group cursor-pointer hover:bg-slate-100 transition-all">
              <div class="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-slate-400">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </div>
              <span class="text-xs font-black text-slate-500 uppercase tracking-widest">Envanterden Ürün Seç</span>
              <p class="text-[10px] text-slate-400 mt-2">Takas etmek istediğiniz kurumsal varlıkları ekleyin.</p>
            </div>
          </div>
        </div>

        <!-- Sağ: Özet ve Onay -->
        <div class="col-span-12 lg:col-span-4 space-y-8">
          <!-- XP Subsidy -->
          <div class="bg-gradient-to-br from-amber-400 to-amber-500 p-8 rounded-[2.5rem] shadow-xl text-amber-900 relative overflow-hidden group">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform" />
            <div class="relative z-10">
              <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                  <span class="font-black text-sm uppercase tracking-widest">XP SÜBVANSİYONU</span>
                </div>
                <button @click="xpEnabled = !xpEnabled" class="w-12 h-6 rounded-full relative transition-colors" :class="xpEnabled ? 'bg-amber-900' : 'bg-amber-900/20'">
                  <div class="absolute top-1 w-4 h-4 bg-white rounded-full transition-all" :class="xpEnabled ? 'right-1' : 'left-1'" />
                </button>
              </div>
              <p class="text-xs font-bold leading-relaxed mb-6 opacity-80">XP puanlarınızı kullanarak işlem komisyonunu %50 indirimli ödeyin.</p>
              <div class="bg-white/20 p-4 rounded-2xl flex justify-between items-center backdrop-blur-md">
                <span class="text-[9px] font-black uppercase">KULLANILABİLİR XP</span>
                <span class="text-sm font-black">{{ new Intl.NumberFormat('tr-TR').format(xpBalance) }} XP</span>
              </div>
            </div>
          </div>

          <!-- Teklif Özeti -->
          <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="p-8 bg-[#002444] text-white">
              <h3 class="text-xs font-black uppercase tracking-[0.3em] opacity-60">TEKLİF ÖZETİ</h3>
            </div>
            <div class="p-8 space-y-6">
              <div class="flex justify-between text-sm">
                <span class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">TAKAS DEĞERİ</span>
                <span class="font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(barterAmount + cashAmount) }} TL</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">KOMİSYON (%4)</span>
                <span class="font-bold" :class="xpEnabled ? 'line-through text-red-400' : 'text-[#002444]'">{{ new Intl.NumberFormat('tr-TR').format((barterAmount + cashAmount) * 0.04) }} TL</span>
              </div>
              <div v-if="xpEnabled" class="flex justify-between text-sm text-green-600">
                <span class="font-bold uppercase tracking-widest text-[10px]">XP İNDİRİMİ (%50)</span>
                <span class="font-black">-{{ new Intl.NumberFormat('tr-TR').format(((barterAmount + cashAmount) * 0.04) / 2) }} TL</span>
              </div>
              
              <div class="pt-6 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">TOPLAM KOMİSYON</span>
                  <div class="text-3xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(commission) }} TL</div>
                </div>
                <span class="text-[9px] font-black px-2 py-1 bg-slate-100 text-slate-500 rounded uppercase tracking-widest italic">Net 15 Gün</span>
              </div>

              <button 
                @click="goToConfirmation"
                class="w-full py-5 bg-[#002444] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-900/40 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                TEKLİFİ GÖZDEN GEÇİR
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>

          <!-- Güven Danışmanı -->
          <div class="p-6 rounded-[2rem] bg-green-50 border-2 border-green-100 flex gap-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-green-600 shrink-0 mt-1">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <p class="text-xs font-black text-green-800 uppercase tracking-widest mb-1">GÜVEN DANIŞMANI</p>
              <p class="text-[10px] font-medium text-green-700 leading-relaxed opacity-80">
                Bu kullanıcının %98 tamamlama oranı vardır. Teklifiniz, tercih ettikleri 60:40 barter oranına uygundur. 
                <span class="font-black underline">Başarı olasılığı: Yüksek.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
    </div>
  </div>
</template>

<style scoped>
.animate-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
