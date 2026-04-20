<template>
  <div class="min-h-screen bg-[#f8fafc] pb-24">
    <!-- Hero Section -->
    <AuctionHero :auction="auction" :countdown="countdown" />

    <div class="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
      <div v-if="loading" class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div class="lg:col-span-8 h-[600px] bg-white rounded-[4rem] animate-pulse shadow-2xl" />
        <div class="lg:col-span-4 h-[600px] bg-white rounded-[4rem] animate-pulse shadow-2xl" />
      </div>

      <div v-else-if="auction" class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <!-- Left Column -->
        <div class="lg:col-span-8 space-y-10">
          <AuctionProductInfo :auction="auction" />
        </div>

        <!-- Right Column -->
        <div class="lg:col-span-4 space-y-10 lg:sticky lg:top-10">
          <AuctionBidding
            :auction="auction"
            :participation="participation"
            :is-highest-bidder="isHighestBidder"
            :is-eligible-to-claim="isEligibleToClaim"
            :min-next-bid="minNextBid"
            :loading="bidding"
            :claiming="claiming"
            :bids="bids"
            @participate="handleParticipate"
            @place-bid="handlePlaceBid"
            @claim="handleClaim"
          />

          <AuctionBidHistory :bids="bids" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AuctionHero from '~/components/auction/detail/AuctionHero.vue'
import AuctionProductInfo from '~/components/auction/detail/AuctionProductInfo.vue'
import AuctionBidding from '~/components/auction/detail/AuctionBidding.vue'
import AuctionBidHistory from '~/components/auction/detail/AuctionBidHistory.vue'

definePageMeta({ layout: 'default' })
useHead({ title: 'AÇIK ARTIRMA // BAZARX' })

const {
  auction, bids, loading, bidding, claiming, participation, countdown,
  minNextBid, isHighestBidder, isEligibleToClaim,
  handleParticipate, handlePlaceBid, handleClaim
} = useAuctionDetail()
</script>

<style scoped>
.tracking-tightest { letter-spacing: -0.05em; }
</style>