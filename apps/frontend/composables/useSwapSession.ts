// apps/frontend/composables/useSwapSession.ts

interface BarterPartDto {
  id: string
  swapSessionId: string
  partNumber: number
  senderId: string
  recipientId: string
  trackingCode?: string
  carrier?: string
  status: string
  shippedAt?: string
  deliveredAt?: string
  confirmedAt?: string
  disputeWindowEndsAt?: string
}

interface CompanyDto {
  id: string
  name: string
  logoUrl?: string
}

interface TradeOfferDto {
  id: string
  fromCompanyId: string
  toCompanyId: string
  fromCompany: CompanyDto
  toCompany: CompanyDto
  offeredItems: unknown[]
  requestedItems: unknown[]
}

interface SwapSessionDto {
  id: string
  tradeOfferId: string
  initiatorId: string
  receiverId: string
  status: string
  collateralStatus: string
  collateralAmount: string
  collateralCurrency: string
  fromCollateralHoldId?: string
  toCollateralHoldId?: string
  timeoutAt: string
  completedAt?: string
  disputedAt?: string
  parts: BarterPartDto[]
  tradeOffer: TradeOfferDto
}

export const useSwapSession = (sessionId: string | Ref<string>) => {
  const nuxt = useNuxtApp()
  const { $api } = useApi()

  const resolvedId = computed(() => toValue(sessionId))

  const session = ref<SwapSessionDto | null>(null)
  const loading = ref(false)
  const actionLoading = ref(false)
  const shippingCode = ref('')
  const disputeReason = ref('')

  // ─── Yardımcı: company ID'mi bul ─────────────────────────────────────────
  const currentCompanyId = ref<string | null>(null)

  const fetchMyCompany = async (): Promise<void> => {
    try {
      const res = await $api<{ success: boolean; company?: { id: string } }>(
        '/api/v1/companies/me'
      )
      currentCompanyId.value = res.company?.id ?? null
    } catch { /* company bilgisi yüklenemedi */ }
  }

  // ─── Session yükle ───────────────────────────────────────────────────────
  const fetchSession = async (): Promise<void> => {
    if (!resolvedId.value) return
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: SwapSessionDto }>(
        `/api/v1/barter/swap/${resolvedId.value}`
      )
      session.value = res.data ?? null
    } catch { /* hata filtresi tarafından işlenir */ } finally {
      loading.value = false
    }
  }

  // ─── Computed: Taraf belirleme ────────────────────────────────────────────
  const isFromCompany = computed((): boolean => {
    if (!session.value || !currentCompanyId.value) return false
    return session.value.initiatorId === currentCompanyId.value
  })

  const myPart = computed((): BarterPartDto | undefined =>
    session.value?.parts.find(p => p.senderId === currentCompanyId.value)
  )

  const myReceivedPart = computed((): BarterPartDto | undefined =>
    session.value?.parts.find(p => p.recipientId === currentCompanyId.value)
  )

  const isMyCollateralLocked = computed((): boolean => {
    if (!session.value) return false
    return ['HELD', 'RELEASED'].includes(session.value.collateralStatus)
  })

  const isMyShippingInfoProvided = computed((): boolean =>
    !!myPart.value && ['SHIPPED', 'DELIVERED', 'CONFIRMED'].includes(myPart.value.status)
  )

  const isMyReceiptConfirmed = computed((): boolean =>
    !!myReceivedPart.value && ['CONFIRMED'].includes(myReceivedPart.value.status)
  )

  const isMyFinalized = computed((): boolean => {
    if (!session.value) return false
    return ['COMPLETED'].includes(session.value.status) && ['RELEASED', 'PENDING_RELEASE'].includes(session.value.collateralStatus)
  })

  const getMyShippingCode = computed((): string =>
    myPart.value?.trackingCode ?? ''
  )

  // ─── Kargo Bildirimi ─────────────────────────────────────────────────────
  const submitShipping = async (): Promise<void> => {
    if (!shippingCode.value) return
    actionLoading.value = true
    try {
      await $api(`/api/v1/barter/swap/${resolvedId.value}/ship`, {
        method: 'POST',
        body: { trackingCode: shippingCode.value, carrier: 'Kargo' },
      })
      nuxt.$toast?.success('Kargo bilgisi kaydedildi.')
      await fetchSession()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Güncelleme başarısız.'
      nuxt.$toast?.error(msg)
    } finally {
      actionLoading.value = false
    }
  }

  // ─── Teslimat Onayı ──────────────────────────────────────────────────────
  const confirmReceipt = async (): Promise<void> => {
    actionLoading.value = true
    try {
      await $api(`/api/v1/barter/swap/${resolvedId.value}/confirm`, {
        method: 'POST',
      })
      nuxt.$toast?.success('Teslimat onaylandı.')
      await fetchSession()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Onay başarısız.'
      nuxt.$toast?.error(msg)
    } finally {
      actionLoading.value = false
    }
  }

  // ─── Sonlandır ve Teminat İade ───────────────────────────────────────────
  const finalizeSwap = async (): Promise<void> => {
    actionLoading.value = true
    try {
      await $api(`/api/v1/barter/swap/${resolvedId.value}/finalize`, {
        method: 'POST',
      })
      nuxt.$toast?.success('Takas tamamlandı, teminatlar iade edildi.')
      await fetchSession()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Sonlandırma başarısız.'
      nuxt.$toast?.error(msg)
    } finally {
      actionLoading.value = false
    }
  }

  // ─── Anlaşmazlık Bildir ──────────────────────────────────────────────────
  const sendDispute = async (): Promise<void> => {
    if (!disputeReason.value) return
    actionLoading.value = true
    try {
      await $api(`/api/v1/barter/swap/${resolvedId.value}/dispute`, {
        method: 'POST',
        body: { reason: disputeReason.value },
      })
      nuxt.$toast?.success('Anlaşmazlık bildirimi gönderildi.')
      disputeReason.value = ''
      await fetchSession()
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Bildirim gönderilemedi.'
      nuxt.$toast?.error(msg)
    } finally {
      actionLoading.value = false
    }
  }

  // lockCollateral: acceptOffer handler zaten bloke ediyor; bu UI guard amaçlı
  const lockCollateral = async (): Promise<void> => {
    nuxt.$toast?.info('Teminat kabul aşamasında otomatik kilitlendi.')
  }

  return {
    session,
    loading,
    actionLoading,
    shippingCode,
    disputeReason,
    currentCompanyId,
    isFromCompany,
    isMyCollateralLocked,
    isMyShippingInfoProvided,
    isMyReceiptConfirmed,
    isMyFinalized,
    getMyShippingCode,
    fetchSession,
    fetchMyCompany,
    lockCollateral,
    submitShipping,
    confirmReceipt,
    finalizeSwap,
    sendDispute,
  }
}
