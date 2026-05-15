import { useOrderStatusLabel } from './useOrderStatusLabel'

export const useVendorOrders = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp() as any
  const { getStatusInfo } = useOrderStatusLabel()

  const orders = ref<any[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref('')
  const selectedOrder = ref<any>(null)

  const pending = computed(() => loading.value)

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
    orders.value.filter((o: any) => ['PENDING', 'PAID', 'PROCESSING', 'PREPARING'].includes(o.status)).length
  )

  const shippedCount = computed(() =>
    orders.value.filter((o: any) => ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status)).length
  )

  const totalRevenue = computed(() =>
    orders.value
      .filter((o: any) => ['COMPLETED', 'DELIVERED', 'PAID'].includes(o.status))
      .reduce((sum: number, o: any) => sum + Number(o.totalAmount || 0), 0)
  )

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await $api<any>(
        '/api/vendors/orders'
      )
      orders.value = res.data?.items || []
    } catch {
      $toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const refresh = () => fetchOrders()

  const updateItemShipping = async (
    item: any
  ) => {
    try {
      await $api(`/api/orders/${item.id}/ship`, {
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

  const getStatusBadgeClass = (status: string): string => {
    const info = getStatusInfo(status as any)
    return `${info.bgColor} ${info.color} px-3 py-1 rounded-full text-xs font-bold`
  }

  const getStatusText = (status: string): string => {
    return getStatusInfo(status as any).label
  }

  return {
    orders, loading, searchQuery, filterStatus, selectedOrder, pending,
    filteredOrders, pendingCount, shippedCount, totalRevenue,
    fetchOrders, refresh, updateItemShipping, orderTotalForVendor,
    getStatusBadgeClass, getStatusText,
  }
}
