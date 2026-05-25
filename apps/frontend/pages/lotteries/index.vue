<template>
  <div class="min-h-screen bg-[#f8fafc] py-10 px-4 sm:px-6 lg:px-8">
    <div class="w-full">
      <!-- Header -->
      <div class="mb-10">
        <h1 class="text-4xl md:text-5xl font-black text-gray-900 tracking-tight uppercase">
          Şanslı <span class="text-primary-600">Çekilişler</span>
        </h1>
        <p class="text-sm text-gray-400 font-bold uppercase tracking-widest mt-2">
          Dünyanın en seçkin markaları ve eşsiz deneyimler seni bekliyor.
        </p>
      </div>

      <!-- İçerik: Sidebar + Grid -->
      <div class="flex gap-6 items-start">

        <!-- Sol Arama Sidebar -->
        <aside class="w-64 flex-shrink-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
          <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <MagnifyingGlassIcon class="w-4 h-4 text-primary-600" />
              <span class="font-black text-sm text-gray-900">Filtrele & Ara</span>
            </div>
            <button
              v-if="searchQuery || statusFilter"
              class="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:opacity-70"
              type="button"
              @click="searchQuery = ''; statusFilter = ''"
            >
              Temizle
            </button>
          </div>

          <div class="p-5 space-y-5">
            <!-- Arama -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Anahtar Kelime</label>
              <div class="relative">
                <MagnifyingGlassIcon class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Çekiliş ara..."
                  class="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>

            <!-- Durum -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Durum</label>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="s in statusOptions"
                  :key="s.value"
                  type="button"
                  class="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-left transition-all border"
                  :class="statusFilter === s.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-primary-300 hover:text-primary-600'"
                  @click="statusFilter = s.value"
                >
                  {{ s.label }}
                </button>
              </div>
            </div>

            <!-- Bilet Fiyatı -->
            <div>
              <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Bilet Fiyatı (TL)</label>
              <div class="flex gap-2">
                <input
                  v-model="minPrice"
                  type="number"
                  placeholder="Min"
                  min="0"
                  class="w-1/2 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
                />
                <input
                  v-model="maxPrice"
                  type="number"
                  placeholder="Max"
                  min="0"
                  class="w-1/2 px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <!-- Sonuç sayısı -->
          <div class="px-5 py-3 bg-gray-50 border-t border-gray-100">
            <p class="text-[11px] text-gray-500">
              <span class="font-black text-primary-600">{{ filteredLotteries.length }}</span>
              çekiliş listelendi
            </p>
          </div>
        </aside>

        <!-- Grid -->
        <div class="flex-1 min-w-0">
          <div v-if="filteredLotteries.length > 0" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            <div
              v-for="lottery in filteredLotteries"
              :key="lottery.id"
              class="group bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-100 hover:-translate-y-2 transition-all duration-500"
            >
              <div class="relative h-56 overflow-hidden">
                <img
                  :src="resolveImageUrl(lottery.Product?.image)"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
                <div class="absolute top-5 left-5 flex flex-col gap-2">
                  <div class="px-3 py-1.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                    {{ lottery.ticketDigits }} HANELİ
                  </div>
                  <div class="px-3 py-1.5 bg-primary-600/40 backdrop-blur-md border border-primary-400/30 rounded-xl text-[10px] font-black text-white uppercase tracking-widest text-center">
                    {{ lottery.numbersPerTicket }} NUMARALI
                  </div>
                </div>
                <div class="absolute bottom-5 left-5">
                  <span class="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-0.5">BİLET FİYATI</span>
                  <span class="text-xl font-black text-white">{{ formatPrice(lottery.ticketPrice) }}</span>
                </div>
              </div>

              <div class="p-6 space-y-5">
                <div>
                  <h3 class="text-lg font-black text-gray-900 uppercase tracking-tight mb-1 truncate">{{ lottery.title }}</h3>
                  <p class="text-sm text-gray-400 font-bold line-clamp-1">{{ lottery.prizeDescription || lottery.Product?.name }}</p>
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <span class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">HAVUZ</span>
                    <span class="text-base font-black text-gray-900">{{ lottery.totalTickets }}</span>
                  </div>
                  <div class="bg-gray-100 p-3 rounded-xl border border-gray-100">
                    <span class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">DOLULUK</span>
                    <span class="text-base font-black text-primary-600">
                      {{ Math.round((lottery._count?.Tickets || 0) / lottery.totalTickets * 100) }}%
                    </span>
                  </div>
                </div>

                <NuxtLink
                  :to="`/lotteries/${lottery.id}`"
                  class="block w-full bg-gray-900 hover:bg-primary-600 text-white text-center py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-sm hover:shadow-primary-600/30"
                >
                  İncele ve Katıl
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Boş Durum -->
          <div v-else class="text-center py-32 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <TicketIcon class="w-10 h-10 text-gray-300" />
            </div>
            <h2 class="text-xl font-black text-gray-900 uppercase tracking-tight">Çekiliş bulunamadı</h2>
            <p class="text-gray-400 font-bold mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, TicketIcon } from '@heroicons/vue/24/outline'

definePageMeta({ layout: 'default', hideSideAds: true })
useHead({ title: 'Şanslı Çekilişler | BazarX' })

const { resolveImageUrl } = useAppImage()

const lotteries = ref([])
const searchQuery = ref('')
const statusFilter = ref('')
const minPrice = ref('')
const maxPrice = ref('')

const statusOptions = [
  { value: '', label: 'Tümü' },
  { value: 'Active', label: 'Aktif' },
  { value: 'Finished', label: 'Biten' },
]

const fetchLotteries = async () => {
  try {
    const { $api } = useApi()
    const res = await $api('/api/lotteries', { query: { status: statusFilter.value } })
    lotteries.value = res.data
  } catch { /* ignore */ }
}

const filteredLotteries = computed(() => {
  let result = [...lotteries.value]
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(l => l.title.toLowerCase().includes(q) || l.prizeDescription?.toLowerCase().includes(q))
  }
  if (minPrice.value) result = result.filter(l => Number(l.ticketPrice) >= Number(minPrice.value))
  if (maxPrice.value) result = result.filter(l => Number(l.ticketPrice) <= Number(maxPrice.value))
  return result
})

const formatPrice = (p) =>
  new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p))

watch(statusFilter, fetchLotteries)
onMounted(fetchLotteries)
</script>
