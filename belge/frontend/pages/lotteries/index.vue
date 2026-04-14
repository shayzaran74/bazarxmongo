<template>
  <div class="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-7xl mx-auto">
      <!-- Premium Header -->
      <div class="mb-16 text-center">
        <h1 class="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight uppercase">
          Şanslı <span class="text-primary-600">Çekilişler</span>
        </h1>
        <p class="text-lg text-gray-400 font-bold uppercase tracking-widest max-w-2xl mx-auto">
          Dünyanın en seçkin markaları ve eşsiz deneyimler seni bekliyor. Şansını dene, hayatını değiştir.
        </p>
      </div>

      <!-- Filters -->
      <div
        class="bg-white rounded-[2.5rem] shadow-xl p-8 mb-16 border border-gray-100 flex flex-wrap items-center justify-between gap-6"
      >
        <div class="flex flex-wrap gap-4">
          <button
            v-for="s in ['All', 'Active', 'Finished']"
            :key="s"
            class="px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
            :class="(statusFilter === s || (s === 'All' && !statusFilter)) ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'"
            @click="statusFilter = s === 'All' ? '' : s"
          >
            {{ s === 'All' ? 'TÜMÜ' : s === 'Active' ? 'AKTİF' : 'BİTEN' }}
          </button>
        </div>

        <div class="flex-1 max-w-md relative">
          <input
            v-model="searchQuery"
            placeholder="Çekiliş ara..."
            class="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-bold focus:ring-2 focus:ring-primary-500/20 transition-all pl-14"
          >
          <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-6 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      <!-- Lotteries Grid -->
      <div
        v-if="lotteries.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
      >
        <div
          v-for="lottery in filteredLotteries"
          :key="lottery.id"
          class="group bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 hover:-translate-y-2 transition-all duration-500"
        >
          <!-- Image Section -->
          <div class="relative h-64 overflow-hidden">
            <img
              :src="resolveImageUrl(lottery.Product?.image)"
              class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            >
            <div class="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />
            <!-- Badge -->
            <div class="absolute top-6 left-6 flex flex-col gap-2">
              <div
                class="px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest"
              >
                {{ lottery.ticketDigits }} HANELİ
              </div>
              <div
                class="px-4 py-2 bg-primary-600/40 backdrop-blur-md border border-primary-400/30 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest text-center"
              >
                {{ lottery.numbersPerTicket }} NUMARALI
              </div>
            </div>

            <!-- Price Tag -->
            <div class="absolute bottom-6 left-6">
              <span class="block text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">BİLET
                FİYATI</span>
              <span class="text-2xl font-black text-white">{{ formatPrice(lottery.ticketPrice) }}</span>
            </div>
          </div>

          <!-- Content Section -->
          <div class="p-8 space-y-6">
            <div>
              <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-2 truncate">
                {{ lottery.title }}
              </h3>
              <p class="text-sm text-gray-400 font-bold line-clamp-1">
                {{ lottery.prizeDescription ||
                  lottery.Product?.name }}
              </p>
            </div>

            <!-- Stats -->
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <span class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">HAVUZ</span>
                <span class="text-lg font-black text-gray-900">{{ lottery.totalTickets }}</span>
              </div>
              <div class="bg-gray-100 p-4 rounded-2xl border border-gray-100">
                <span class="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">DOLULUK</span>
                <span class="text-lg font-black text-primary-600">{{ Math.round((lottery._count?.Tickets || 0) /
                  lottery.totalTickets * 100) }}%</span>
              </div>
            </div>

            <NuxtLink
              :to="`/lotteries/${lottery.id}`"
              class="block w-full bg-gray-900 hover:bg-primary-600 text-white text-center py-5 rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-gray-900/10 hover:shadow-primary-600/30"
            >
              İncele ve Katıl
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-else
        class="text-center py-32"
      >
        <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <TicketIcon class="w-12 h-12 text-gray-300" />
        </div>
        <h2 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
          Şu an aktif çekiliş bulunmuyor
        </h2>
        <p class="text-gray-400 font-bold mt-2">
          Yeni çekilişler için takipte kal!
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { MagnifyingGlassIcon, TicketIcon } from '@heroicons/vue/24/outline'

const { resolveImageUrl } = useAppImage()

const lotteries = ref([])
const searchQuery = ref('')
const statusFilter = ref('')

const fetchLotteries = async () => {
  try {
    const { $api } = useApi()
    const res = await $api('/api/lotteries', {
      query: { status: statusFilter.value }
    })
    lotteries.value = res.data
  } catch (e) { /* ignore */ }
}

const filteredLotteries = computed(() => {
  if (!searchQuery.value) return lotteries.value
  const q = searchQuery.value.toLowerCase()
  return lotteries.value.filter(l =>
    l.title.toLowerCase().includes(q) ||
    l.prizeDescription?.toLowerCase().includes(q)
  )
})

const formatPrice = (p) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p))
}

watch(statusFilter, fetchLotteries)

onMounted(fetchLotteries)
</script>