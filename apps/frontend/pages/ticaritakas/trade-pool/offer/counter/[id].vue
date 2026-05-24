<script setup lang="ts">
const { $api } = useApi()
const route = useRoute()
const router = useRouter()
const originalOfferId = route.params.id

interface OfferData {
  id: string
  cashAmount?: number
  offeredItems?: { estimatedValue?: number }[]
  fromCompany?: { id: string; name: string }
  toCompany?: { id: string; name: string }
  status?: string
}

const toast = useNuxtApp().$toast as { error: (msg: string) => void; success: (msg: string) => void }

const loading = ref(true)
const originalOffer = ref<OfferData | null>(null)

// Form State — bugün + 14 gün
const defaultDelivery = new Date(Date.now() + 14 * 86_400_000).toISOString().split('T')[0]
const barterRatio   = ref(66)
const totalAmount   = ref(0)
const deliveryDate  = ref(defaultDelivery)
const warrantyMonth = ref('24 Ay')
const xpEnabled     = ref(true)
const note          = ref('')

const barterAmount = computed((): number => (totalAmount.value * barterRatio.value) / 100)
const cashAmount   = computed((): number => totalAmount.value - barterAmount.value)

const originalItemsTotal = computed(() => {
  if (!originalOffer.value?.offeredItems) return 0
  return originalOffer.value.offeredItems.reduce((acc: number, i: any) => acc + Number(i.estimatedValue ?? 0), 0)
})

const originalBarterRatio = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((originalItemsTotal.value / totalAmount.value) * 100)
})

const originalCashRatio = computed(() => {
  if (totalAmount.value === 0) return 0
  return Math.round((Number(originalOffer.value?.cashAmount ?? 0) / totalAmount.value) * 100)
})

const fetchOffer = async (): Promise<void> => {
  loading.value = true
  try {
    const res = await $api<OfferData>(`/api/v1/offers/${originalOfferId}`)
    if (res.success && res.data) {
      originalOffer.value = res.data
      const itemsTotal = res.data.offeredItems?.reduce(
        (acc: number, i: any) => acc + Number(i.estimatedValue ?? 0), 0,
      ) ?? 0
      const cAmount = Number(res.data.cashAmount ?? 0)
      totalAmount.value = cAmount + itemsTotal
      if (totalAmount.value > 0) {
        barterRatio.value = Math.round((itemsTotal / totalAmount.value) * 100)
      }
    }
  } catch { /* hata filtresi tarafından işlenir */ } finally {
    loading.value = false
  }
}

const isSubmitting = ref(false)
const submitCounterOffer = async (): Promise<void> => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    const res = await $api<{ success: boolean }>(`/api/v1/offers/${originalOfferId}/counter`, {
      method: 'POST',
      body: {
        barterAmount:  barterAmount.value,
        cashAmount:    cashAmount.value,
        deliveryDate:  deliveryDate.value,
        warranty:      warrantyMonth.value,
        xpEnabled:     xpEnabled.value,
        note:          note.value,
      },
    })
    if (res.success) {
      router.push({
        path: '/ticaritakas/trade-pool/offer/counter/success',
        query: {
          partner: originalOffer.value?.fromCompany?.name ?? 'Karşı Taraf',
          amount:  new Intl.NumberFormat('tr-TR').format(totalAmount.value),
          ratio:   `%${barterRatio.value} / %${100 - barterRatio.value}`,
        },
      })
    }
  } catch (error: unknown) {
    const msg = (error as { data?: { message?: string } })?.data?.message ?? 'Karşı teklif gönderilirken bir hata oluştu.'
    toast.error(msg)
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  fetchOffer()
})
</script>

<template>
  <div class="min-h-screen bg-[#F8F9FA] pb-20">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200 sticky top-0 z-50 h-16 flex items-center px-6 justify-between shadow-sm">
      <div class="flex items-center gap-8">
        <h1 class="text-xl font-black text-[#002444] tracking-tight">TicariTakas</h1>
        <nav class="hidden md:flex gap-6 items-center text-sm font-bold text-slate-400">
          <a href="#" class="hover:text-[#002444] transition-colors uppercase tracking-widest">Panel</a>
          <a href="#" class="text-[#002444] border-b-2 border-[#002444] pb-1 uppercase tracking-widest">Teklifler</a>
          <a href="#" class="hover:text-[#002444] transition-colors uppercase tracking-widest">Barter Havuzu</a>
        </nav>
      </div>
      <div class="flex items-center gap-4">
        <button class="p-2 rounded-full hover:bg-slate-50 text-slate-400">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
        </button>
        <button class="bg-[#002444] text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">Yeni İlan</button>
      </div>
    </header>

    <main class="max-w-[1280px] mx-auto px-6 py-10">
      <div v-if="loading && !originalOffer" class="flex justify-center py-20">
        <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else class="flex flex-col lg:flex-row gap-10">
        <!-- Sol Kolon: Form -->
        <div class="flex-1 space-y-8">
          <div class="space-y-2">
            <h2 class="text-3xl font-black text-[#002444]">Karşı Teklifini Yapılandır</h2>
            <p class="text-slate-500 font-medium">Ticari şartları optimize ederek anlaşma şansınızı artırın.</p>
          </div>

          <!-- Configuration Card -->
          <div class="bg-white border border-slate-100 rounded-3xl p-10 shadow-[0_10px_30px_-5px_rgba(26,58,92,0.08)] space-y-10">
            <!-- Slider Area -->
            <div class="space-y-8">
              <div class="flex justify-between items-end">
                <label class="text-lg font-black text-[#002444]">Barter / Nakit Oranı</label>
                <span class="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Toplam: {{ new Intl.NumberFormat('tr-TR').format(totalAmount) }} TL</span>
              </div>
              <div class="relative pt-6 px-4">
                <input 
                  type="range" 
                  v-model="barterRatio"
                  min="0" max="100"
                  class="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#002444]"
                />
                <div class="flex justify-between mt-6 text-sm font-medium">
                  <div class="text-center">
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Barter</p>
                    <p class="text-xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(barterAmount) }} TL</p>
                    <p class="text-xs text-green-600 font-bold uppercase mt-1">%{{ barterRatio }}</p>
                  </div>
                  <div class="text-center">
                    <p class="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Nakit</p>
                    <p class="text-xl font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(cashAmount) }} TL</p>
                    <p class="text-xs text-amber-600 font-bold uppercase mt-1">%{{ 100 - barterRatio }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">TESLİMAT TARİHİ</label>
                <div class="relative group">
                  <input 
                    type="date" 
                    v-model="deliveryDate"
                    class="w-full border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/5 focus:border-[#002444] outline-none transition-all font-bold text-sm"
                  />
                  <div class="absolute right-5 top-4 text-slate-300 group-focus-within:text-[#002444] pointer-events-none">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">GARANTİ SÜRESİ</label>
                <select v-model="warrantyMonth" class="w-full border border-slate-100 rounded-2xl px-5 py-4 focus:ring-4 focus:ring-blue-500/5 focus:border-[#002444] outline-none bg-white font-bold text-sm">
                  <option>12 Ay</option>
                  <option>24 Ay</option>
                  <option>36 Ay</option>
                  <option>Yok</option>
                </select>
              </div>
            </div>

            <!-- XP Subsidy -->
            <div class="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="bg-[#002444] text-white p-2.5 rounded-xl shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
                </div>
                <div>
                  <p class="font-black text-[#002444] text-sm uppercase tracking-tight">XP Sübvansiyonu Uygula</p>
                  <p class="text-xs text-slate-500 font-medium">Komisyon oranında %15 indirim sağlar.</p>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" v-model="xpEnabled" class="sr-only peer" />
                <div class="w-12 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
              </label>
            </div>

            <div class="space-y-3">
              <label class="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">MÜZAKERE NOTU</label>
              <textarea 
                v-model="note"
                class="w-full border border-slate-100 rounded-2xl px-5 py-4 h-32 focus:ring-4 focus:ring-blue-500/5 focus:border-[#002444] outline-none resize-none transition-all font-medium text-sm"
                placeholder="Karşı tarafın teklifi kabul etmesini sağlayacak detayları buraya ekleyin..."
              ></textarea>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              @click="submitCounterOffer"
              :disabled="isSubmitting"
              class="flex-1 bg-[#002444] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              <template v-if="isSubmitting">
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                GÖNDERİLİYOR...
              </template>
              <template v-else>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                Karşı Teklifi Gönder
              </template>
            </button>
            <button @click="router.back()" class="px-10 py-5 border-2 border-slate-100 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-[#002444] hover:bg-slate-50 transition-all">
              İPTAL
            </button>
          </div>
        </div>

        <!-- Sağ Kolon: Özet -->
        <div class="w-full lg:w-96 space-y-8">
          <!-- TrustScore Impact Card -->
          <div class="bg-[#002444] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
            <div class="relative z-10 space-y-6">
              <div class="flex items-center justify-between">
                <p class="font-black text-xs uppercase tracking-widest text-blue-300">TrustScore Etkisi</p>
                <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-amber-400">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div class="flex items-baseline gap-3">
                <span class="text-5xl font-black">+4.2</span>
                <span class="text-xs font-bold text-blue-300 uppercase tracking-widest">puan tahmini</span>
              </div>
              <p class="text-xs leading-relaxed text-blue-200 font-medium opacity-80">XP Sübvansiyonu kullanımı ve yüksek barter oranı güven skorunuzu olumlu etkiler.</p>
            </div>
            <div class="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-40 h-40">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
              </svg>
            </div>
          </div>

          <!-- Original Offer Summary -->
          <div class="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm space-y-8">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100 text-[#002444]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-7 h-7"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
              </div>
              <div>
                <p class="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Gelen Teklif Özeti</p>
                <p class="font-black text-[#002444]">{{ originalOffer?.fromCompany?.name || 'Bilinmeyen Firma' }}</p>
              </div>
            </div>
            <div class="space-y-4">
              <div class="flex justify-between items-center py-3 border-b border-slate-50">
                <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Orijinal Toplam</span>
                <span class="font-black text-[#002444]">{{ new Intl.NumberFormat('tr-TR').format(totalAmount) }} TL</span>
              </div>
              <div class="flex justify-between items-center py-1 text-xs">
                <span class="text-slate-400 font-medium italic">Barter Payı</span>
                <span class="font-black text-[#002444]">%{{ originalBarterRatio }}</span>
              </div>
              <div class="flex justify-between items-center py-1 text-xs">
                <span class="text-slate-400 font-medium italic">Nakit Payı</span>
                <span class="font-black text-[#002444]">%{{ originalCashRatio }}</span>
              </div>
              <div class="flex justify-between items-center py-3 text-xs">
                <span class="text-slate-400 font-bold uppercase tracking-widest">Teslimat</span>
                <span class="font-black text-amber-600">Standart Teslimat</span>
              </div>
            </div>
            <div class="bg-amber-50 text-amber-900 p-5 rounded-2xl flex gap-4 border border-amber-100/50">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-5 h-5 text-amber-600 shrink-0">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              <p class="text-[11px] font-medium leading-relaxed">Karşı taraf bu teklifi 48 saat içinde yanıtlamazsa teklif otomatik olarak düşer.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
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

/* Range input styling */
input[type='range']::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: white;
  border: 4px solid #002444;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
}
</style>
