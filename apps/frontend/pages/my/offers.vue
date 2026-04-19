<template>
  <div class="py-8">
    <div class="mb-12">
      <h1 class="text-4xl font-black text-gray-900 tracking-tightest leading-none mb-2 italic">
        TAKAS TEKLİFLERİM
      </h1>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">
        Gelen ve giden tüm takas
        taleplerini buradan yönetebilirsiniz.
      </p>
    </div>

    <!-- Review Modal -->
    <div
      v-if="showReviewModal"
      class="fixed inset-0 z-[600] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
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

    <!-- Tabs -->
    <div
      class="flex items-center space-x-2 mb-10 p-1 bg-gray-100 rounded-[2rem] w-fit border border-gray-200 shadow-inner"
    >
      <button
        class="px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
        :class="activeTab === 'received' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'"
        @click="activeTab = 'received'"
      >
        Gelen Teklifler
      </button>
      <button
        class="px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
        :class="activeTab === 'sent' ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'"
        @click="activeTab = 'sent'"
      >
        Giden Teklifler
      </button>
    </div>

    <!-- Offers List -->
    <div
      v-if="loading"
      class="space-y-6"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="h-48 bg-gray-50 rounded-[2.5rem] animate-pulse"
      />
    </div>

    <div
      v-else-if="offers.length > 0"
      class="space-y-6"
    >
      <div
        v-for="offer in offers"
        :key="offer.id"
        class="group bg-white rounded-[3rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 relative overflow-hidden ring-1 ring-black/[0.02]"
      >
        <div
          class="absolute right-0 top-0 w-32 h-32 bg-gray-50 -rotate-12 translate-x-12 -translate-y-12 rounded-[3rem] group-hover:bg-primary-50 transition-colors"
        />

        <div class="relative flex flex-col lg:flex-row lg:items-center gap-8">
          <!-- Trade Flow Visual -->
          <div class="flex items-center space-x-4 lg:w-1/3">
            <div class="flex flex-col items-center">
              <div
                class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-2"
              >
                <img
                  v-if="offer.offeredItem?.images?.[0]"
                  :src="getMainImage(offer.offeredItem)"
                  class="w-full h-full object-cover rounded-xl"
                >
                <ArchiveBoxIcon
                  v-else
                  class="h-6 w-6 text-gray-300"
                />
              </div>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">
                {{
                  offer.offeredItem?.title || 'NAKİT' }}
              </p>
            </div>

            <div class="flex flex-col items-center flex-1">
              <ArrowsRightLeftIcon class="h-6 w-6 text-primary-500 mb-2 animate-pulse" />
              <div class="h-0.5 w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            </div>

            <div class="flex flex-col items-center">
              <div
                class="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100 mb-2"
              >
                <img
                  v-if="offer.requestedItem?.images?.[0]"
                  :src="getMainImage(offer.requestedItem)"
                  class="w-full h-full object-cover rounded-xl"
                >
                <ArchiveBoxIcon
                  v-else
                  class="h-6 w-6 text-gray-300"
                />
              </div>
              <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter truncate max-w-[80px]">
                {{
                  offer.requestedItem?.title }}
              </p>
            </div>
          </div>

          <!-- Offer Details -->
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-3">
              <span
                class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border"
                :class="getStatusClass(offer.status)"
              >
                {{ getStatusText(offer.status) }}
              </span>
              <ReviewStatusBadge
                v-if="offer.status === 'COMPLETED' || offer.status === 'ACCEPTED'"
                :trade-offer-id="offer.id"
              />
              <span class="text-xs font-bold text-gray-400 italic">{{ formatDate(offer.createdAt) }}</span>
            </div>

            <h4 class="text-xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">
              {{ activeTab === 'accepted' ? offer.fromCompany.name : offer.toCompany.name }}
            </h4>

            <p class="text-sm font-medium text-gray-500 mb-4 line-clamp-1 italic">
              "{{ offer.message || 'Mesaj bırakılmadı.' }}"
            </p>

            <div class="flex flex-wrap gap-4">
              <div class="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-xl">
                <span class="text-[10px] font-black text-gray-400">NAKİT FARK:</span>
                <span
                  class="text-xs font-black"
                  :class="offer.cashDifference > 0 ? 'text-red-500' : 'text-green-500'"
                >
                  {{ formatCurrency(offer.cashDifference) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div
            v-if="activeTab === 'received'"
            class="flex gap-2 lg:flex-col lg:w-48"
          >
            <template v-if="['PENDING', 'WAITING_APPROVAL'].includes(offer.status.toUpperCase())">
              <div class="flex gap-2 lg:flex-col">
                <button
                  :disabled="updatingStatus === offer.id"
                  class="flex-1 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95"
                  @click.stop="handleStatusUpdate(offer.id, 'ACCEPTED')"
                >
                  {{ updatingStatus === offer.id ? '...' : 'KABUL ET' }}
                </button>
                <button
                  class="flex-1 bg-white border border-primary-200 text-primary-600 hover:bg-primary-50 rounded-2xl py-3 text-center text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  @click.stop="prepareCounterOffer(offer)"
                >
                  KARŞI TEKLİF
                </button>
                <button
                  :disabled="updatingStatus === offer.id"
                  class="flex-1 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95"
                  @click.stop="handleStatusUpdate(offer.id, 'REJECTED')"
                >
                  REDDET
                </button>
              </div>
            </template>
          </div>
          <div class="flex gap-2 lg:flex-col lg:w-48">
            <button
              class="flex-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-blue-100"
              @click="selectedOffer = offer"
            >
              İNCELE
            </button>
            <template v-if="['ACCEPTED', 'COMPLETED'].includes(offer.status.toUpperCase())">
              <NuxtLink
                :to="`/my/surplus/swap/${offer.id}`"
                class="flex-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-amber-100 flex items-center justify-center"
              >
                TAKASI YÖNET
              </NuxtLink>
              <template v-if="offer.status.toUpperCase() === 'COMPLETED'">
                <button
                  v-if="!hasUserReviewed(offer)"
                  class="flex-1 bg-gray-900 text-white rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-black flex items-center justify-center gap-2"
                  @click="openReviewModal(offer)"
                >
                  <StarIcon class="h-3 w-3 text-amber-400" />
                  DEĞERLENDİR
                </button>
                <div
                  v-else
                  class="flex-1 bg-green-50 text-green-600 border border-green-100 rounded-2xl py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <CheckIcon class="h-3 w-3 text-green-500" />
                  DEĞERLENDİRİLDİ
                </div>
              </template>
            </template>
            <div
              v-else
              class="flex flex-col gap-2"
            >
              <NuxtLink
                :to="'/surplus/' + (offer.requestedItemId || offer.offeredItemId)"
                class="bg-gray-50 border border-gray-100 text-[10px] font-black text-gray-400 hover:text-primary-600 rounded-2xl py-3 text-center uppercase tracking-widest transition-colors italic"
              >
                İLAN GÖR
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-24 bg-white/50 backdrop-blur-md rounded-[4rem] border border-dashed border-gray-200"
    >
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ArrowsRightLeftIcon class="h-10 w-10 text-gray-300" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">
        Henüz teklif bulunmuyor
      </h3>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">
        Takas dünyasına adım atmak
        için
        ilanları inceleyin.
      </p>
    </div>
    <!-- Offer Detail Modal -->
    <div
      v-if="selectedOffer"
      class="fixed inset-0 z-[500] flex items-center justify-center p-4"
    >
      <div
        class="absolute inset-0 bg-gray-900/80 backdrop-blur-md"
        @click="selectedOffer = null"
      />
      <div
        class="relative bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        <div class="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <h2 class="text-2xl font-black text-gray-900 uppercase italic">
            TEKLİF DETAYLARI
          </h2>
          <button
            class="p-2 hover:bg-gray-200 rounded-xl transition-colors"
            @click="selectedOffer = null"
          >
            <XMarkIcon class="h-6 w-6" />
          </button>
        </div>

        <div
          ref="modalContent"
          class="p-8 overflow-y-auto space-y-10 custom-scrollbar"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
            <!-- Flow Arrow -->
            <div
              class="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full border border-gray-100 items-center justify-center shadow-sm"
            >
              <ArrowsRightLeftIcon class="h-6 w-6 text-primary-500" />
            </div>

            <!-- Offered Section -->
            <div class="space-y-6">
              <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2 px-1">
                TEKLİF EDİLEN
              </p>
              <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <img
                  :src="getMainImage(selectedOffer.offeredItem)"
                  class="w-full aspect-video rounded-2xl object-cover mb-4 border"
                >
                <h3 class="text-lg font-black text-gray-900 uppercase leading-none mb-1">
                  {{
                    selectedOffer.offeredItem?.title
                      || 'NAKİT ÖDEME' }}
                </h3>
                <p class="text-xs font-bold text-gray-400 uppercase mb-4">
                  {{ selectedOffer.fromCompany.name }}
                </p>

                <div class="space-y-3 pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-black text-gray-400 uppercase">MİKTAR:</span>
                    <span class="font-black text-gray-900">{{ selectedOffer.offeredQuantity }} {{
                      selectedOffer.offeredItem?.unit }}</span>
                  </div>
                  <div
                    v-if="selectedOffer.offeredItem?.technicalSpecs"
                    class="space-y-2"
                  >
                    <p class="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                      TEKNİK ÖZELLİKLER:
                    </p>
                    <div
                      v-for="(v, k) in selectedOffer.offeredItem.technicalSpecs"
                      :key="k"
                      class="flex justify-between text-[10px]"
                    >
                      <span class="font-bold text-gray-500 uppercase">{{ k }}:</span>
                      <span class="font-black text-gray-900">{{ v }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Requested Section -->
            <div class="space-y-6">
              <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-1">
                İSTENİLEN
              </p>
              <div class="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <img
                  :src="getMainImage(selectedOffer.requestedItem)"
                  class="w-full aspect-video rounded-2xl object-cover mb-4 border"
                >
                <h3 class="text-lg font-black text-gray-900 uppercase leading-none mb-1">
                  {{
                    selectedOffer.requestedItem?.title }}
                </h3>
                <p class="text-xs font-bold text-gray-400 uppercase mb-4">
                  {{ selectedOffer.toCompany.name }}
                </p>

                <div class="space-y-3 pt-4 border-t border-gray-200">
                  <div class="flex justify-between items-center text-xs">
                    <span class="font-black text-gray-400 uppercase">MİKTAR:</span>
                    <span class="font-black text-gray-900">{{ selectedOffer.requestedQuantity }} {{
                      selectedOffer.requestedItem?.unit }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Extra Info -->
          <div class="bg-primary-50 rounded-3xl p-8 border border-primary-100 flex flex-col md:flex-row gap-8">
            <div class="flex-1">
              <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">
                MESAJ
              </p>
              <p class="text-sm font-medium text-primary-900 italic">
                "{{ selectedOffer.message || 'Not bırakılmadı.' }}"
              </p>
            </div>
            <div class="w-full md:w-48 space-y-2">
              <p class="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">
                DENGELEME FARKI
              </p>
              <p
                class="text-xl font-black"
                :class="selectedOffer.cashDifference > 0 ? 'text-red-500' : 'text-green-600'"
              >
                {{ formatCurrency(selectedOffer.cashDifference) }}
              </p>
              <p class="text-[8px] font-bold text-gray-400 uppercase">
                {{ selectedOffer.cashDifference > 0 ? 'Sizin ödemeniz gereken' : 'Alacağınız tutar' }}
              </p>
            </div>
          </div>

          <div
            v-if="showChat"
            id="chat-section"
            class="mt-8 pt-8 border-t border-gray-100 min-h-[600px]"
          >
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-sm font-black text-gray-900 uppercase tracking-widest italic">
                💬 SOHBET
              </h4>
              <button
                class="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest px-4 py-2 bg-gray-50 rounded-lg transition-all"
                @click="showChat = false"
              >
                Sohbeti
                Kapat
              </button>
            </div>
            <ChatWindow :trade-offer-id="selectedOffer.id" />
          </div>
        </div>

        <div
          v-if="activeTab === 'received' && ['PENDING', 'WAITING_APPROVAL'].includes(selectedOffer.status.toUpperCase())"
          class="p-8 bg-white border-t border-gray-100 flex flex-col gap-4 italic font-black uppercase tracking-widest text-[10px]"
        >
          <div class="flex gap-4">
            <button
              class="flex-1 bg-primary-600 text-white rounded-2xl py-4 font-black uppercase text-xs shadow-xl shadow-primary-600/20 transition-all hover:bg-primary-500"
              @click="handleStatusUpdate(selectedOffer.id, 'ACCEPTED'); selectedOffer = null"
            >
              KABUL
              ET
            </button>
            <button
              class="flex-1 bg-white border border-primary-200 text-primary-600 rounded-2xl py-4 font-black uppercase text-xs transition-colors hover:bg-primary-50"
              @click="prepareCounterOffer(selectedOffer); selectedOffer = null"
            >
              KARŞI
              TEKLİF
            </button>
            <button
              class="flex-1 bg-white border border-gray-200 text-red-600 rounded-2xl py-4 font-black uppercase text-xs hover:bg-red-50 transition-colors"
              @click="handleStatusUpdate(selectedOffer.id, 'REJECTED'); selectedOffer = null"
            >
              REDDET
            </button>
          </div>
          <NuxtLink
            v-if="['ACCEPTED', 'COMPLETED'].includes(selectedOffer.status.toUpperCase())"
            :to="`/my/surplus/swap/${selectedOffer.id}`"
            class="w-full py-4 bg-amber-600 text-white font-black rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-amber-500 shadow-lg shadow-amber-600/20"
          >
            <span>⚙️ Takası Yönet</span>
          </NuxtLink>
          <button
            v-if="!showChat"
            class="w-full py-4 bg-gray-50 border border-gray-100 text-gray-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
            @click="handleOpenChat"
          >
            <span>💬 Sohbeti Başlat / Mesaj Gönder</span>
          </button>
        </div>
        <div
          v-else
          class="p-8 bg-white border-t border-gray-100 flex justify-end gap-3"
        >
          <NuxtLink
            v-if="selectedOffer.status === 'ACCEPTED' || selectedOffer.status === 'COMPLETED'"
            :to="`/my/surplus/swap/${selectedOffer.id}`"
            class="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-amber-200 flex items-center gap-2"
          >
            <span>⚙️ Takası Yönet</span>
          </NuxtLink>
          <button
            v-if="!showChat"
            class="px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
            @click="handleOpenChat"
          >
            <span>💬 Sohbeti Aç</span>
          </button>
          <button
            class="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            @click="selectedOffer = null"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>

    <!-- Counter Offer Modal -->
    <TradeOfferModal
      v-if="showCounterModal"
      :item="selectedOfferForCounter.offeredItem"
      :is-counter="true"
      :original-offer="selectedOfferForCounter"
      @close="showCounterModal = false"
      @success="handleCounterSuccess"
    />
  </div>
</template>

<script setup>
import {
  ArrowsRightLeftIcon, ArchiveBoxIcon,
  XMarkIcon,
  StarIcon,
  CheckIcon,
  
} from '@heroicons/vue/24/outline'
import ChatWindow from '~/components/chat/ChatWindow.vue'
import TradeOfferModal from '~/components/modals/TradeOfferModal.vue'
import ReviewStatusBadge from '~/components/trade/ReviewStatusBadge.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

const authStore = useAuthStore()
const { $api } = useApi()
const loading = ref(true)
const activeTab = ref('received')
const offers = ref([])
const myCompany = ref(null)
const showCounterModal = ref(false)
const selectedOfferForCounter = ref(null)
const selectedOffer = ref(null)
const showChat = ref(false)
const updatingStatus = ref(null)

const showReviewModal = ref(false)
const selectedOfferForReview = ref(null)

const hasUserReviewed = (offer) => {
  if (!offer.reviews || !authStore.user) return false
  return offer.reviews.some(r => r.fromUserId === authStore.user.id)
}

const reviewTradeInfo = computed(() => {
  if (!selectedOfferForReview.value) return {}
  const offer = selectedOfferForReview.value
  const isReceived = activeTab.value === 'received'
  const partner = isReceived ? offer.fromCompany : offer.toCompany

  // Try to find a user from the partner company
  let toUserId = null

  if (partner?.users && partner.users.length > 0) {
    // Try nested user object structure first: { user: { id, name } }
    const otherUser = partner.users.find(u => {
      const uid = u.user?.id || u.userId
      return uid && uid !== authStore.user?.id
    })

    if (otherUser) {
      toUserId = otherUser.user?.id || otherUser.userId
    } else {
      // Fallback: just pick first available user from partner company
      const firstUser = partner.users[0]
      toUserId = firstUser?.user?.id || firstUser?.userId
    }
  }

  console.log('[DEBUG] reviewTradeInfo:', {
    offerId: offer.id,
    partnerName: partner?.name,
    partnerUsersCount: partner?.users?.length,
    toUserId,
    partnerUsers: partner?.users?.map(u => ({ userId: u.userId, user: u.user }))
  })

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
  fetchMyOffers()
}

watch(selectedOffer, (val) => {
  if (!val) showChat.value = false
})

watch(showChat, (val) => {
  if (val) {
    nextTick(() => {
      const el = document.getElementById('chat-section')
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
      } else if (modalContent.value) {
        modalContent.value.scrollTo({
          top: modalContent.value.scrollHeight,
          behavior: 'smooth'
        })
      }
    })
  }
})

const modalContent = ref(null)

const handleOpenChat = () => {
  showChat.value = true
}

const fetchMyOffers = async () => {
  loading.value = true
  try {
    // Get company ID first
    if (!myCompany.value) {
      const compRes = await $api('/api/companies/me')
      if (compRes.success) myCompany.value = compRes.company
    }

    if (myCompany.value) {
      const response = await $api('/api/offers/my', {
        query: {
          companyId: myCompany.value.id,
          type: activeTab.value
        }
      })
      if (response.success) {
        offers.value = response.offers

        // Check for specific offerId in query
        const route = useRoute()
        if (route.query.offerId) {
          const offer = offers.value.find(o => o.id === route.query.offerId)
          if (offer) {
            selectedOffer.value = offer
            showChat.value = true // Open chat automatically if linked
          } else if (route.query.type && route.query.type !== activeTab.value) {
            // If not found in current tab and type is specified, retry in other tab
            activeTab.value = route.query.type
            // This will trigger the watch and fetch again
          }
        }
      }
    }
  } catch (error) {
    console.error('Fetch offers error:', error)
  } finally {
    loading.value = false
  }
}

const handleStatusUpdate = async (id, status) => {
  const s = status.toUpperCase()

  if (s === 'ACCEPTED') {
    const isConfirmed = confirm(
      "⚠️ TAKAS ONAYI\n\n" +
      "Bu teklifi kabul ettiğinizde:\n" +
      "• Takas süreci resmen başlayacaktır.\n" +
      "• Varsa teminat tutarı bakiyenizden bloke edilebilir.\n" +
      "• Stok miktarınız otomatik olarak düşülecektir.\n\n" +
      "Devam etmek istediğinize emin misiniz?"
    )
    if (!isConfirmed) return
  } else if (s === 'REJECTED') {
    if (!confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) return
  }

  updatingStatus.value = id
  const toast = useNuxtApp().$toast
  try {
    const endpoint = s === 'ACCEPTED' ? `/api/offers/${id}/accept` : `/api/offers/${id}/status`
    const body = s === 'ACCEPTED' ? {} : { status: s }

    const response = await $api(endpoint, {
      method: 'PATCH',
      body
    })

    if (response.success) {
      toast.success(s === 'ACCEPTED' ? 'Teklif kabul edildi!' : 'Teklif reddedildi.')
      if (selectedOffer.value?.id === id) {
        selectedOffer.value = null
      }
      fetchMyOffers()
    } else {
      toast.error(response.message || 'Bir hata oluştu.')
    }
  } catch (error) {
    console.error('Update status error:', error)
    toast.error(error.data?.message || 'İşlem sırasında bir hata oluştu.')
  } finally {
    updatingStatus.value = null
  }
}

const prepareCounterOffer = (offer) => {
  selectedOfferForCounter.value = offer
  showCounterModal.value = true
}

const handleCounterSuccess = () => {
  showCounterModal.value = false
  fetchMyOffers()
}

const getStatusText = (status) => {
  if (!status) return '-'
  const s = status.toUpperCase()
  switch (s) {
    case 'PENDING': return 'BEKLEMEDE'
    case 'WAITING_APPROVAL': return 'ONAY BEKLİYOR'
    case 'ACCEPTED': return 'KABUL EDİLDİ'
    case 'REJECTED': return 'REDDEDİLDİ'
    case 'COMPLETED': return 'TAMAMLANDI'
    case 'CANCELLED': return 'İPTAL EDİLDİ'
    case 'COUNTER_OFFERED': return 'KARŞI TEKLİF VERİLDİ'
    default: return s
  }
}

const getStatusClass = (status) => {
  if (!status) return 'bg-gray-100 text-gray-800'
  const s = status.toUpperCase()
  switch (s) {
    case 'PENDING':
    case 'WAITING_APPROVAL':
      return 'bg-yellow-100 text-yellow-800'
    case 'ACCEPTED':
    case 'COMPLETED':
      return 'bg-green-100 text-green-800'
    case 'REJECTED':
    case 'CANCELLED':
      return 'bg-red-100 text-red-800'
    case 'COUNTER_OFFERED':
      return 'bg-blue-100 text-blue-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
}

const formatCurrency = (val) => {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val)
}

const getMainImage = (item) => {
  if (item?.images && item.images.length > 0) {
    const img = item.images[0]
    return typeof img === 'string' ? img : img.url
  }
  return '/placeholder-surplus.jpg'
}

watch(activeTab, fetchMyOffers)

onMounted(() => {
  const route = useRoute()
  if (route.query.type) {
    activeTab.value = route.query.type
  }
  fetchMyOffers()
})
</script>
