<template>
  <div class="py-12 max-w-5xl mx-auto px-4 lg:px-0">
    <!-- Yükleme -->
    <div v-if="loading" class="space-y-8 animate-pulse">
      <div class="h-14 w-80 bg-gray-100 rounded-2xl" />
      <div class="h-20 bg-gray-50 rounded-[40px]" />
      <div class="h-96 bg-gray-50 rounded-[40px]" />
    </div>

    <!-- Hata: session yok -->
    <div v-else-if="!session" class="text-center py-32">
      <p class="text-sm font-bold text-gray-400 uppercase tracking-widest">Swap session bulunamadı.</p>
      <NuxtLink to="/ticaritakas/inbox" class="mt-6 inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all">
        ← INBOX'A DÖN
      </NuxtLink>
    </div>

    <!-- Ana İçerik -->
    <div v-else class="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Header -->
      <SwapHeader
        :session="session"
        :chat-link="chatLink"
        :status="currentStatusStyle"
        :loading="loading"
        @refresh="fetchSession"
      />

      <!-- Stepper -->
      <SwapStepper
        :steps="steps"
        :progress-percent="progressPercent"
      />

      <!-- Durum Kartı + Aksiyon -->
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

    <!-- Anlaşmazlık Modal -->
    <SwapDisputeModal
      v-model:reason="disputeReason"
      :show="showDisputeModal"
      @close="showDisputeModal = false"
      @submit="sendDispute"
    />

    <!-- Değerlendirme Modal -->
    <Teleport to="body">
      <div v-if="showReviewModal" class="fixed inset-0 z-[600] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-gray-900/60 backdrop-blur-md" @click="showReviewModal = false" />
        <ReviewForm
          class="relative max-w-xl"
          :trade-info="reviewTradeInfo"
          @success="handleReviewSuccess"
          @cancel="showReviewModal = false"
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import SwapHeader from '~/components/ticaritakas/swap/SwapHeader.vue'
import SwapStepper from '~/components/ticaritakas/swap/SwapStepper.vue'
import SwapStatusCard from '~/components/ticaritakas/swap/SwapStatusCard.vue'
import SwapSummary from '~/components/ticaritakas/swap/SwapSummary.vue'
import SwapDisputeModal from '~/components/ticaritakas/swap/SwapDisputeModal.vue'
import ReviewForm from '~/components/trade/ReviewForm.vue'

definePageMeta({ middleware: ['auth'] })

const route = useRoute()
const sessionId = computed(() => route.params.id as string)
const showDisputeModal = ref(false)
const showReviewModal = ref(false)

const {
  session, loading, actionLoading,
  shippingCode, disputeReason,
  isFromCompany,
  isMyCollateralLocked, isMyShippingInfoProvided,
  isMyReceiptConfirmed, isMyFinalized,
  getMyShippingCode,
  fetchSession, fetchMyCompany,
  lockCollateral, submitShipping, confirmReceipt, finalizeSwap, sendDispute,
} = useSwapSession(sessionId)

// ─── Durum Stilleri (Backend enum'larına göre düzeltildi) ────────────────────
interface StatusStyle {
  label: string
  class: string
  description: string
}

const statusStyles: Record<string, StatusStyle> = {
  PENDING_COLLATERAL: {
    label:       'TEMİNAT BEKLENİYOR',
    class:       'bg-amber-50 text-amber-700 border-amber-100',
    description: 'Güvenli takas için tarafların teminat kilitlemesi bekleniyor.',
  },
  ACTIVE: {
    label:       'TEMİNATLAR KİLİTLENDİ',
    class:       'bg-indigo-50 text-indigo-700 border-indigo-100',
    description: 'Teminatlar kilitlendi. Gönderim aşamasına geçilebilir.',
  },
  SHIPPING: {
    label:       'KARGO / TESLİMAT',
    class:       'bg-blue-50 text-blue-700 border-blue-100',
    description: 'Ürünlerin kargolanması ve takip bilgilerinin girilmesi bekleniyor.',
  },
  PARTIALLY_COMPLETED: {
    label:       'İNCELEME DÖNEMİ',
    class:       'bg-amber-50 text-amber-700 border-amber-100',
    description: 'Ürün teslim alındı. 3 günlük inceleme süresi devam ediyor.',
  },
  COMPLETED: {
    label:       'TAMAMLANDI',
    class:       'bg-green-50 text-green-700 border-green-100',
    description: 'Takas başarıyla tamamlandı. Teminatlar iade edildi.',
  },
  DISPUTED: {
    label:       'ANLAŞMAZLIK',
    class:       'bg-red-50 text-red-700 border-red-100',
    description: 'Anlaşmazlık bildirimi yapıldı. Admin incelemesine alındı.',
  },
  CANCELLED: {
    label:       'İPTAL EDİLDİ',
    class:       'bg-gray-50 text-gray-500 border-gray-100',
    description: 'Bu takas süreci iptal edildi.',
  },
  TIMEOUT: {
    label:       'ZAMAN AŞIMI',
    class:       'bg-gray-50 text-gray-500 border-gray-100',
    description: 'Takas süresi doldu, otomatik iptal edildi.',
  },
}

const currentStatusStyle = computed(
  (): StatusStyle => statusStyles[session.value?.status ?? ''] ?? statusStyles['PENDING_COLLATERAL']
)

// ─── Stepper mantığı (Backend enum'larına göre) ──────────────────────────────
const SHIPPING_STATUSES = ['SHIPPING', 'PARTIALLY_COMPLETED', 'COMPLETED']
const INSPECTION_STATUSES = ['PARTIALLY_COMPLETED', 'COMPLETED']

const steps = computed(() => [
  { label: 'TEMİNAT',  active: true },
  { label: 'GÖNDERİM', active: SHIPPING_STATUSES.includes(session.value?.status ?? '') },
  { label: 'İNCELEME', active: INSPECTION_STATUSES.includes(session.value?.status ?? '') },
  { label: 'SONUÇ',    active: session.value?.status === 'COMPLETED' },
])

const progressPercent = computed((): number => {
  const map: Record<string, number> = {
    PENDING_COLLATERAL:  0,
    ACTIVE:             25,
    SHIPPING:           50,
    PARTIALLY_COMPLETED: 75,
    COMPLETED:          100,
  }
  return map[session.value?.status ?? ''] ?? 0
})

// ─── Faz flag'leri (StatusCard prop'ları) ────────────────────────────────────
const isShippingPhase = computed(
  (): boolean => ['ACTIVE', 'SHIPPING'].includes(session.value?.status ?? '')
)
const isInspectionPhase = computed(
  (): boolean => session.value?.status === 'PARTIALLY_COMPLETED'
)
const isCompletedPhase = computed(
  (): boolean => session.value?.status === 'COMPLETED'
)

// ─── Chat linki ──────────────────────────────────────────────────────────────
const chatLink = computed((): string => {
  if (!session.value) return '/my/offers'
  const offerId = session.value.tradeOfferId
  const type = isFromCompany.value ? 'sent' : 'received'
  return `/my/offers?offerId=${offerId}&type=${type}`
})

// ─── İnceleme süresi geri sayımı (placeholder) ───────────────────────────────
const timeLeft = ref('72:00:00')

// ─── Değerlendirme bilgisi ────────────────────────────────────────────────────
const reviewTradeInfo = computed(() => {
  if (!session.value) return {}
  const offer = session.value.tradeOffer
  const partnerCompany = isFromCompany.value ? offer?.toCompany : offer?.fromCompany
  return {
    tradeId:     session.value.tradeOfferId,
    partnerName: partnerCompany?.name ?? '',
    toUserId:    '',
  }
})

const handleReviewSuccess = async (): Promise<void> => {
  showReviewModal.value = false
  await fetchSession()
}

onMounted(async () => {
  await fetchMyCompany()
  await fetchSession()
})
</script>
