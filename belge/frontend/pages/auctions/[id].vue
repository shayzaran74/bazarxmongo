<template>
  <div class="min-h-screen bg-[#f8fafc] pb-20">
    <!-- Hero / Auction Section (Lottery Style) -->
    <div class="relative h-[450px] overflow-hidden bg-[#0f172a]">
      <div
        v-if="auction?.Product"
        class="absolute inset-0 opacity-40 blur-sm scale-110"
      >
        <img
          :src="resolveImageUrl(auction.Product.image)"
          class="w-full h-full object-cover"
        >
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent" />

      <div
        class="relative z-10 max-w-7xl mx-auto h-full px-4 flex flex-col items-center justify-center text-center"
      >
        <div
          class="mb-6 px-6 py-2 rounded-full border border-white/20 backdrop-blur-md text-white text-sm font-bold uppercase tracking-[0.2em]"
          :class="auction?.status === 'Active' ? 'bg-green-500/20' : 'bg-red-500/20'"
        >
          {{ getStatusText(auction?.status) }}
        </div>

        <h1 class="text-5xl md:text-7xl font-black text-white mb-6 uppercase tracking-tight">
          {{ auction?.title }}
        </h1>

        <!-- Countdown -->
        <div
          v-if="auction?.status === 'Active'"
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
          v-if="auction?.status === 'Completed'"
          class="bg-primary-600 px-8 py-4 rounded-3xl shadow-2xl animate-bounce"
        >
          <p class="text-white font-black text-xl uppercase tracking-widest">
            Açık Artırma Sonuçlandı!
          </p>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 -mt-12 relative z-20">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Left: Product & Info -->
        <div class="lg:col-span-8 space-y-8">
          <!-- Main Product Card -->
          <div class="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
            <div class="p-8 md:p-12">
              <div class="flex flex-col md:flex-row gap-12 items-center">
                <div
                  v-if="auction?.Product"
                  class="w-full md:w-1/2 aspect-square rounded-[2rem] overflow-hidden shadow-2xl group relative"
                >
                  <img
                    :src="resolveImageUrl(auction.Product.image)"
                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  >
                  <div
                    class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"
                  >
                    <span class="text-white font-black text-xl uppercase tracking-widest">{{
                      auction.Product.name }}</span>
                  </div>
                </div>
                <div class="flex-1 space-y-6">
                  <h2 class="text-3xl font-black text-gray-900 leading-tight">
                    Ürün Bilgileri
                  </h2>
                  <p class="text-lg text-gray-500 leading-relaxed">
                    {{ auction?.description ||
                      auction?.Product?.description }}
                  </p>

                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span
                        class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                      >BAŞLANGIÇ
                        FİYATI</span>
                      <span class="text-2xl font-black text-gray-900">{{
                        formatPrice(auction?.startingPrice) }}</span>
                    </div>
                    <div class="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                      <span
                        class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                      >MİN.
                        ARTIŞ</span>
                      <span class="text-2xl font-black text-green-600">+{{
                        formatPrice(auction?.minBidIncrement) }}</span>
                    </div>
                    <div
                      v-if="auction?.participationDeposit > 0"
                      class="col-span-2 bg-blue-50 p-6 rounded-3xl border border-blue-100"
                    >
                      <span
                        class="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1"
                      >KATILIM
                        DEPOZİTOSU (BLOKE)</span>
                      <span class="text-2xl font-black text-blue-600">{{
                        formatPrice(auction?.participationDeposit) }}</span>
                      <p
                        class="text-[10px] text-blue-400 mt-2 font-bold uppercase tracking-tight italic"
                      >
                        Talebiniz onaylandığında bu tutar cüzdanınızda bloke edilir.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Quick Actions / Features -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div
              class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div
                class="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"
              >
                <ShieldCheckIcon class="w-6 h-6" />
              </div>
              <div>
                <span class="block font-black text-gray-900 text-xs uppercase">GÜVENLİ TEKLİF</span>
                <span class="text-[10px] font-bold text-gray-400">SSL Korumalı</span>
              </div>
            </div>
            <div
              class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div
                class="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center"
              >
                <ClockIcon class="w-6 h-6" />
              </div>
              <div>
                <span class="block font-black text-gray-900 text-xs uppercase">GERÇEK ZAMANLI</span>
                <span class="text-[10px] font-bold text-gray-400">Anlık Güncelleme</span>
              </div>
            </div>
            <div
              class="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm flex items-center gap-4"
            >
              <div
                class="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"
              >
                <BoltIcon class="w-6 h-6" />
              </div>
              <div>
                <span class="block font-black text-gray-900 text-xs uppercase">CÜZDAN İLE ÖDEME</span>
                <span class="text-[10px] font-bold text-gray-400">Hızlı & Kolay</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: Bidding Section & Stats -->
        <div class="lg:col-span-4 space-y-8">
          <!-- Current Status Card -->
          <div class="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100 relative overflow-hidden">
            <!-- Highlight for Current Highest -->
            <div
              v-if="isHighestBidder"
              class="absolute top-0 right-0 left-0 h-1 bg-green-500"
            />

            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">
              Güncel Durum
            </h3>

            <div class="space-y-6">
              <div class="text-center p-6 bg-gray-900 rounded-[2rem] mb-8">
                <span
                  class="block text-white/50 text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                >ŞU
                  ANKİ TEKLİF</span>
                <span class="text-4xl font-black text-white">{{ formatPrice(auction?.currentPrice ||
                  auction?.startingPrice) }}</span>
              </div>

              <div
                v-if="auction?.status === 'Active'"
                class="space-y-4"
              >
                <!-- Participation Needed -->
                <div
                  v-if="auction?.participationDeposit > 0 && (!participation || participation.status !== 'Approved')"
                  class="space-y-4"
                >
                  <div
                    v-if="!participation"
                    class="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 text-center"
                  >
                    <p class="text-[10px] font-black text-amber-600 uppercase mb-4 tracking-widest">
                      Katılmak için depozito onayı gereklidir
                    </p>
                    <button
                      class="w-full bg-amber-500 hover:bg-amber-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest transition-all"
                      @click="handleParticipate"
                    >
                      KATILIM TALEBİ GÖNDER
                    </button>
                  </div>
                  <div
                    v-else-if="participation.status === 'Pending'"
                    class="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 text-center"
                  >
                    <div
                      class="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3"
                    >
                      <ClockIcon class="w-6 h-6 text-blue-600" />
                    </div>
                    <p class="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                      Katılım Talebiniz Beklemede
                    </p>
                    <p
                      class="text-[8px] font-bold text-blue-400 mt-2 uppercase tracking-tighter italic"
                    >
                      Admin onayladığında {{ formatPrice(auction.participationDeposit) }}
                      cüzdanınızdan bloke edilecektir.
                    </p>
                  </div>
                  <div
                    v-else-if="participation.status === 'Rejected'"
                    class="bg-red-50 p-6 rounded-[2rem] border border-red-100 text-center"
                  >
                    <p class="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
                      Katılım Talebiniz Reddedildi
                    </p>
                  </div>
                </div>

                <!-- Bidding Allowed -->
                <div
                  v-else
                  class="space-y-4"
                >
                  <div class="relative">
                    <input
                      v-model.number="bidAmount"
                      type="number"
                      :min="minNextBid"
                      class="w-full bg-gray-50 border-2 border-gray-100 rounded-[2rem] px-8 py-5 font-black text-xl focus:border-primary-500 focus:ring-0 transition-all outline-none"
                      placeholder="Teklifini Yaz..."
                    >
                    <div class="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 font-black">
                      TL
                    </div>
                  </div>

                  <p
                    class="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest"
                  >
                    MİN. TEKLİF: {{ formatPrice(minNextBid) }}
                  </p>

                  <button
                    :disabled="bidding || bidAmount < minNextBid"
                    class="w-full bg-primary-500 hover:bg-primary-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-primary-500/40"
                    @click="handlePlaceBid"
                  >
                    <div
                      v-if="bidding"
                      class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                    />
                    <span>{{ bidding ? 'İŞLEMDE...' : 'TEKLİF VER' }}</span>
                  </button>

                  <div
                    v-if="isHighestBidder"
                    class="flex items-center justify-center gap-2 text-green-600 bg-green-50 py-3 rounded-2xl"
                  >
                    <CheckCircleIcon class="w-5 h-5 font-black" />
                    <span class="text-xs font-black uppercase tracking-widest">En Yüksek Teklif
                      Sende!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bid History (Simplified & Modern) -->
          <div class="bg-white rounded-[3rem] shadow-xl p-8 border border-gray-100">
            <h3 class="text-xl font-black text-gray-900 uppercase tracking-tight mb-8">
              Teklif Geçmişi ({{
                bids.length }})
            </h3>
            <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              <div
                v-for="(bid, index) in bids"
                :key="bid.id"
                class="flex items-center justify-between p-4 rounded-2xl transition-all"
                :class="index === 0 ? 'bg-primary-50 border border-primary-100' : 'bg-gray-50 border border-transparent'"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl flex items-center justify-center font-black"
                    :class="index === 0 ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-500'"
                  >
                    #{{ bids.length - index }}
                  </div>
                  <div>
                    <span class="block text-xs font-black text-gray-900">{{
                      maskEmail(bid.User?.email) }}</span>
                    <span class="text-[10px] font-bold text-gray-400">{{
                      formatDateShort(bid.createdAt) }}</span>
                  </div>
                </div>
                <div class="text-right">
                  <span
                    class="block text-lg font-black"
                    :class="index === 0 ? 'text-primary-600' : 'text-gray-900'"
                  >{{
                    formatPrice(bid.amount) }}</span>
                  <span
                    v-if="bid.userId === authStore.user?.id"
                    class="text-[8px] font-black text-primary-500 uppercase tracking-widest font-bold"
                  >Teklifin</span>
                </div>
              </div>

              <div
                v-if="bids.length === 0"
                class="text-center py-12"
              >
                <div
                  class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300"
                >
                  <ChatBubbleBottomCenterTextIcon class="w-8 h-8" />
                </div>
                <p class="text-xs font-black text-gray-400 uppercase tracking-widest">
                  Henüz teklif yok
                </p>
              </div>
            </div>
          </div>

          <!-- Winner Section (If Finished) -->
          <div
            v-if="auction?.status === 'Completed'"
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
                  {{ maskEmail(auction?.winner?.email
                    || (bids[0]?.User?.email)) }}
                </p>
              </div>
              <div class="bg-white p-6 rounded-3xl border border-primary-200">
                <span
                  class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1"
                >KAZANAN
                  TEKLİF</span>
                <span class="text-4xl font-black text-gray-900 tracking-tight">{{
                  formatPrice(auction?.currentPrice) }}</span>
              </div>

              <!-- Claim Button for Winner -->
              <div
                v-if="isEligibleToClaim"
                class="pt-4 space-y-4"
              >
                <div
                  class="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex flex-col items-center"
                >
                  <ClockIcon class="w-6 h-6 text-amber-600 mb-2" />
                  <span class="text-[10px] font-black text-amber-600 uppercase tracking-widest">SON
                    ÖDEME TARİHİ</span>
                  <span class="text-sm font-black text-gray-900">{{
                    formatDateFull(auction.paymentDeadline) }}</span>
                </div>
                <button
                  :disabled="claiming"
                  class="w-full bg-green-500 hover:bg-green-600 text-white p-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-green-500/40 transition-all flex items-center justify-center gap-3"
                  @click="handleClaim"
                >
                  <div
                    v-if="claiming"
                    class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"
                  />
                  <span>{{ claiming ? 'İŞLEMDE...' : 'HEMEN SATIN AL' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
    TrophyIcon,
    ShieldCheckIcon,
    ClockIcon,
    BoltIcon,
    CheckCircleIcon,
    ChatBubbleBottomCenterTextIcon
} from '@heroicons/vue/24/outline'

const route = useRoute()
const { $api } = useApi()
const authStore = useAuthStore()
const { resolveImageUrl } = useAppImage()
const { $toast } = useNuxtApp()

const auction = ref(null)
const bids = ref([])
const loading = ref(true)
const bidding = ref(false)
const claiming = ref(false)
const participation = ref(null)
const bidAmount = ref(0)

const countdown = reactive({
    D: '00',
    H: '00',
    M: '00',
    S: '00'
})

const minNextBid = computed(() => {
    if (!auction.value) return 0
    const current = auction.value.currentPrice || auction.value.startingPrice
    return Number(current) + Number(auction.value.minBidIncrement)
})

const isHighestBidder = computed(() => {
    if (!bids.value.length || !authStore.user) return false
    return bids.value[0].userId === authStore.user.id
})

const isEligibleToClaim = computed(() => {
    if (!auction.value || auction.value.status !== 'Completed' || !authStore.user) return false

    const step = auction.value.currentWinnerStep || 1
    let eligibleUserId = null
    if (step === 1) eligibleUserId = auction.value.winnerId
    else if (step === 2) eligibleUserId = auction.value.winner2Id
    else if (step === 3) eligibleUserId = auction.value.winner3Id

    return authStore.user.id === eligibleUserId && (new Date(auction.value.paymentDeadline) > new Date())
})

const fetchAuctionData = async () => {
    try {
        const res = await $api(`/api/auctions/${route.params.id}`)
        auction.value = res.data
        if (bidAmount.value < minNextBid.value) {
            bidAmount.value = minNextBid.value
        }
    } catch (e) {
        $toast.error('Açık artırma verisi alınamadı')
    } finally {
        loading.value = false
    }
}

const fetchBids = async () => {
    try {
        const res = await $api(`/api/auctions/${route.params.id}/bids`)
        bids.value = res.data || []
    } catch (e) { /* ignore */ }
}

const fetchParticipation = async () => {
    if (!authStore.isLoggedIn) return
    try {
        const res = await $api(`/api/auctions/${route.params.id}/participation`)
        participation.value = res.data
    } catch (e) { /* ignore */ }
}

const handleParticipate = async () => {
    if (!authStore.isLoggedIn) return navigateTo('/login')
    try {
        await $api(`/api/auctions/${route.params.id}/participate`, {
            method: 'POST'
        })
        $toast.success('Katılım talebiniz alındı!')
        fetchParticipation()
    } catch (e) {
        $toast.error(e.data?.error || 'Başvuru başarısız')
    }
}

const updateCountdown = () => {
    if (!auction.value || auction.value.status !== 'Active') return
    const end = new Date(auction.value.endTime).getTime()
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

const handlePlaceBid = async () => {
    if (!authStore.isLoggedIn) {
        $toast.info('Lütfen giriş yapın')
        return navigateTo('/login')
    }

    if (bidAmount.value < minNextBid.value) {
        $toast.warning(`Minimum teklif ${formatPrice(minNextBid.value)} olmalıdır`)
        return
    }

    bidding.value = true
    try {
        const res = await $api(`/api/auctions/${auction.value.id}/bid`, {
            method: 'POST',
            body: { amount: Number(bidAmount.value) }
        })

        if (res.success) {
            $toast.success('Teklifiniz başarıyla verildi!')
            fetchAuctionData()
            fetchBids()
            authStore.fetchUser()
        }
    } catch (e) {
        $toast.error(e.data?.error || 'Teklif verme başarısız')
    } finally {
        bidding.value = false
    }
}

const handleClaim = async () => {
    claiming.value = true
    try {
        const res = await $api(`/api/auctions/${auction.value.id}/claim`, {
            method: 'POST'
        })
        if (res.success) {
            $toast.success('Ürün başarıyla satın alındı! Siparişlerimden takip edebilirsiniz.')
            fetchAuctionData()
            authStore.fetchUser()
        }
    } catch (e) {
        $toast.error(e.data?.error || 'Satın alma işlemi başarısız')
    } finally {
        claiming.value = false
    }
}

const formatPrice = (p) => {
    if (p === undefined || p === null) return '0.00 TL'
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(p))
}

const formatDateShort = (d) => {
    return new Date(d).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
}

const formatDateFull = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

const maskEmail = (email) => {
    if (!email) return '---'
    const [name, domain] = email.split('@')
    return `${name.slice(0, 3)}***@${domain}`
}

const getStatusText = (s) => {
    if (s === 'Active') return 'Canlı Takip'; if (s === 'Completed') return 'Bitti'; return 'İptal'
}

let timer = null
let refreshTimer = null

onMounted(() => {
    fetchAuctionData()
    fetchBids()
    fetchParticipation()
    timer = setInterval(updateCountdown, 1000)
    refreshTimer = setInterval(() => {
        fetchAuctionData()
        fetchBids()
        fetchParticipation()
    }, 5000) // Her 5 saniyede bir teklifleri tazele
})

onUnmounted(() => {
    if (timer) clearInterval(timer)
    if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ddd;
    border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #ccc;
}
</style>