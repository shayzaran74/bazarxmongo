import { useOrderStatusLabel } from './useOrderStatusLabel'

export const useVendorOrders = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()
  const { getStatusInfo } = useOrderStatusLabel()

  const orders = ref<Record<string, unknown>[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref('')
  const selectedOrder = ref<Record<string, unknown> | null>(null)

  const pending = computed(() => loading.value)

  const filteredOrders = computed(() => {
    let list = orders.value
    if (filterStatus.value) {
      list = list.filter((o) => o.status === filterStatus.value)
    }
    if (searchQuery.value) {
      const q = searchQuery.value.toLowerCase()
      list = list.filter((o) =>
        o.orderNumber?.toLowerCase().includes(q) ||
        o.id?.toLowerCase().includes(q)
      )
    }
    return list
  })

  const pendingCount = computed(() =>
    orders.value.filter((o) => ['PENDING', 'PAID', 'PROCESSING', 'PREPARING'].includes(o.status as string)).length
  )

  const shippedCount = computed(() =>
    orders.value.filter((o) => ['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(o.status as string)).length
  )

  const totalRevenue = computed(() =>
    orders.value
      .filter((o) => ['COMPLETED', 'DELIVERED', 'PAID'].includes(o.status as string))
      .reduce((sum: number, o) => sum + Number(o.totalAmount || 0), 0)
  )

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await $api<{ data?: { items: Record<string, unknown>[] } }>(
        '/api/v1/vendors/orders'
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
    item: Record<string, unknown>
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

  const orderTotalForVendor = (order: Record<string, unknown>): number => {
    return Number(order.totalAmount || 0)
  }

  const getStatusBadgeClass = (status: string): string => {
    const info = getStatusInfo(status)
    return `${info.bgColor} ${info.color} px-3 py-1 rounded-full text-xs font-bold`
  }

  const getStatusText = (status: string): string => {
    return getStatusInfo(status).label
  }

  return {
    orders, loading, searchQuery, filterStatus, selectedOrder, pending,
    filteredOrders, pendingCount, shippedCount, totalRevenue,
    fetchOrders, refresh, updateItemShipping, orderTotalForVendor,
    getStatusBadgeClass, getStatusText,
  }
}
