<script setup lang="ts">
import TtAccessBarrier from '~/components/ticaritakas/TtAccessBarrier.vue'

definePageMeta({ layout: 'default', hideSideAds: true })

const { $api } = useApi()
const authStore = useAuthStore()
const route = useRoute()
const opportunityId = route.params.id

const isVendor = computed(() => {
  return authStore.isAuthenticated && (authStore.user?.role === 'VENDOR' || authStore.user?.role === 'ADMIN' || authStore.user?.role === 'SUPER_ADMIN')
})

const loading = ref(true)
const error404 = ref(false)
const opportunity = ref<{
  id: string
  title: string
  code: string
  postedAt: string
  value: number
  partner: string
  status: string
  description: string
  specs: { label: string; value: string }[]
  images: string[]
  quantity: number
  unit: string
  city: string
  category: string
  materialType: string | null
  wantedCategories: string[]
  tradeModes: string[]
} | null>(null)

const safeNum = (v: unknown): number => {
  const n = Number(v)
  return isNaN(n) ? 0 : n
}

const fetchOpportunity = async () => {
  loading.value = true
  error404.value = false
  try {
    const res = await $api<{ success: boolean; data?: Record<string, unknown> }>(`/api/v1/surplus/${opportunityId}`)
    if (res.success && res.data) {
      const data = res.data
      
      // Image normalization logic
      let normalizedImages = ['/placeholder-image.jpg']
      if (Array.isArray(data.images) && data.images.length > 0) {
        normalizedImages = (data.images as string[]).map((img: string) => {
          if (img.startsWith('http') || img.startsWith('data:')) return img
          const cleanPath = img.startsWith('/') ? img : `/${img}`
          return cleanPath.startsWith('/uploads') ? cleanPath : `/uploads${cleanPath}`
        })
      }

      opportunity.value = {
        id: data.id as string,
        title: data.title as string,
        code: `TRX-${(data.id as string).substring(0, 8).toUpperCase()}`,
        postedAt: new Date(data.createdAt as string).toLocaleDateString('tr-TR'),
        value: safeNum(data.unitPrice),
        partner: (data.company as { name?: string })?.name || '-',
        status: (data.status as string) || 'PENDING_APPROVAL',
        description: (data.description as string) || 'Açıklama belirtilmemiş.',
        specs: [
          { label: 'Kategori', value: (data.category as string) || '-' },
          { label: 'Miktar', value: `${data.quantity || 0} ${(data.unit as string) || 'Birim'}` },
          { label: 'Şehir', value: (data.city as string) || '-' },
          { label: 'Statü', value: (data.status as string) || '-' },
          ...(data.materialType ? [{ label: 'Malzeme', value: data.materialType as string }] : []),
        ],
        images: normalizedImages,
        quantity: safeNum(data.quantity),
        unit: (data.unit as string) || '',
        city: (data.city as string) || '-',
        category: (data.category as string) || '-',
        materialType: (data.materialType as string) || null,
        wantedCategories: Array.isArray(data.wantedCategories) ? (data.wantedCategories as string[]) : [],
        tradeModes: Array.isArray(data.tradeModes) ? (data.tradeModes as string[]) : [],
      }
    }
  } catch (err: unknown) {
    if ((err as { status?: number })?.status === 404) error404.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOpportunity()
})
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-20">
    <TtAccessBarrier v-if="!isVendor" />
    <div :class="{ 'blur-md pointer-events-none': !isVendor }">
      <!-- Header Area -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button @click="useRouter().back()" class="p-2.5 bg-[#002444] text-white hover:bg-blue-900 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <nav class="flex items-center gap-2 text-sm">
            <span class="text-slate-400">Kurumsal Araçlar</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-slate-300"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span class="text-slate-400">Takas Havuzu</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3 h-3 text-slate-300"><polyline points="9 18 15 12 9 6"></polyline></svg>
            <span class="text-[#1A3A5C] font-bold">Fırsat Detayı</span>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-6 pt-10">
      <div v-if="loading" class="flex flex-col items-center justify-center py-32">
        <div class="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-slate-400 font-bold uppercase tracking-widest text-[10px]">İlan Detayları Yükleniyor...</p>
      </div>

      <div v-else-if="error404" class="max-w-xl mx-auto py-32 text-center bg-white rounded-[3rem] shadow-xl border border-slate-100 p-12">
        <div class="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <h2 class="text-3xl font-black text-[#002444] mb-4">İlan Bulunamadı</h2>
        <p class="text-slate-500 font-medium mb-10 leading-relaxed text-lg">Aradığınız ilan yayından kaldırılmış veya taşınmış olabilir. Lütfen takas havuzuna dönüp güncel ilanları inceleyin.</p>
        <NuxtLink to="/ticaritakas/trade-pool/all" class="inline-block px-10 py-5 bg-[#002444] text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:shadow-2xl transition-all active:scale-95">
          TAKAS HAVUZUNA DÖN
        </NuxtLink>
      </div>

      <div v-else-if="opportunity" class="grid grid-cols-12 gap-8">
        <!-- Sol Kolon: Galeri ve Detaylar -->
        <div class="col-span-12 lg:col-span-8 space-y-8">
          <!-- Başlık Alanı -->
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div class="flex items-center gap-3 mb-4">
              <span
                class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider italic"
                :class="{
                  'bg-green-100 text-green-700': opportunity.status === 'ACTIVE',
                  'bg-yellow-100 text-yellow-700': opportunity.status === 'PENDING_APPROVAL',
                  'bg-red-100 text-red-700': opportunity.status === 'REJECTED',
                  'bg-gray-100 text-gray-500': !['ACTIVE','PENDING_APPROVAL','REJECTED'].includes(opportunity.status),
                }"
              >
                {{ opportunity.status === 'ACTIVE' ? 'AKTİF' : opportunity.status === 'PENDING_APPROVAL' ? 'ONAY BEKLİYOR' : opportunity.status }}
              </span>
              <span class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                # {{ opportunity.code }}
              </span>
            </div>
            <h1 class="text-4xl font-black text-[#002444] mb-4 leading-tight">{{ opportunity.title }}</h1>
            <div class="flex flex-wrap items-center gap-6 text-slate-500 text-sm font-medium">
              <span class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                {{ opportunity.postedAt }} yayınlandı
              </span>
              <span class="flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                {{ opportunity.specs.find(s => s.label === 'Şehir')?.value || 'Türkiye' }}
              </span>
            </div>
          </div>

          <!-- Galeri -->
          <div class="bg-white rounded-3xl shadow-sm overflow-hidden border border-slate-100">
            <div class="aspect-video w-full bg-slate-100 relative group">
              <img :src="opportunity.images[0]" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" @error="(e: Event) => ((e.target as HTMLImageElement).src = '/placeholder-image.jpg')" />
              <div class="absolute bottom-6 right-6 bg-black/60 backdrop-blur-xl text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                {{ opportunity.images.length }} Fotoğraf
              </div>
            </div>
            <div class="p-4 flex gap-4 overflow-x-auto no-scrollbar">
              <div v-for="(img, idx) in opportunity.images" :key="idx" class="w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2" :class="idx === 0 ? 'border-blue-500' : 'border-transparent'">
                <img :src="img" class="w-full h-full object-cover" @error="(e: Event) => ((e.target as HTMLImageElement).src = '/placeholder-image.jpg')" />
              </div>
            </div>
          </div>

          <!-- Açıklama -->
          <div class="bg-white p-10 rounded-3xl shadow-sm border border-slate-100">
            <h3 class="text-xl font-black text-[#002444] mb-8 pb-4 border-b border-slate-50 flex items-center gap-3 italic">
              DETAYLI AÇIKLAMA
            </h3>
            <p class="text-slate-600 leading-relaxed text-lg mb-10 whitespace-pre-wrap">{{ opportunity.description }}</p>
            
            <div class="grid md:grid-cols-2 gap-10">
              <div>
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Öne Çıkan Bilgiler</h4>
                <div class="space-y-4">
                  <div v-for="spec in opportunity.specs" :key="spec.label" class="flex justify-between items-center py-3 border-b border-slate-50">
                    <span class="text-sm font-bold text-slate-500 uppercase tracking-widest text-[10px]">{{ spec.label }}</span>
                    <span class="text-sm font-black text-[#002444]">{{ spec.value }}</span>
                  </div>
                </div>
              </div>
              <div class="bg-blue-50/50 p-8 rounded-3xl border border-blue-100/50">
                <div class="flex items-center gap-3 mb-4">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span class="font-black text-blue-800 text-sm uppercase tracking-tight">Takas Talepleri</span>
                </div>
                <div v-if="opportunity.wantedCategories?.length" class="flex flex-wrap gap-2">
                  <span v-for="cat in opportunity.wantedCategories" :key="cat" class="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black">{{ cat }}</span>
                </div>
                <p v-else class="text-xs text-slate-400">Herhangi bir kategori belirtilmemiş.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ Kolon: Aksiyon Paneli -->
        <div class="col-span-12 lg:col-span-4 space-y-8">
          <!-- Trade Action -->
          <div class="bg-[#002444] rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-700" />
            <div class="relative z-10">
              <div class="flex justify-between items-start mb-8">
                <div>
                  <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">TAKAS DEĞERİ</span>
                  <div class="text-4xl font-black mt-2">{{ new Intl.NumberFormat('tr-TR').format(opportunity.value) }} <span class="text-lg opacity-40">TL</span></div>
                </div>
                <div class="bg-white/10 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md border border-white/10">B2B LİMİTİ</div>
              </div>

              <div class="space-y-4 mb-10 bg-white/5 p-6 rounded-2xl border border-white/5">
                <div class="flex justify-between text-xs items-center">
                  <span class="text-blue-300 font-bold uppercase tracking-widest text-[10px]">İşlem Komisyonu</span>
                  <span class="text-green-400 font-black text-[10px]">Üyelik seviyenize göre uygulanır</span>
                </div>
                <div class="flex justify-between text-xs items-center">
                  <span class="text-blue-300 font-bold uppercase tracking-widest text-[10px]">Takas Modu</span>
                  <span class="text-white font-black text-[10px]">{{ opportunity.tradeModes?.join(', ') || 'Belirtilmemiş' }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <NuxtLink 
                  :to="`/ticaritakas/trade-pool/offer/${opportunityId}`"
                  class="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  HEMEN TEKLİF VER
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </NuxtLink>
                <button @click="navigateTo('/ticaritakas/inbox')" class="w-full py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/10 active:scale-95">SATICIYA MESAJ GÖNDER</button>
              </div>
            </div>
          </div>

          <!-- Partner Card -->
          <div class="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
            <div class="px-8 py-6 bg-slate-50 border-b border-slate-100">
              <span class="text-[10px] font-black text-[#002444] uppercase tracking-widest italic">TAKAS PARTNERİ</span>
            </div>
            <div class="p-8">
              <div class="flex items-center gap-4 mb-8">
                <div class="w-14 h-14 bg-[#002444] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {{ opportunity.partner !== '-' ? opportunity.partner.charAt(0).toUpperCase() : '?' }}
                </div>
                <div>
                  <h4 class="font-black text-[#002444]">{{ opportunity.partner }}</h4>
                  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Kayıtlı Satıcı</span>
                </div>
              </div>
              <div class="bg-blue-50 p-5 rounded-2xl border border-blue-100 mb-8">
                <div class="flex items-center gap-2 mb-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-blue-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <span class="text-[10px] font-black text-blue-700 uppercase tracking-widest">BazarX Güvencesi</span>
                </div>
                <p class="text-[10px] text-slate-500 leading-relaxed">Bu ilan BazarX Kurumsal Denetim ekibi tarafından ön incelemeden geçirilmiştir.</p>
              </div>
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
