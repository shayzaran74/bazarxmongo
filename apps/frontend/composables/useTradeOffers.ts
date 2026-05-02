// apps/frontend/composables/useTradeOffers.ts

interface Company {
  id: string
  name: string
}

interface TradeOfferRow {
  id: string
  status: string
  fromCompany?: Company
  toCompany?: Company
  offeredItem?: Record<string, unknown>
  requestedItem?: Record<string, unknown>
  swapSession?: { id: string; status: string } | null
  reviews?: { fromUserId: string }[]
  [key: string]: unknown
}

interface AcceptResponse {
  success: boolean
  sessionId?: string
  message?: string
}

interface StatusResponse {
  success: boolean
  message?: string
}

export const useTradeOffers = () => {
  const config = useRuntimeConfig()
  const { $api } = useApi()
  const nuxt = useNuxtApp()
  const authStore = useAuthStore()

  const loading = ref(false)
  const offers = ref<TradeOfferRow[]>([])
  const activeTab = ref('received')
  const myCompany = ref<Company | null>(null)
  const updatingStatus = ref<string | null>(null)

  const fetchMyOffers = async (): Promise<void> => {
    loading.value = true
    try {
      if (!myCompany.value) {
        const compRes = await $api<{ success: boolean; company: Company }>(
          `${config.public.apiBase}/api/v1/companies/me`
        )
        if (compRes.success) myCompany.value = compRes.company
      }

      if (myCompany.value) {
        const res = await $api<{ success: boolean; data: TradeOfferRow[]; offers?: TradeOfferRow[] }>(
          `${config.public.apiBase}/api/v1/offers/my`,
          { query: { companyId: myCompany.value.id, type: activeTab.value } }
        )
        if (res.success) {
          offers.value = res.data ?? res.offers ?? []
        }
      }
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'Teklifler yüklenemedi.'
      nuxt.$toast?.error(msg)
    } finally {
      loading.value = false
    }
  }

  // ACCEPTED → POST /accept (sessionId döner, swap paneline yönlendir)
  // Diğerleri → PATCH /status
  const updateStatus = async (id: string, status: string): Promise<boolean> => {
    const s = status.toUpperCase()
    updatingStatus.value = id
    try {
      if (s === 'ACCEPTED') {
        const res = await $api<AcceptResponse>(
          `${config.public.apiBase}/api/v1/offers/${id}/accept`,
          { method: 'POST' }
        )
        if (res.success && res.sessionId) {
          nuxt.$toast?.success('Teklif kabul edildi! Swap sürecine yönlendiriliyorsunuz...')
          await navigateTo(`/ticaritakas/swap/${res.sessionId}`)
          return true
        } else if (res.success) {
          nuxt.$toast?.success('Teklif kabul edildi.')
          await fetchMyOffers()
          return true
        }
        nuxt.$toast?.error(res.message ?? 'Bir hata oluştu.')
        return false
      }

      const res = await $api<StatusResponse>(
        `${config.public.apiBase}/api/v1/offers/${id}/status`,
        { method: 'PATCH', body: { status: s } }
      )
      if (res.success) {
        nuxt.$toast?.success('Teklif güncellendi.')
        await fetchMyOffers()
        return true
      }
      nuxt.$toast?.error(res.message ?? 'Bir hata oluştu.')
      return false
    } catch (err: unknown) {
      const msg = (err as { data?: { message?: string } })?.data?.message ?? 'İşlem sırasında hata oluştu.'
      nuxt.$toast?.error(msg)
      return false
    } finally {
      updatingStatus.value = null
    }
  }

  return {
    loading,
    offers,
    activeTab,
    myCompany,
    updatingStatus,
    fetchMyOffers,
    updateStatus,
  }
}
