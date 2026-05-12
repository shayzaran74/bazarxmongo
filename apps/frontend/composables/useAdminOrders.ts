export const useAdminOrders = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const orders = ref<any[]>([])
  const vendors = ref<any[]>([])
  const loading = ref(false)
  const filterStatus = ref('')
  const filterVendorId = ref('')
  const searchQuery = ref('')
  const totalOrders = ref(0)
  const selectedOrderIds = ref<string[]>([])
  const bulkProcessing = ref(false)
  const bulkStatus = ref('')

  const filteredOrders = computed(() => {
    let list = orders.value
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.userId?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const isAllOrdersSelected = computed(() =>
    orders.value.length > 0 &&
    selectedOrderIds.value.length === orders.value.length
  )

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await $api<any>('/api/v1/admin/orders', {
        query: {
          status: filterStatus.value || undefined,
          vendorId: filterVendorId.value || undefined,
        }
      })
      orders.value = res.data?.items || []
      totalOrders.value = res.data?.total || 0
    } catch {
      $toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const fetchVendors = async () => {
    try {
      const res = await $api<any>('/api/v1/admin/vendors')
      vendors.value = (res.data || []).map((v: any) => ({
        id: v.id,
        businessName: v.company?.name || v.profile?.storeName || 'Bilinmeyen',
      }))
    } catch { /* ignore */ }
  }

  const toggleSelectAllOrders = () => {
    if (isAllOrdersSelected.value) {
      selectedOrderIds.value = []
    } else {
      selectedOrderIds.value = orders.value.map((o: any) => o.id)
    }
  }

  const bulkUpdateStatus = async () => {
    if (!bulkStatus.value || !selectedOrderIds.value.length) return
    bulkProcessing.value = true
    try {
      // Sırayla güncelle
      await Promise.all(
        selectedOrderIds.value.map(id =>
          $api(`/api/admin/orders/${id}/status`, {
            method: 'PATCH',
            body: { status: bulkStatus.value }
          })
        )
      )
      $toast.success(`${selectedOrderIds.value.length} sipariş güncellendi`)
      selectedOrderIds.value = []
      bulkStatus.value = ''
      fetchOrders()
    } catch {
      $toast.error('Toplu güncelleme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  watch([filterStatus, filterVendorId], () => fetchOrders())

  return {
    orders, vendors, loading,
    filterStatus, filterVendorId, searchQuery,
    totalOrders, selectedOrderIds,
    bulkProcessing, bulkStatus,
    filteredOrders, isAllOrdersSelected,
    fetchVendors, fetchOrders,
    toggleSelectAllOrders, bulkUpdateStatus,
  }
}
