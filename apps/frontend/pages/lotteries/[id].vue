<template>
  <div class="min-h-screen bg-[#f8fafc] pb-20">
    <!-- Hero / Prize Section -->
    <div class="relative h-[400px] overflow-hidden bg-[#0f172a]">
      <div
        v-if="lottery?.Product || lottery?.imageUrl"
        class="absolute inset-0 opacity-40 blur-sm scale-110"
      >
        <img
          :src="resolveImageUrl(lottery.imageUrl || lottery.Product?.image)"
          class="w-full h-full object-cover"
        >
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />

      <div
        class="relative z-10 max-w-7xl mx-auto h-full px-4 flex flex-col items-center justify-center text-center"
      >
        <div
          class="mb-6 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md text-white text-sm font-bold uppercase tracking-[0.2em]"
          :class="lottery?.status === 'Active' ? 'bg-green-500/20' : 'bg-red-500/20'"
        >
          {{ getStatusText(lottery?.status) }}
        </div>

        <h1 class="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
          {{ lottery?.title }}
        </h1>

        <!-- Countdown -->
        <div
          v-if="lottery?.status === 'Active'"
          class="flex gap-4 md:gap-8 mb-8"
        >
          <div
            v-for="(val, unit) in countdown"
            :key="unit"
            class="flex flex-col items-center"
          >
            <div
              class="w-16 h-16 md:w-24 md:h-24 bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/20 flex items-center justify-center text-2xl md:text-4xl font-black text-white shadow-2xl"
            >
              {{ val }}
            </div>
            <span class="mt-3 text-[10px] md:text-xs font-black text-white/60 uppercase tracking-widest">{{
              unit === 'D' ? 'GÜN' : unit === 'H' ? 'SAAT' : unit === 'M' ? 'DAKİKA' : 'SANİYE' }}</span>
          </div>
        </div>

        <div
          v-if="lottery?.status === 'Finished'"
          class="bg-primary-600 px-8 py-4 rounded-3xl shadow-2xl animate-bounce"
        >
          <p class="text-white font-black text-xl uppercase tracking-widest">
            Çekiliş Sonuçlandı!
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Prize & Info -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Prize Detail Card -->
          <div class="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
            <div class="p-8 md:p-12">
              <div class="flex flex-col md:flex-row gap-12 items-center">
                <div
                  v-if="lottery?.Product || lottery?.imageUrl"
                  class="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-2xl"
                >
                  <img
                    :src="resolveImageUrl(lottery.imageUrl || lottery.Product?.image)"
                    class="w-full h-full object-cover"
                  >
                </div>
                <div class="flex-1 space-y-6">
                  <h2 class="text-3xl font-black text-gray-900 leading-tight">
                    Ödül Detayları
                  </h2>
                  <p class="text-lg text-gray-500 leading-relaxed">
                    {{ lottery?.prizeDescription ||
                      (lottery?.Product?.description) }}
                  </p>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span
                        class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                      >BİLET
                        FİYATI</span>
                      <span class="text-2xl font-black text-primary-600">{{
                        formatPrice(lottery?.ticketPrice) }}</span>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span
                        class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                      >BİLET
                        TİPİ</span>
                      <span class="text-2xl font-black text-gray-900">{{ lottery?.numbersPerTicket
                      }} Numaralı</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Selection Board -->
          <div
            v-if="lottery?.status === 'Active'"
            class="bg-white rounded-[3rem] shadow-xl p-8 md:p-12 border border-gray-100"
          >
            <div class="text-center mb-12">
              <h2 class="text-3xl font-black text-gray-900 uppercase">
                Şansını Dene
              </h2>
              <p class="text-gray-400 font-bold">
                Her bilette sistem sizin için {{
                  lottery?.numbersPerTicket }} adet benzersiz numara belirler.
              </p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <button
                v-for="count in [1, 3, 5]"
                :key="count"
                class="relative overflow-hidden group p-8 rounded-[2rem] border-2 transition-all text-center"
                :class="selectedCount === count ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'"
                @click="selectedCount = count"
              >
                <div class="relative z-10">
                  <TicketIcon
                    class="w-10 h-10 mx-auto mb-4"
                    :class="selectedCount === count ? 'text-primary-600' : 'text-gray-300'"
                  />
                  <span class="block text-2xl font-black text-gray-900">{{ count }} ADET</span>
                  <span class="text-xs font-bold text-gray-400 uppercase tracking-widest">{{
                    formatPrice(BigInt(lottery.ticketPrice || 0) * BigInt(count)) }}</span>
                </div>
                <div
                  v-if="selectedCount === count"
                  class="absolute top-4 right-4 text-primary-600"
                >
                  <CheckCircleIcon class="w-6 h-6" />
                </div>
              </button>
            </div>

            <div
              class="bg-gray-900 rounded-[3rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6"
            >
              <div>
                <span
                  class="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                >TOPLAM
                  ÖDEME</span>
                <span class="text-4xl font-black text-white">{{ formatPrice(BigInt(lottery.ticketPrice
                  || 0) * BigInt(selectedCount)) }}</span>
              </div>
              <button
                :disabled="buying || !selectedCount"
                class="w-full md:w-auto bg-primary-500 hover:bg-primary-600 text-white px-12 py-5 rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/40"
                @click="handlePurchase"
              >
                <div
                  v-if="buying"
                  class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                />
                <span>{{ buying ? 'İŞLEMDE...' : 'HEMEN SATIN AL' }}</span>
              </button>
            </div>

            <p class="text-center mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest">
              SİSTEM OTOMATİK OLARAK BAŞKASI TARAFINDAN ALINMAMIŞ NUMARALARI SİZİN İÇİN SEÇECEKTİR.
            </p>
          </div>
        </div>

        <!-- Right: Stats & Winner -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Lottery Stats -->
          <div class="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100">
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">
              İstatistikler
            </h3>

            <div class="space-y-6">
              <div class="flex items-center justify-between">
                <span class="font-bold text-gray-400 uppercase text-[10px] tracking-widest">SATILAN
                  BİLET</span>
                <span class="font-black text-gray-900">{{ lottery?._count?.Tickets || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-bold text-gray-400 uppercase text-[10px] tracking-widest">NUMARA
                  HAVUZU</span>
                <span class="font-black text-gray-900">0 - {{ lottery?.totalTickets - 1 }}</span>
              </div>

              <div class="space-y-2 pt-4">
                <div class="flex justify-between text-[10px] font-black text-gray-400">
                  <span>DOLULUK ORANI</span>
                  <span>{{ occupancy }}%</span>
                </div>
                <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-primary-500 transition-all duration-1000"
                    :style="{ width: `${occupancy}%` }"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Winner Section -->
          <div
            v-if="lottery?.status === 'Finished'"
            class="bg-primary-50 rounded-[3rem] p-8 border border-primary-100"
          >
            <div class="text-center space-y-6">
              <div
                class="w-20 h-20 bg-primary-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-primary-500/30"
              >
                <TrophyIcon class="w-10 h-10 text-white" />
              </div>
              <div>
                <h4 class="text-2xl font-black text-gray-900 uppercase tracking-tight">
                  KAZANAN ÜYE
                </h4>
                <p class="text-primary-600 font-black text-xl mt-2">
                  {{ lottery?.Winner?.name ||
                    lottery?.Winner?.email }}
                </p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-primary-200">
                <span
                  class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                >ŞANSLI
                  NUMARA</span>
                <span class="text-4xl font-black text-gray-900 tracking-[0.3em]">{{
                  lottery?.winningNumber || '---' }}</span>
              </div>
            </div>
          </div>

          <!-- User's Tickets -->
          <div
            v-if="myTickets.length > 0"
            class="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100"
          >
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">
              BİLETLERİNİZ
            </h3>
            <div class="space-y-4">
              <div
                v-for="t in myTickets"
                :key="t.id"
                class="bg-gray-50 border border-gray-100 p-4 rounded-2xl"
              >
                <div class="text-[10px] font-black text-gray-300 uppercase italic mb-2">
                  Bilet #{{
                    t.id.slice(-4).toUpperCase() }}
                </div>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="n in t.numbers"
                    :key="n"
                    class="px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-black text-gray-600 tracking-wider"
                  >{{
                    n }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { TrophyIcon, TicketIcon, CheckCircleIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const authStore = useAuthStore()
const { resolveImageUrl } = useAppImage()
const { $toast } = useNuxtApp()

const lottery = ref(null)
const myTickets = ref([])
const loading = ref(true)
const buying = ref(false)
const selectedCount = ref(1)

const countdown = reactive({
    D: '00',
    H: '00',
    M: '00',
    S: '00'
})

const occupancy = computed(() => {
    if (!lottery.value) return 0
    const numbersTaken = (lottery.value._count?.Tickets || 0) * (lottery.value.numbersPerTicket || 1)
    return Math.min(100, Math.round((numbersTaken / lottery.value.totalTickets) * 100))
})

const fetchLottery = async () => {
    try {
        const { $api } = useApi()
        const res = await $api(`/api/lotteries/${route.params.id}`)
        lottery.value = res.data
        if (authStore.user) {
            fetchMyTickets()
        }
    } catch (e) {
        $toast.error('Çekiliş verisi alınamadı')
    } finally {
        loading.value = false
    }
}

const fetchMyTickets = async () => {
    try {
        const { $api } = useApi()
        const res = await $api(`/api/lotteries/my/tickets`)
        myTickets.value = res.data.filter(t => t.lotteryId === route.params.id)
    } catch (e) { /* ignore */ }
}

const updateCountdown = () => {
    if (!lottery.value || lottery.value.status !== 'Active') return
    const end = new Date(lottery.value.endTime).getTime()
    const now = new Date().getTime()
    const diff = end - now
    if (diff <= 0) {
        countdown.D = countdown.H = countdown.M = countdown.S = '00'
        return
    }
    const d = Math.floor(diff / (1000 * 60 * 60 * 24))
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const s = Math.floor((diff % (1000 * 60)) / 1000)
    countdown.D = d.toString().padStart(2, '0'); countdown.H = h.toString().padStart(2, '0'); countdown.M = m.toString().padStart(2, '0'); countdown.S = s.toString().padStart(2, '0')
}

const handlePurchase = async () => {
    if (!authStore.isLoggedIn) {
        $toast.info('Lütfen giriş yapın')
        return navigateTo('/login')
    }

    if (!selectedCount.value || selectedCount.value <= 0) {
        $toast.warning('Bilet adedi seçilmedi')
        return
    }

    buying.value = true
    try {
        const { $api } = useApi()
        const res = await $api(`/api/lotteries/${lottery.value.id}/buy`, {
            method: 'POST',
            body: { count: Number(selectedCount.value) }
        })

        if (res.success) {
            $toast.success(`${selectedCount.value} adet bilet başarıyla alındı!`)
            fetchLottery()
            authStore.fetchUser()
        }
    } catch (e) {
        console.error('Purchase error:', e)
        $toast.error(e.data?.error || 'Satın alma başarısız')
    } finally {
        buying.value = false
    }
}

const formatPrice = (p) => {
    if (p === undefined || p === null) return '0.00 TL'
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p))
}

const getStatusText = (s) => {
    if (s === 'Active') return 'Katılıma Açık'; if (s === 'Finished') return 'Bitti'; return 'Kapalı'
}

let timer = null
onMounted(() => {
    fetchLottery()
    timer = setInterval(updateCountdown, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>