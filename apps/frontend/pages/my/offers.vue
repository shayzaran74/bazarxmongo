<template>
  <div class="py-8">
    <div class="mb-12">
      <h1 class="text-4xl font-black text-gray-900 tracking-tightest leading-none mb-2 italic">TAKAS TEKLİFLERİM</h1>
      <p class="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Gelen ve giden tüm takas taleplerini buradan yönetebilirsiniz.</p>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 z-[600] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="showReviewModal = false" />
      <div class="relative w-full max-w-xl">
        <ReviewForm :trade-info="reviewTradeInfo" @success="handleReviewSuccess" @cancel="showReviewModal = false" />
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex items-center space-x-2 mb-10 p-1 bg-gray-100 rounded-[2rem] w-fit border border-gray-200 shadow-inner">
      <button
        v-for="tab in ['received', 'sent']" :key="tab"
        class="px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all"
        :class="activeTab === tab ? 'bg-white text-primary-600 shadow-xl' : 'text-gray-400 hover:text-gray-600'"
        @click="activeTab = tab"
      >
        {{ tab === 'received' ? 'Gelen Teklifler' : 'Giden Teklifler' }}
      </button>
    </div>

    <!-- Offers List -->
    <div v-if="loading" class="space-y-6">
      <div v-for="i in 3" :key="i" class="h-48 bg-gray-50 rounded-[2.5rem] animate-pulse" />
    </div>

    <div v-else-if="offers.length > 0" class="space-y-6">
      <MyOfferItem
        v-for="offer in offers" :key="offer.id"
        :offer="offer"
        :active-tab="activeTab"
        :updating-status="updatingStatus"
        :has-reviewed="hasUserReviewed(offer)"
        @view="selectedOffer = offer"
        @counter="prepareCounterOffer"
        @update-status="handleStatusUpdate"
        @review="openReviewModal"
      />
    </div>

    <div v-else class="text-center py-24 bg-white/50 backdrop-blur-md rounded-[4rem] border border-dashed border-gray-200">
      <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ArrowsRightLeftIcon class="h-10 w-10 text-gray-300" />
      </div>
      <h3 class="text-2xl font-black text-gray-900 mb-2 uppercase italic tracking-tight">Henüz teklif bulunmuyor</h3>
      <p class="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Takas dünyasına adım atmak için ilanları inceleyin.</p>
    </div>

    <!-- Detail Modal -->
    <OfferDetailModal
      v-if="selectedOffer"
      :offer="selectedOffer"
      :active-tab="activeTab"
      @close="selectedOffer = null"
      @accept="handleStatusUpdate({ id: $event, status: 'ACCEPTED' })"
      @counter="prepareCounterOffer"
      @reject="handleStatusUpdate({ id: $event, status: 'REJECTED' })"
    />

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
import { ArrowsRightLeftIcon } from '@heroicons/vue/24/outline'
import MyOfferItem from '~/components/trade/MyOfferItem.vue'
import OfferDetailModal from '~/components/trade/OfferDetailModal.vue'
import TradeOfferModal from '~/components/modals/TradeOfferModal.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

const { loading, offers, activeTab, updatingStatus, fetchMyOffers, updateStatus } = useTradeOffers()
const authStore = useAuthStore()

const selectedOffer = ref(null)
const showCounterModal = ref(false)
const selectedOfferForCounter = ref(null)
const showReviewModal = ref(false)
const selectedOfferForReview = ref(null)

const hasUserReviewed = (offer) => {
  if (!offer.reviews || !authStore.user) return false
  return offer.reviews.some(r => r.fromUserId === authStore.user.id)
}

const openReviewModal = (offer) => {
  selectedOfferForReview.value = offer
  showReviewModal.value = true
}

const handleReviewSuccess = () => {
  showReviewModal.value = false
  fetchMyOffers()
}

const prepareCounterOffer = (offer) => {
  selectedOfferForCounter.value = offer
  showCounterModal.value = true
}

const handleCounterSuccess = () => {
  showCounterModal.value = false
  fetchMyOffers()
}

const handleStatusUpdate = async ({ id, status }) => {
  if (status === 'ACCEPTED' && !confirm('Takas sürecini başlatmak üzeresiniz. Emin misiniz?')) return
  if (status === 'REJECTED' && !confirm('Teklifi reddetmek istediğinize emin misiniz?')) return
  
  const success = await updateStatus(id, status)
  if (success && selectedOffer.value?.id === id) selectedOffer.value = null
}

const reviewTradeInfo = computed(() => {
  if (!selectedOfferForReview.value) return {}
  const offer = selectedOfferForReview.value
  const partner = activeTab.value === 'received' ? offer.fromCompany : offer.toCompany
  let toUserId = partner?.users?.[0]?.userId || partner?.users?.[0]?.user?.id
  
  return {
    tradeId: offer.id,
    partnerName: partner?.name,
    fromImage: offer.offeredItem?.images?.[0]?.url || offer.offeredItem?.images?.[0],
    toImage: offer.requestedItem?.images?.[0]?.url || offer.requestedItem?.images?.[0],
    toUserId
  }
})

watch(activeTab, fetchMyOffers)
onMounted(() => {
  const route = useRoute()
  if (route.query.type) activeTab.value = route.query.type
  if (route.query.offerId) {
     // logic for initial offer select could go here if needed
  }
  fetchMyOffers()
})
</script>
