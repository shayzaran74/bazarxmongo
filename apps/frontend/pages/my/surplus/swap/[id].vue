<template>
  <div class="py-12 max-w-5xl mx-auto px-4 lg:px-0">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-8 animate-pulse">
      <div class="h-14 w-80 bg-gray-100 rounded-2xl" />
      <div class="h-96 bg-gray-50 rounded-[40px]" />
    </div>

    <!-- Main Content -->
    <div v-else-if="session" class="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SwapHeader 
        :session="session"
        :chat-link="chatLink"
        :status="currentStatusStyle"
        :loading="loading"
        @refresh="fetchSession"
      />

      <SwapStepper 
        :steps="steps"
        :progress-percent="progressPercent"
      />

      <SwapStatusCard 
        v-model:shipping-code="shippingCode"
        :status-key="session.status"
        :status-style="currentStatusStyle"
        :is-my-collateral-locked="isMyCollateralLocked"
        :is-my-shipping-info-provided="isMyShippingInfoProvided"
        :is-my-receipt-confirmed="isMyReceiptConfirmed"
        :is-my-finalized="isMyFinalized"
        :my-shipping-code="getMyShippingCode"
        :action-loading="actionLoading"
        :time-left="timeLeft"
        :is-shipping-phase="isShippingPhase"
        :is-inspection-phase="isInspectionPhase"
        :is-completed-phase="isCompletedPhase"
        @lock-collateral="lockCollateral"
        @submit-shipping="submitShipping"
        @confirm-receipt="confirmReceipt"
        @finalize="finalizeSwap"
        @dispute="showDisputeModal = true"
        @review="showReviewModal = true"
      >
        <template #summary>
          <SwapSummary :session="session" />
        </template>
      </SwapStatusCard>
    </div>

    <!-- Modals -->
    <SwapDisputeModal 
      v-model:reason="disputeReason"
      :show="showDisputeModal"
      @close="showDisputeModal = false"
      @submit="sendDispute"
    />

    <Teleport to="body">
      <div v-if="showReviewModal" class="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="showReviewModal = false" />
        <ReviewForm class="relative max-w-xl" :trade-info="reviewTradeInfo" @success="handleReviewSuccess" @cancel="showReviewModal = false" />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { useSwapSession } from '~/composables/useSwapSession'
import { LockClosedIcon, TruckIcon, DocumentMagnifyingGlassIcon, ShieldCheckIcon } from '@heroicons/vue/24/outline'

import SwapHeader from '~/components/my/surplus/swap/SwapHeader.vue'
import SwapStepper from '~/components/my/surplus/swap/SwapStepper.vue'
import SwapStatusCard from '~/components/my/surplus/swap/SwapStatusCard.vue'
import SwapSummary from '~/components/my/surplus/swap/SwapSummary.vue'
import SwapDisputeModal from '~/components/my/surplus/swap/SwapDisputeModal.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

const route = useRoute()
const showDisputeModal = ref(false)
const showReviewModal = ref(false)

const {
  session, loading, actionLoading, myCompany, shippingCode, disputeReason,
  isFromCompany, isMyCollateralLocked, isMyShippingInfoProvided, 
  getMyShippingCode, isMyReceiptConfirmed, isMyFinalized,
  fetchSession, fetchMyCompany, lockCollateral, submitShipping, confirmReceipt, finalizeSwap, sendDispute
} = useSwapSession(route.params.id)

// Status Config
const statusStyles = {
  'PENDING_COLLATERAL':   { label: 'TEMİNAT BEKLENİYOR', icon: LockClosedIcon, class: 'bg-amber-50 text-amber-700 border-amber-100', description: 'Güvenli takas için tarafların teminat kilitlemesi bekleniyor.' },
  'COLLATERAL_DEPOSITED': { label: 'TEMİNATLAR ALINDI', icon: LockClosedIcon, class: 'bg-indigo-50 text-indigo-700 border-indigo-100', description: 'Teminatlar kilitlendi. Gönderim aşamasına geçilebilir.' },
  'SHIPPING_IN_PROGRESS': { label: 'KARGO / TESLİMAT', icon: TruckIcon, class: 'bg-blue-50 text-blue-700 border-blue-100', description: 'Ürünlerin kargolanması ve takip bilgilerinin girilmesi bekleniyor.' },
  'INSPECTION_PERIOD':   { label: 'İNCELEME DÖNEMİ', icon: DocumentMagnifyingGlassIcon, class: 'bg-amber-50 text-amber-700 border-amber-100', description: 'Ürün teslim alındı. 48 saatlik inceleme süreci devam ediyor.' },
  'COMPLETED':            { label: 'TAMAMLANDI', icon: ShieldCheckIcon, class: 'bg-green-50 text-green-700 border-green-100', description: 'Takas başarıyla tamamlandı. Teminatlar iade edildi.' }
}

const currentStatusStyle = computed(() => statusStyles[session.value?.status?.toUpperCase()] || statusStyles['PENDING_COLLATERAL'])

// Stepper Logic
const steps = computed(() => [
  { label: 'TEMİNAT', icon: LockClosedIcon, active: true },
  { label: 'GÖNDERİM', icon: TruckIcon, active: ['SHIPPING_IN_PROGRESS', 'IN_TRANSIT', 'DELIVERED', 'INSPECTION_PERIOD', 'COMPLETED'].includes(session.value?.status) },
  { label: 'İNCELEME', icon: DocumentMagnifyingGlassIcon, active: ['INSPECTION_PERIOD', 'COMPLETED'].includes(session.value?.status) },
  { label: 'SONUÇ', icon: ShieldCheckIcon, active: ['COMPLETED'].includes(session.value?.status) }
])

const progressPercent = computed(() => {
  const map = { 'PENDING_COLLATERAL': 0, 'COLLATERAL_DEPOSITED': 25, 'SHIPPING_IN_PROGRESS': 50, 'INSPECTION_PERIOD': 75, 'COMPLETED': 100 }
  return map[session.value?.status] ?? 0
})

// Phase Helpers
const isShippingPhase = computed(() => ['SHIPPING_IN_PROGRESS', 'IN_TRANSIT', 'DELIVERED'].includes(session.value?.status))
const isInspectionPhase = computed(() => ['INSPECTION', 'INSPECTION_PERIOD'].includes(session.value?.status))
const isCompletedPhase = computed(() => ['COMPLETED', 'FUNDS_RELEASED'].includes(session.value?.status))

const chatLink = computed(() => `/my/offers?offerId=${session.value.offer.id}&type=${isFromCompany.value ? 'sent' : 'received'}`)
const timeLeft = ref('48:00:00') // Placeholder for real countdown

// Review Logic
const reviewTradeInfo = computed(() => ({
  tradeId: session.value.offerId,
  partnerName: isFromCompany.value ? session.value.offer.toCompany.name : session.value.offer.fromCompany.name,
  toUserId: isFromCompany.value ? session.value.offer.toCompany.users[0]?.userId : session.value.offer.fromCompany.users[0]?.userId
}))
const handleReviewSuccess = () => { showReviewModal.value = false; fetchSession() }

onMounted(async () => {
  await fetchMyCompany()
  await fetchSession()
})
</script>
