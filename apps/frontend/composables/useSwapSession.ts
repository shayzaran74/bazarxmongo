export const useSwapSession = () => {
  const route = useRoute()
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const session = ref<any>(null)
  const loading = ref(false)

  const fetchSession = async () => {
    if (!route.params.id) return
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        `/api/barter/swap/${route.params.id}`
      )
      session.value = res.data || null
    } catch { /* ignore */ } finally {
      loading.value = false
    }
  }

  const confirmShipment = async (trackingCode: string, carrier: string) => {
    try {
      await $api(`/api/barter/swap/${route.params.id}/ship`, {
        method: 'POST',
        body: { trackingCode, carrier }
      })
      $toast.success('Kargo bilgisi kaydedildi')
      fetchSession()
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const confirmDelivery = async () => {
    try {
      await $api(`/api/barter/swap/${route.params.id}/confirm`, {
        method: 'POST'
      })
      $toast.success('Teslimat onaylandı')
      fetchSession()
    } catch {
      $toast.error('Onaylanamadı')
    }
  }

  const openDispute = async (reason: string) => {
    try {
      await $api(`/api/barter/swap/${route.params.id}/dispute`, {
        method: 'POST',
        body: { reason }
      })
      $toast.success('Anlaşmazlık bildirimi gönderildi')
      fetchSession()
    } catch {
      $toast.error('Gönderilemedi')
    }
  }

  onMounted(fetchSession)

  return {
    session, loading,
    fetchSession, confirmShipment, confirmDelivery, openDispute,
  }
}
