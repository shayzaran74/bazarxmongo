<template>
  <div class="py-12 lg:py-20 italic">
    <!-- Header -->
    <div class="mb-16 space-y-4">
      <div class="flex items-center gap-6">
        <div class="p-4 bg-indigo-600 rounded-[1.5rem] shadow-2xl animate-pulse flex items-center justify-center">
           <span class="text-2xl">🤝</span>
        </div>
        <h1 class="text-5xl lg:text-7xl font-black text-gray-900 tracking-tightest uppercase italic leading-none">TAKAS <span class="text-indigo-600">PROTOKOLLERİ</span></h1>
      </div>
      <p class="text-gray-400 font-black text-sm uppercase tracking-widest leading-tight max-w-2xl opacity-70">SİZE ÖNERİLEN AKILLI TAKAS ZİNCİRLERİNİ İNCELEYİN VE ONAY PROTOKOLLERİNİ BAŞLATIN.</p>
    </div>

    <!-- State Views -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-44 space-y-10">
      <div class="w-16 h-16 border-[6px] border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
      <p class="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">ZİNCİR TAKASLAR ANALİZ EDİLİYOR...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="chains.length === 0" class="text-center py-32 bg-white/50 backdrop-blur-3xl rounded-[4rem] border-4 border-dashed border-neutral-100 shadow-inner group">
      <div class="w-24 h-24 bg-neutral-50 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl group-hover:scale-110 transition-transform">
        <span class="text-4xl text-neutral-300">🔗</span>
      </div>
      <h3 class="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tightest">HENÜZ BİR TEKLİF YOK</h3>
      <p class="text-sm font-black text-gray-400 max-w-md mx-auto mb-12 uppercase tracking-widest opacity-70">İHTİYAÇLARINIZI VE FAZLA MALLARINIZI GİRDİKÇE SİSTEM SİZE UYGUN TAKASLAR ÖNERECEKTİR.</p>
      <div class="flex flex-wrap justify-center gap-6">
        <NuxtLink to="/dashboard/wanted-items" class="h-16 px-12 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:bg-black transition-all shadow-2xl shadow-indigo-100 active:scale-95 flex items-center justify-center">İSTEK EKLE</NuxtLink>
        <NuxtLink to="/my/surplus" class="h-16 px-12 bg-white border border-neutral-200 text-gray-400 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] hover:text-black transition-all shadow-sm active:scale-95 flex items-center justify-center">FAZLA MAL EKLE</NuxtLink>
      </div>
    </div>

    <!-- List -->
    <div v-else class="space-y-12">
      <TradeChainCard v-for="chain in chains" :key="chain.id" :chain="chain" :loading="actionLoading" @view="(c) => { selectedChain = c; isModalOpen = true }" @accept="acceptOffer" @reject="rejectOffer" />
    </div>

    <!-- Modals -->
    <TradeDetailModal :is-open="isModalOpen" :chain="selectedChain" v-model:active-chat-id="activeChatId" @close="isModalOpen = false" @chat="(id) => activeChatId = activeChatId === id ? null : id" />

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="fixed inset-0 z-[200] flex items-center justify-center p-6 italic">
      <div class="fixed inset-0 bg-gray-900/60 backdrop-blur-md" @click="showReviewModal = false" />
      <div class="relative w-full max-w-xl animate-in">
        <ReviewForm :trade-info="reviewTradeInfo" @success="showReviewModal = false; fetchChains()" @cancel="showReviewModal = false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TradeChainCard from '~/components/trade/TradeChainCard.vue'
import TradeDetailModal from '~/components/trade/TradeDetailModal.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

definePageMeta({ layout: 'default', middleware: 'auth' })
useHead({ title: 'TAKAS TEKLİFLERİM // BAZARX' })

const {
  chains, myCompany, loading, actionLoading, isModalOpen, selectedChain, activeChatId,
  showReviewModal, selectedOfferForReview,
  fetchChains, acceptOffer, rejectOffer
} = useTradeChains()

const reviewTradeInfo = computed(() => {
    if (!selectedOfferForReview.value) return {}
    const offer = selectedOfferForReview.value
    const isImSender = offer.fromCompanyId === myCompany.value?.id
    const partner = isImSender ? offer.toCompany : offer.fromCompany
    return {
        tradeId: offer.id,
        partnerName: partner?.name,
        fromImage: offer.offeredItem?.images?.[0]?.url || '/placeholder.jpg',
        toImage: offer.requestedItem?.images?.[0]?.url || '/placeholder.jpg',
        toUserId: partner?.users?.[0]?.userId
    }
})
</script>
