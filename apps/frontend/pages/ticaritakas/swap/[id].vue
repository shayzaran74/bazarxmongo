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

      <!-- BarterPart Teslimat Takibi -->
      <div
        v-if="sessionParts.length"
        class="bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 mb-8"
      >
        <h3 class="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8 italic">
          TESLİMAT AŞAMALARI ({{ sessionParts.length }} PARÇA)
        </h3>
        <div class="space-y-4">
          <div
            v-for="part in sessionParts"
            :key="part.id"
            class="flex items-center gap-5 p-5 rounded-3xl border transition-all"
            :class="partCardClass(part.status)"
          >
            <!-- Parça numarası -->
            <div
              class="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
              :class="partBadgeClass(part.status)"
            >
              {{ part.partNumber }}
            </div>

            <!-- Detay -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <span class="text-[10px] font-black uppercase tracking-widest" :class="partLabelClass(part.status)">
                  {{ partStatusLabel(part.status) }}
                </span>
                <span v-if="part.trackingCode" class="text-[9px] text-gray-400 font-bold italic truncate">
                  {{ part.trackingCode }}
                </span>
              </div>
              <div class="text-[9px] text-gray-500 font-bold mb-1">
                <span class="text-indigo-600">{{ companyName(part.senderId) }}</span>
                <span class="mx-1 text-gray-300">→</span>
                <span>{{ companyName(part.recipientId) }}</span>
              </div>
              <div class="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                <span v-if="part.shippedAt">GÖNDERİM: {{ formatPartDate(part.shippedAt) }}</span>
                <span v-else-if="part.status === 'PENDING'">GÖNDERIM BEKLENİYOR</span>
                <span v-if="part.confirmedAt"> · ONAY: {{ formatPartDate(part.confirmedAt) }}</span>
              </div>
            </div>

            <!-- İtiraz süresi göstergesi -->
            <div
              v-if="part.disputeWindowEndsAt && part.status === 'SHIPPED'"
              class="text-right shrink-0"
            >
              <div class="text-[9px] font-black text-amber-600 uppercase tracking-widest">İTİRAZ SÜRESİ</div>
              <div class="text-xs font-black text-amber-700 tabular-nums">
                {{ formatDisputeWindow(part.disputeWindowEndsAt) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Durum Kartı + Aksiyon -->
      <SwapStatusCard
        v-model:shipping-code="shippingCode"
        :status-key="session.status"
        :status-style="{ ...currentStatusStyle, digitalMode: isDigitalMode }"
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

const isDigitalMode = computed(() => session.value?.shipmentMode === 'DIGITAL')

// SwapStepper steps — teminat otomatik kilitlendiği için ACTIVE sonrası ✓ tamamlandı
const collateralIsDone = (status: string): boolean =>
  ['ACTIVE', 'SHIPPING', 'PARTIALLY_COMPLETED', 'COMPLETED', 'PENDING_RELEASE'].includes(status)

const steps = computed(() => [
  { label: 'TEMİNAT',  active: !collateralIsDone(session.value?.status ?? ''), done: collateralIsDone(session.value?.status ?? '') },
  { label: session.value?.shipmentMode === 'DIGITAL' ? 'DİJİTAL TESLİM' : 'GÖNDERİM', active: ['SHIPPING', 'PARTIALLY_COMPLETED'].includes(session.value?.status ?? ''), done: ['COMPLETED', 'PARTIALLY_COMPLETED'].includes(session.value?.status ?? '') },
  { label: 'İNCELEME', active: session.value?.status === 'PARTIALLY_COMPLETED', done: session.value?.status === 'COMPLETED' },
  { label: 'SONUÇ',    active: session.value?.status === 'COMPLETED', done: false },
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
  if (!session.value) return '/ticaritakas/inbox'
  // Teklif detay sayfasına yönlendir (my/offers modal içi sohbet)
  return `/my/offers?offerId=${session.value.tradeOfferId}&type=received`
})

// ─── İnceleme süresi geri sayımı (BarterPart.disputeWindowEndsAt'ten hesaplanır) ─
const disputeDeadline = computed((): Date | null => {
  const parts: Array<{ disputeWindowEndsAt?: string; status?: string }> =
    (session.value as unknown as { parts?: Array<{ disputeWindowEndsAt?: string; status?: string }> })?.parts ?? []
  const activePart = parts.find(p => p.status === 'SHIPPED' || p.status === 'DELIVERED')
  if (activePart?.disputeWindowEndsAt) return new Date(activePart.disputeWindowEndsAt)
  return null
})

const timeLeft = ref('—')

const updateCountdown = (): void => {
  const deadline = disputeDeadline.value
  if (!deadline) { timeLeft.value = '—'; return }
  const diff = deadline.getTime() - Date.now()
  if (diff <= 0) { timeLeft.value = 'SÜRE DOLDU'; return }
  const h  = Math.floor(diff / 3_600_000)
  const m  = Math.floor((diff % 3_600_000) / 60_000)
  const s  = Math.floor((diff % 60_000) / 1_000)
  timeLeft.value = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

let countdownTimer: ReturnType<typeof setInterval> | null = null

watch(session, () => {
  updateCountdown()
  if (countdownTimer) clearInterval(countdownTimer)
  if (disputeDeadline.value) {
    countdownTimer = setInterval(updateCountdown, 1000)
  }
}, { immediate: true })

onUnmounted(() => { if (countdownTimer) clearInterval(countdownTimer) })

// ─── Değerlendirme bilgisi ────────────────────────────────────────────────────
const reviewTradeInfo = computed(() => {
  if (!session.value) return {}
  const offer = session.value.tradeOffer
  const partnerCompany = isFromCompany.value ? offer?.toCompany : offer?.fromCompany
  const s = session.value as unknown as { initiatorUserId?: string; receiverUserId?: string }
  const toUserId = isFromCompany.value ? (s.receiverUserId ?? '') : (s.initiatorUserId ?? '')
  return {
    tradeId:     session.value.tradeOfferId,
    partnerName: partnerCompany?.name ?? '',
    toUserId,
  }
})

const handleReviewSuccess = async (): Promise<void> => {
  showReviewModal.value = false
  await fetchSession()
}

// ─── BarterPart yardımcıları ──────────────────────────────────────────────────
interface BarterPartRef {
  id: string
  partNumber: number
  senderId: string
  recipientId: string
  status: string
  trackingCode?: string
  shippedAt?: string
  confirmedAt?: string
  disputeWindowEndsAt?: string
}

const sessionParts = computed((): BarterPartRef[] =>
  ((session.value as unknown as { parts?: BarterPartRef[] })?.parts ?? [])
    .slice()
    .sort((a, b) => a.partNumber - b.partNumber)
)

const companyName = (companyId: string): string => {
  const offer = session.value?.tradeOffer
  if (!offer) return companyId.slice(-6)
  if (companyId === offer.fromCompanyId) return offer.fromCompany?.name ?? companyId.slice(-6)
  if (companyId === offer.toCompanyId) return offer.toCompany?.name ?? companyId.slice(-6)
  return companyId.slice(-6)
}

const partStatusLabel = (status: string): string => {
  switch (status) {
    case 'PENDING':   return 'BEKLEMEDE'
    case 'SHIPPED':   return 'KARGODA'
    case 'DELIVERED': return 'TESLİM ALINDI'
    case 'CONFIRMED': return 'ONAYLANDI'
    case 'DISPUTED':  return 'İTİRAZ'
    default:          return status
  }
}

const partCardClass = (status: string): string => {
  switch (status) {
    case 'CONFIRMED': return 'bg-green-50 border-green-100'
    case 'SHIPPED':   return 'bg-blue-50 border-blue-100'
    case 'DELIVERED': return 'bg-amber-50 border-amber-100'
    case 'DISPUTED':  return 'bg-red-50 border-red-100'
    default:          return 'bg-gray-50 border-gray-100'
  }
}

const partBadgeClass = (status: string): string => {
  switch (status) {
    case 'CONFIRMED': return 'bg-green-600 text-white'
    case 'SHIPPED':   return 'bg-blue-600 text-white'
    case 'DELIVERED': return 'bg-amber-500 text-white'
    case 'DISPUTED':  return 'bg-red-600 text-white'
    default:          return 'bg-gray-200 text-gray-500'
  }
}

const partLabelClass = (status: string): string => {
  switch (status) {
    case 'CONFIRMED': return 'text-green-700'
    case 'SHIPPED':   return 'text-blue-700'
    case 'DELIVERED': return 'text-amber-700'
    case 'DISPUTED':  return 'text-red-700'
    default:          return 'text-gray-500'
  }
}

const formatPartDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

const formatDisputeWindow = (dateStr: string): string => {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff <= 0) return 'SÜRE DOLDU'
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  return `${h}s ${m}dk`
}

onMounted(async () => {
  await fetchMyCompany()
  await fetchSession()
})
</script>
