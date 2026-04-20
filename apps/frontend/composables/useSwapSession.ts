import { ref, computed, onMounted } from 'vue'

export const useSwapSession = (sessionId: string) => {
  const { $api } = useApi()
  const route = useRoute()
  const toast = useNuxtApp().$toast
  const authStore = useAuthStore()

  const session = ref<any>(null)
  const loading = ref(true)
  const actionLoading = ref(false)
  const myCompany = ref<any>(null)
  const shippingCode = ref('')
  const disputeReason = ref('')

  // Helpers to identify sides
  const isFromCompany = computed(() => session.value?.offer.fromCompanyId === myCompany.value?.id)

  const isMyCollateralLocked = computed(() => {
    if (!session.value || !myCompany.value) return false
    return isFromCompany.value ? session.value.fromCompanyCollateral : session.value.toCompanyCollateral
  })

  const isMyShippingInfoProvided = computed(() => {
    if (!session.value || !myCompany.value) return false
    return isFromCompany.value ? !!session.value.fromCompanyShippingCode : !!session.value.toCompanyShippingCode
  })

  const getMyShippingCode = computed(() => {
    if (!session.value || !myCompany.value) return ''
    return isFromCompany.value ? session.value.fromCompanyShippingCode : session.value.toCompanyShippingCode
  })

  const isMyReceiptConfirmed = computed(() => {
    if (!session.value || !myCompany.value) return false
    return isFromCompany.value ? !!session.value.fromCompanyDeliveredAt : !!session.value.toCompanyDeliveredAt
  })

  const isMyFinalized = computed(() => {
    if (!session.value || !myCompany.value) return false
    return isFromCompany.value ? !!session.value.fromCompanyFinalizedAt : !!session.value.toCompanyFinalizedAt
  })

  // API Methods
  const fetchSession = async () => {
    try {
      const res: any = await $api(`/api/surplus/swap/offer/${sessionId}`)
      if (res.success) session.value = res.session
    } finally { loading.value = false }
  }

  const fetchMyCompany = async () => {
    const res: any = await $api('/api/companies/me')
    if (res.success) myCompany.value = res.company
  }

  const lockCollateral = async () => {
    actionLoading.value = true
    try {
      const res: any = await $api(`/api/surplus/swap/${session.value.id}/lock-collateral`, {
        method: 'POST',
        body: { companyId: myCompany.value.id }
      })
      if (res.success) {
        toast.success('Teminat kilitlendi!')
        await fetchSession()
      }
    } finally { actionLoading.value = false }
  }

  const submitShipping = async () => {
    actionLoading.value = true
    try {
      const res: any = await $api(`/api/surplus/swap/${session.value.id}/shipping`, {
        method: 'POST',
        body: { companyId: myCompany.value.id, shippingCode: shippingCode.value }
      })
      if (res.success) {
        toast.success('Kargo bilgisi kaydedildi')
        await fetchSession()
      }
    } finally { actionLoading.value = false }
  }

  const confirmReceipt = async () => {
    actionLoading.value = true
    try {
      const res: any = await $api(`/api/surplus/swap/${session.value.id}/confirm-receipt`, {
        method: 'POST',
        body: { companyId: myCompany.value.id }
      })
      if (res.success) {
        toast.success('Teslimat onaylandı')
        await fetchSession()
      }
    } finally { actionLoading.value = false }
  }

  const finalizeSwap = async () => {
    actionLoading.value = true
    try {
      const res: any = await $api(`/api/surplus/swap/${session.value.id}/finalize`, {
        method: 'POST',
        body: { companyId: myCompany.value.id }
      })
      if (res.success) {
        toast.success('Takas tamamlandı!')
        await fetchSession()
      }
    } finally { actionLoading.value = false }
  }

  const sendDispute = async () => {
    if (!disputeReason.value) return
    actionLoading.value = true
    try {
      const res: any = await $api(`/api/surplus/swap/${session.value.id}/dispute`, {
        method: 'POST',
        body: { companyId: myCompany.value.id, reason: disputeReason.value }
      })
      if (res.success) {
        toast.success('İtirazınız iletildi, takas donduruldu.')
        await fetchSession()
      }
    } catch (e) { toast.error('İtiraz gönderilemedi') }
    finally { actionLoading.value = false }
  }

  return {
    session, loading, actionLoading, myCompany, shippingCode, disputeReason,
    isFromCompany, isMyCollateralLocked, isMyShippingInfoProvided, 
    getMyShippingCode, isMyReceiptConfirmed, isMyFinalized,
    fetchSession, fetchMyCompany, lockCollateral, submitShipping, confirmReceipt, finalizeSwap, sendDispute
  }
}
