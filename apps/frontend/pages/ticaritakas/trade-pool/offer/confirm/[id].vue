<script setup lang="ts">
const { $api } = useApi()
const route = useRoute()
const router = useRouter()
const opportunityId = route.params.id

// Query params'dan gelen teklif verileri
const barterAmount = ref(Number(route.query.barter) || 0)
const cashAmount = ref(Number(route.query.cash) || 0)
const note = ref(String(route.query.note || ''))
const type = ref(String(route.query.type || 'HYBRID'))

interface SurplusData {
  id: string
  title: string
  description?: string
  unitPrice?: number
  images?: string[]
  company?: { id: string; name: string }
  image?: string
}

const loading = ref(true)
const opportunity = ref<SurplusData | null>(null)

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
    const res = await $api<SurplusData>(`/api/v1/surplus/${opportunityId}`)
    if (res.success && res.data) {
      opportunity.value = { ...res.data, image: resolveImage(res.data.images) }
    }
  } catch { /* hata filtresi tarafından işlenir */ } finally {
    loading.value = false
  }
}

const isSubmitting = ref(false)
const errorBanner = ref<{ code: string; message: string } | null>(null)

const confirmAndSubmit = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  errorBanner.value = null

  try {
    const res = await $api<{ success: boolean; data?: { id?: string } }>('/api/v1/offers', {
      method: 'POST',
      body: {
        surplusItemId: opportunityId,
        barterAmount:  barterAmount.value,
        cashAmount:    cashAmount.value,
        note:          note.value,
        type:          type.value,
      },
    })

    if (res.success) {
      router.push({
        path: '/ticaritakas/trade-pool/offer/success',
        query: {
          id:      `#TRX-${res.data?.id?.substring(0, 5).toUpperCase() ?? 'NEW'}`,
          partner: opportunity.value?.company?.name ?? 'Kurumsal Satıcı',
          amount:  new Intl.NumberFormat('tr-TR').format(barterAmount.value + cashAmount.value),
        },
      })
    }
  } catch (error: unknown) {
    // Master Plan v4.3 §4.5 — Ekosistem içi takas yasağı + §4.2 allowOnlineResale
    const err = error as { data?: { code?: string; message?: string }; message?: string }
    const code    = err?.data?.code
    const message = err?.data?.message ?? err?.message ?? 'Teklif onaylanırken bir hata oluştu.'
    if (code === 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM') {
      errorBanner.value = {
        code,
        message: 'Aynı ekosistemdeki bayilerle takas yapamazsınız. Lütfen BazarX Pazaryeri\'ne geçin.',
      }
    } else if (code === 'ONLINE_RESALE_NOT_ALLOWED') {
      errorBanner.value = {
        code,
        message: 'Bu fabrika ürünü çevrimiçi takasa açık değil. Üretici tarafından kapatılmıştır.',
      }
    } else {
      errorBanner.value = { code: code ?? 'UNKNOWN', message }
    }
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchOpportunity()
})

const commission = computed(() => (barterAmount.value + cashAmount.value) * 0.04)
const discountedCommission = computed(() => commission.value / 2)
</script>

<template>
  <div class="min-h-screen bg-[#F8FAFC] pb-20">
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
          <div>
            <nav class="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <span>Pazar Yeri</span>
              <span class="text-blue-500">Teklif Taslağı</span>
            </nav>
            <h1 class="text-lg font-black text-[#002444] leading-tight">Teklifinizi Gözden Geçirin</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full border border-green-100">
          <span class="text-xs font-bold text-green-700">Güvenilir Partner Modu Aktif</span>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto px-6 pt-10">
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="opportunity" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Sol Kolon: Detaylar -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Edinilecek Varlık -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div class="flex items-center justify-between mb-8">
              <h2 class="text-lg font-black text-[#002444] flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6 text-blue-500">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                  <line x1="8" y1="21" x2="16" y2="21"></line>
                  <line x1="12" y1="17" x2="12" y2="21"></line>
                </svg>
                Edinilecek Varlıklar
              </h2>
              <span class="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Takip No: #TT-{{ opportunityId.toString().substring(0,6).toUpperCase() }}</span>
            </div>

            <div class="flex flex-col md:flex-row gap-8 p-6 rounded-2xl bg-slate-50 border border-slate-100">
              <div class="w-full md:w-48 h-36 rounded-xl overflow-hidden shrink-0 shadow-inner bg-slate-200">
                <img :src="opportunity.image" class="w-full h-full object-cover" @error="(e: Event) => ((e.target as HTMLImageElement).src = '/placeholder-image.jpg')" />
              </div>
              <div class="flex-1">
                <div class="flex justify-between items-start">
                  <div>
                    <h3 class="font-black text-xl text-[#002444]">{{ opportunity.title }}</h3>
                    <p class="text-slate-500 text-sm mt-2 leading-relaxed">{{ opportunity.description?.substring(0, 100) }}...</p>
                  </div>
                  <div class="text-right">
                    <div class="text-2xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(opportunity.unitPrice) }} TL</div>
                    <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">LİSTE FİYATI</div>
                  </div>
                </div>
                <div class="mt-6 flex flex-wrap gap-2">
                  <span class="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Garanti: 2 Yıl</span>
                  <span class="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Lojistik: Dahil</span>
                  <span class="bg-blue-100/50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">Montaj: Ücretsiz</span>
                </div>
              </div>
            </div>

            <div class="mt-10">
              <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">SUNULAN TEKLİF DETAYI</h3>
              <div class="space-y-4">
                <div class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-200 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"></path><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"></path><path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"></path></svg>
                    </div>
                    <div>
                      <div class="font-black text-sm text-[#002444]">{{ type === 'HYBRID' ? 'Karma Teklif: Barter' : 'Barter Kredisi' }}</div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Genel Barter Havuzu Kullanımı</div>
                    </div>
                  </div>
                  <div class="text-right font-black text-lg text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(barterAmount) }} TL</div>
                </div>
                
                <div class="flex items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-emerald-200 transition-colors">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-6 h-6"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                    </div>
                    <div>
                      <div class="font-black text-sm text-[#002444]">Nakit Bakiyesi</div>
                      <div class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ticari Mevduat Hesabı Transferi</div>
                    </div>
                  </div>
                  <div class="text-right font-black text-lg text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(cashAmount) }} TL</div>
                </div>
              </div>
            </div>
          </div>

          <!-- XP Subsidy Card -->
          <div class="bg-[#002444] text-white rounded-[2.5rem] shadow-xl p-10 relative overflow-hidden group">
            <div class="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700"></div>
            <div class="relative z-10">
              <div class="flex items-center justify-between mb-10">
                <div class="flex items-center gap-4">
                  <div class="bg-amber-400 p-3 rounded-2xl shadow-lg shadow-amber-400/20 flex items-center justify-center text-amber-900">
                    <svg viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  </div>
                  <h2 class="text-xl font-black uppercase tracking-tight">XP Sübvansiyon Uygulaması</h2>
                </div>
                <div class="bg-green-500 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] animate-pulse">AKTİF</div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div class="text-center md:text-left">
                  <div class="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] mb-2">Standart Komisyon</div>
                  <div class="text-2xl font-black opacity-40 line-through">{{ new Intl.NumberFormat('tr-TR').format(commission) }} TL</div>
                  <div class="text-[10px] text-blue-400 font-bold mt-1">(İşlem Bedelinin %4'ü)</div>
                </div>
                <div class="flex justify-center">
                  <div class="flex flex-col items-center">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-amber-400 animate-pulse">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                    <div class="bg-white/10 px-4 py-1.5 rounded-full mt-4 border border-white/10 text-amber-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                      -{{ new Intl.NumberFormat('tr-TR').format(discountedCommission) }} XP Kullanıldı
                    </div>
                  </div>
                </div>
                <div class="text-center md:text-right">
                  <div class="text-[10px] text-blue-300 font-black uppercase tracking-[0.2em] mb-2">İndirimli Komisyon</div>
                  <div class="text-4xl font-black text-amber-400">{{ new Intl.NumberFormat('tr-TR').format(discountedCommission) }} TL</div>
                  <div class="text-[10px] text-blue-300 font-black mt-1">KOMİSYON İNDİRİMİ (%50)</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ Kolon: Özet & Aksiyon -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Finansal Özet -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h2 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">FİNANSAL ÖZET</h2>
            <div class="space-y-5">
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 font-medium">Barter Kredi Tutarı</span>
                <span class="font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(barterAmount) }} TL</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 font-medium">Nakit Bakiyesi</span>
                <span class="font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(cashAmount) }} TL</span>
              </div>
              <div class="flex justify-between items-center text-sm">
                <span class="text-slate-500 font-medium">İndirimli Komisyon Bedeli</span>
                <span class="font-black text-green-600">{{ new Intl.NumberFormat('tr-TR').format(discountedCommission) }} TL</span>
              </div>
              
              <div v-if="note" class="pt-5 border-t border-slate-50">
                <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-2">Ek Not</span>
                <p class="text-xs text-slate-500 italic leading-relaxed">"{{ note }}"</p>
              </div>

              <div class="h-px bg-slate-100 my-6"></div>
              <div class="flex justify-between items-end">
                <span class="text-[#002444] font-black text-xs uppercase tracking-widest">Toplam Teklif Değeri</span>
                <div class="text-right">
                  <div class="text-3xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(barterAmount + cashAmount) }} TL</div>
                  <div class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Vergiler Dahil</div>
                </div>
              </div>
            </div>
          </div>

          <!-- TrustScore Preview -->
          <div class="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div class="flex items-center gap-4 mb-6">
              <div class="w-14 h-14 rounded-full border-4 border-green-50 flex items-center justify-center text-green-600 font-black text-lg bg-green-50 shadow-inner">
                +2
              </div>
              <div>
                <p class="text-xs text-slate-500 font-medium">İşlem başarıyla tamamlandığında.</p>
              </div>
            </div>
            <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full w-[85%] rounded-full shadow-sm"></div>
            </div>
            <div class="flex justify-between mt-3">
              <span class="text-[10px] font-black text-green-600 uppercase tracking-widest">Potansiyel: 84</span>
            </div>
          </div>

          <!-- Legal Checklist -->
          <div class="bg-white rounded-3xl border border-slate-200 p-8 space-y-6">
            <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">YASAL ONAYLAR</h3>
            <div class="space-y-4">
              <label class="flex gap-4 cursor-pointer group items-start">
                <input type="checkbox" checked class="w-5 h-5 rounded border-slate-300 text-[#002444] focus:ring-[#002444] mt-0.5" />
                <span class="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-[#002444] transition-colors">
                  Üyelik ve İşlem Sözleşmesini okudum, şartları kabul ediyorum.
                </span>
              </label>
              <label class="flex gap-4 cursor-pointer group items-start">
                <input type="checkbox" checked class="w-5 h-5 rounded border-slate-300 text-[#002444] focus:ring-[#002444] mt-0.5" />
                <span class="text-xs text-slate-600 font-medium leading-relaxed group-hover:text-[#002444] transition-colors">
                  <b>Watchtower</b> Kayıtlı Denetim Modu kapsamındaki veri paylaşımını onaylıyorum.
                </span>
              </label>
            </div>
          </div>

          <!-- Master Plan §4.5 — Ekosistem içi takas yasağı uyarı bandı -->
          <div
            v-if="errorBanner"
            class="rounded-2xl border-2 px-5 py-4 mb-4"
            :class="errorBanner.code === 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM'
              ? 'bg-amber-50 border-amber-300 text-amber-900'
              : errorBanner.code === 'ONLINE_RESALE_NOT_ALLOWED'
              ? 'bg-blue-50 border-blue-300 text-blue-900'
              : 'bg-red-50 border-red-300 text-red-900'"
          >
            <div class="flex items-start gap-3">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="w-5 h-5 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <div class="flex-1">
                <div class="font-black uppercase tracking-wide text-xs mb-1">{{ errorBanner.code }}</div>
                <div class="text-sm font-medium leading-relaxed">{{ errorBanner.message }}</div>
                <NuxtLink
                  v-if="errorBanner.code === 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM'"
                  to="/marketplace"
                  class="inline-flex items-center gap-1 mt-2 text-xs font-bold underline hover:no-underline"
                >
                  BazarX Pazaryeri'ne git →
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Action Button -->
          <div class="space-y-4">
            <button
              @click="confirmAndSubmit"
              :disabled="isSubmitting || errorBanner?.code === 'BARTER_NOT_ALLOWED_IN_ECOSYSTEM' || errorBanner?.code === 'ONLINE_RESALE_NOT_ALLOWED'"
              class="w-full bg-[#002444] text-white py-6 rounded-[1.5rem] font-black text-lg shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase tracking-widest"
            >
              <template v-if="isSubmitting">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                İŞLENİYOR...
              </template>
              <template v-else>
                Teklifi Resmiyetle Gönder
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 ml-2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </template>
            </button>
            <p class="text-center text-[10px] text-slate-400 px-6 font-bold uppercase tracking-widest leading-relaxed">
              GÖNDER BUTONUNA BASILDIĞINDA TEKLİF DİJİTAL OLARAK İMZALANIR VE KARŞI TARAFA İLETİLİR.
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.animate-in {
  animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
