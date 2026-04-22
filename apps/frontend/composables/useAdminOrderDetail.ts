export const useAdminOrderDetail = () => {
  const route = useRoute()
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const order = ref<any>(null)
  const loading = ref(false)

  const fetchOrder = async () => {
    if (!route.params.id) return
    loading.value = true
    try {
      const res = await $api<{ success: boolean; data: any }>(
        `/api/admin/orders/${route.params.id}`
      )
      order.value = res.data || null
    } catch {
      $toast.error('Sipariş yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const updateShipping = async (data: {
    trackingNumber: string
    carrier: string
  }) => {
    try {
      await $api(`/api/admin/orders/${route.params.id}/ship`, {
        method: 'POST',
        body: data
      })
      $toast.success('Kargo bilgisi güncellendi')
      fetchOrder()
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const updateStatus = async (status: string) => {
    try {
      await $api(`/api/admin/orders/${route.params.id}/status`, {
        method: 'PATCH',
        body: { status }
      })
      $toast.success('Durum güncellendi')
      fetchOrder()
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  onMounted(fetchOrder)

  return {
    order, loading,
    fetchOrder, updateShipping, updateStatus,
  }
}
