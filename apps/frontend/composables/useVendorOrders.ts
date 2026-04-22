export const useVendorOrders = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any

  const orders = ref<any[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref('')
  const selectedOrder = ref<any>(null)

  const filteredOrders = computed(() => {
    let list = orders.value
    if (filterStatus.value) {
      list = list.filter((o: any) => o.status === filterStatus.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter((o: any) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const pendingCount = computed(() =>
    orders.value.filter((o: any) => o.status === 'PENDING').length
  )

  const shippedCount = computed(() =>
    orders.value.filter((o: any) => o.status === 'SHIPPED').length
  )

  const totalRevenue = computed(() =>
    orders.value
      .filter((o: any) => o.status === 'COMPLETED')
      .reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0)
  )

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await $api<any>(
        '/api/vendors/orders'
      )
      orders.value = res.data || []
    } catch {
      $toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const updateItemShipping = async (
    item: any
  ) => {
    try {
      await $api(`/api/orders/items/${item.id}/ship`, {
        method: 'POST',
        body: { 
          trackingNumber: item.trackingNumber, 
          carrier: item.shippingCarrier 
        }
      })
      $toast.success('Kargo bilgisi güncellendi')
      await fetchOrders()
    } catch {
      $toast.error('Güncellenemedi')
    }
  }

  const orderTotalForVendor = (order: any): number => {
    return Number(order.totalAmount || 0)
  }

  return {
    orders, loading, searchQuery, filterStatus, selectedOrder,
    filteredOrders, pendingCount, shippedCount, totalRevenue,
    fetchOrders, updateItemShipping, orderTotalForVendor,
  }
}
