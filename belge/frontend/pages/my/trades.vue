<template>
  <div class="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div class="mb-8">
      <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
        <span class="p-3 bg-indigo-100 rounded-2xl">🤝</span>
        Takas Tekliflerim
      </h1>
      <p class="text-gray-500 mt-2 font-medium">
        Size önerilen akıllı takas zincirlerini inceleyin ve onaylayın.
      </p>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="flex justify-center py-24"
    >
      <div class="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full" />
    </div>

    <!-- Empty State -->
    <div
      v-else-if="chains.length === 0"
      class="bg-white rounded-[3rem] p-16 text-center border border-dashed border-gray-200"
    >
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
        📭
      </div>
      <h3 class="text-2xl font-black text-gray-900">
        Henüz Bir Teklif Yok
      </h3>
      <p class="text-gray-500 mt-3 max-w-md mx-auto font-medium">
        İhtiyaçlarınızı ve fazla mallarınızı girdikçe
        sistem size uygun takaslar önerecektir.
      </p>
      <div class="mt-8 flex justify-center gap-4">
        <NuxtLink
          to="/dashboard/wanted-items"
          class="btn-primary"
        >
          İstek Ekle
        </NuxtLink>
        <NuxtLink
          to="/my/surplus"
          class="btn-secondary"
        >
          Fazla Mal Ekle
        </NuxtLink>
      </div>
    </div>

    <!-- Chains List -->
    <div
      v-else
      class="space-y-8"
    >
      <div
        v-for="chain in chains"
        :key="chain.id"
        class="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300"
      >
        <!-- Header -->
        <div
          class="bg-gray-50/80 p-6 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100"
        >
          <div class="flex items-center gap-3">
            <span
              :class="getStatusClass(chain.status)"
              class="px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest"
            >
              {{ chain.status === 'PENDING' ? 'ONAY BEKLİYOR' : chain.status === 'COMPLETED' ?
                'TAMAMLANDI' : chain.status }}
            </span>
            <span class="text-sm font-bold text-gray-400">#{{ chain.id.slice(-6) }}</span>
          </div>
          <div class="flex items-center gap-4">
            <button
              class="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all"
              @click="showChainDetails(chain)"
            >
              🔍 Takas Detayı
            </button>
            <div class="text-right">
              <span class="text-xs font-bold text-gray-400 uppercase tracking-widest block">Son Onay
                Tarihi</span>
              <span class="text-sm font-black text-red-500">{{ formatDate(chain.expiresAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Offers / Flow -->
        <div class="p-8">
          <h3 class="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
            <span class="w-2 h-6 bg-indigo-600 rounded-full" />
            Takas Döngüsü
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="(offer, idx) in chain.offers"
              :key="offer.id"
              class="relative p-6 rounded-3xl border-2 transition-all"
              :class="isMyOffer(offer) ? 'border-primary-500 bg-primary-50' : 'border-gray-100 bg-white opacity-70'"
            >
              <!-- Connection Line (Desktop) -->
              <div
                v-if="idx < chain.offers.length - 1"
                class="hidden lg:block absolute -right-9 top-1/2 -translate-y-1/2 z-10 text-gray-300"
              >
                <ArrowRightIcon class="h-6 w-6" />
              </div>

              <!-- My Action Tag -->
              <div
                v-if="isMyOffer(offer)"
                class="absolute -top-3 left-6 px-3 py-1 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg"
              >
                SİZE GELEN
              </div>

              <div class="flex justify-between items-start mb-4">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center text-lg"
                  >
                    🏢
                  </div>
                  <div>
                    <p class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      GÖNDEREN
                    </p>
                    <p class="text-sm font-black text-gray-900 line-clamp-1">
                      {{
                        offer.fromCompany.name }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="bg-white/50 p-3 rounded-2xl mb-4 border border-gray-100">
                <p class="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                  ÜRÜN
                </p>
                <p class="font-bold text-gray-800 line-clamp-1">
                  {{ offer.offeredItem.title }}
                </p>
                <p class="text-xs font-medium text-gray-500 mt-1">
                  {{ offer.offeredQuantity }} Adet
                </p>
              </div>

              <!-- Status Badge -->
              <div class="flex justify-between items-center">
                <div
                  v-if="offer.status === 'accepted'"
                  class="flex items-center gap-1 text-green-600 font-bold text-xs uppercase bg-green-50 px-3 py-1.5 rounded-lg"
                >
                  <CheckCircleIcon class="h-4 w-4" /> Onaylandı
                </div>
                <div
                  v-else-if="offer.status === 'pending'"
                  class="flex items-center gap-1 text-amber-600 font-bold text-xs uppercase bg-amber-50 px-3 py-1.5 rounded-lg"
                >
                  <ClockIcon class="h-4 w-4" /> Bekleniyor
                </div>
              </div>

              <!-- Action Button For Me -->
              <div
                v-if="isMyOffer(offer) && offer.status === 'pending'"
                class="mt-4 pt-4 border-t border-primary-100"
              >
                <button
                  :disabled="actionLoading"
                  class="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-200 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  @click="acceptOffer(offer.id)"
                >
                  <span
                    v-if="actionLoading"
                    class="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"
                  />
                  <span v-else>✅ TEKLİFİ KABUL ET</span>
                </button>
                <button
                  :disabled="actionLoading"
                  class="w-full mt-2 py-3 bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-xl transition-all active:scale-95 disabled:opacity-50 text-xs uppercase tracking-widest"
                  @click="rejectOffer(offer.id)"
                >
                  ❌ Reddet
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <TransitionRoot
      appear
      :show="isModalOpen"
      as="template"
    >
      <Dialog
        as="div"
        class="relative z-50"
        @close="isModalOpen = false"
      >
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div class="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-2xl transform overflow-hidden rounded-[2.5rem] bg-white p-8 text-left align-middle shadow-2xl transition-all border border-gray-100"
              >
                <DialogTitle
                  as="h3"
                  class="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3"
                >
                  <span class="p-2 bg-indigo-50 rounded-xl">ℹ️</span>
                  Takas Zinciri Detayı
                </DialogTitle>

                <div
                  v-if="selectedChain"
                  class="space-y-6"
                >
                  <div
                    v-for="offer in selectedChain.offers"
                    :key="offer.id"
                    class="p-5 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div class="flex justify-between items-start mb-4">
                      <div>
                        <span
                          class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"
                        >KİMDEN
                          -> KİME</span>
                        <p class="font-bold text-gray-900">
                          {{ offer.fromCompany.name }} ➜ {{
                            offer.toCompany.name }}
                        </p>
                      </div>
                      <div class="text-right">
                        <span
                          class="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1"
                        >DEĞER
                          (Tahmini)</span>
                        <p class="font-bold text-indigo-600">
                          {{
                            formatCurrency(offer.offeredValue) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4 pt-4 border-t border-gray-200/50">
                      <div
                        class="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-xl"
                      >
                        📦
                      </div>
                      <div>
                        <p class="text-sm font-black text-gray-800">
                          {{ offer.offeredItem.title
                          }}
                        </p>
                        <p class="text-xs font-medium text-gray-500">
                          {{ offer.offeredQuantity }}
                          {{ offer.offeredItem.unit }}
                        </p>
                      </div>
                      <div class="ml-auto">
                        <ReviewStatusBadge
                          v-if="offer.status === 'completed' || offer.status === 'accepted'"
                          :trade-offer-id="offer.id"
                        />
                      </div>
                    </div>

                    <div
                      v-if="offer.status === 'completed' || offer.status === 'accepted'"
                      class="mt-4"
                    >
                      <button
                        class="w-full py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all hover:bg-black flex items-center justify-center gap-2"
                        @click="openReviewModal(offer)"
                      >
                        <StarIcon class="h-4 w-4 text-amber-400" />
                        DENEYİMİ DEĞERLENDİR
                      </button>
                    </div>
                  </div>

                  <!-- My Chat Action -->
                  <div
                    v-for="offer in selectedChain.offers"
                    :key="'chat-' + offer.id"
                  >
                    <div
                      v-if="isMyOffer(offer) || isMine(offer)"
                      class="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100"
                    >
                      <div class="flex items-center justify-between mb-2">
                        <p
                          class="text-xs font-black text-indigo-600 uppercase tracking-widest italic"
                        >
                          💬 SOHBET ({{ isMyOffer(offer) ? 'Gelen' : 'Giden' }} Teklif)
                        </p>
                        <button
                          v-if="activeChatId === offer.id"
                          class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest"
                          @click="activeChatId = null"
                        >
                          Kapat
                        </button>
                      </div>

                      <button
                        v-if="activeChatId !== offer.id"
                        class="w-full py-3 bg-white border-2 border-indigo-200 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                        @click="activeChatId = offer.id"
                      >
                        <span>Sohbeti Başlat</span>
                      </button>

                      <div
                        v-if="activeChatId === offer.id"
                        class="mt-4"
                      >
                        <ChatWindow :trade-offer-id="offer.id" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="mt-8 flex justify-end">
                  <button
                    class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                    @click="isModalOpen = false"
                  >
                    Kapat
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>

    <!-- Review Modal Overlay -->
    <div
      v-if="showReviewModal"
      class="fixed inset-0 z-[60] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-md shadow-2xl"
        @click="showReviewModal = false"
      />
      <div class="relative w-full max-w-xl animate-fade-in">
        <ReviewForm
          :trade-info="reviewTradeInfo"
          @success="handleReviewSuccess"
          @cancel="showReviewModal = false"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBarterService } from '~/services/api/BarterService'
import { useCompanyService } from '~/services/api/CompanyService'
import { ArrowRightIcon, CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/solid'
import { TransitionRoot, TransitionChild, Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import {
            StarIcon
} from '@heroicons/vue/24/outline'
import ChatWindow from '~/components/chat/ChatWindow.vue'
import ReviewStatusBadge from '~/components/trade/ReviewStatusBadge.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

definePageMeta({
    layout: 'default',
    middleware: 'auth'
})

const barterService = useBarterService()
const companyService = useCompanyService()
const authStore = useAuthStore()
const chains = ref([])
const myCompany = ref(null)
const loading = ref(true)
const actionLoading = ref(false)
const isModalOpen = ref(false)
const selectedChain = ref(null)
const activeChatId = ref(null)

const showReviewModal = ref(false)
const selectedOfferForReview = ref(null)

const reviewTradeInfo = computed(() => {
    if (!selectedOfferForReview.value) return {}
    const offer = selectedOfferForReview.value
    // Determine partner based on company ID
    const isImSender = offer.fromCompanyId === myCompany.value?.id
    const partner = isImSender ? offer.toCompany : offer.fromCompany

    // Find a user from the partner company
    let toUserId = null

    if (partner?.users && partner.users.length > 0) {
        const otherUser = partner.users.find(u => {
            const uid = u.user?.id || u.userId
            return uid && uid !== authStore.user?.id
        })

        if (otherUser) {
            toUserId = otherUser.user?.id || otherUser.userId
        } else {
            const firstUser = partner.users[0]
            toUserId = firstUser?.user?.id || firstUser?.userId
        }
    }

    return {
        tradeId: offer.id,
        partnerName: partner?.name,
        fromImage: getMainImage(offer.offeredItem),
        toImage: getMainImage(offer.requestedItem),
        toUserId
    }
})

const openReviewModal = (offer) => {
    selectedOfferForReview.value = offer
    showReviewModal.value = true
}

const handleReviewSuccess = () => {
    showReviewModal.value = false
    fetchChains()
}

watch(isModalOpen, (val) => {
    if (!val) activeChatId.value = null
})

const fetchMyCompany = async () => {
    try {
        const response = await companyService.getMyCompany()
        if (response.success) {
            myCompany.value = response.company
            if (myCompany.value) fetchChains() // Renamed from fetchMyChains
        }
    } catch (error) {
        console.error('Fetch company error:', error)
    } finally {
        if (!myCompany.value) loading.value = false
    }
}

// Renamed from fetchMyChains to fetchChains
const fetchChains = async () => {
    loading.value = true
    try {
        const response = await barterService.getMyChains()
        if (response.success && response.data) {
            chains.value = response.data
        }
    } catch (error) {
        console.error('Fetch my chains error:', error)
    } finally {
        loading.value = false
    }
}

const acceptOffer = async (offerId) => {
    if (!confirm('Bu takas teklifini onaylıyor musunuz?')) return

    actionLoading.value = true
    try {
        const response = await barterService.acceptOffer(offerId)

        if (response.success) {
            useNuxtApp().$toast.success(response.message)
            await fetchChains() // Renamed from fetchMyChains
        }
    } catch (error) {
        console.error('Accept offer error:', error)
        useNuxtApp().$toast.error('İşlem başarısız: ' + (error.data?.error || error.message))
    } finally {
        actionLoading.value = false
    }
}

const rejectOffer = async (offerId) => {
    const reason = prompt('Reddetme nedeniniz nedir? (Opsiyonel)')
    if (reason === null) return // İptal'e basıldı

    actionLoading.value = true
    try {
        const response = await barterService.rejectOffer(offerId)

        if (response.success) {
            useNuxtApp().$toast.info('Teklif reddedildi. Zincir iptal edildi.')
            await fetchChains() // Renamed from fetchMyChains
        }
    } catch (error) {
        console.error('Reject offer error:', error)
        useNuxtApp().$toast.error('İşlem başarısız: ' + (error.data?.error || error.message))
    } finally {
        actionLoading.value = false
    }
}

const showChainDetails = (chain) => {
    selectedChain.value = chain
    isModalOpen.value = true
}

const formatCurrency = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val || 0)
}

const getMainImage = (item) => {
    if (item?.images && item.images.length > 0) {
        const img = item.images[0]
        return typeof img === 'string' ? img : img.url
    }
    return '/placeholder-surplus.jpg'
}

// Helpers
const isMyOffer = (offer) => {
    const myCompanyId = myCompany.value?.id
    return offer.toCompanyId === myCompanyId
}

const isMine = (offer) => {
    return offer.fromCompanyId === myCompany.value?.id
}

const getStatusClass = (status) => {
    switch (status) {
        case 'PENDING': return 'bg-amber-100 text-amber-700'
        case 'COMPLETED': return 'bg-green-100 text-green-700'
        case 'FAILED': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })
}

onMounted(async () => {
    await authStore.init()
    if (authStore.isAuthenticated) {
        fetchMyCompany()
    } else {
        loading.value = false
        navigateTo('/login')
    }
})
</script>
