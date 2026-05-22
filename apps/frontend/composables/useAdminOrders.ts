// composables/useAdminOrders.ts

export interface AdminOrder {
  id: string
  orderNumber?: string
  userId: string
  vendorId: string
  status: string
  totalAmount: number | string
  createdAt: string
  paymentMethod?: string
  paymentStatus?: string
  user?: {
    email?: string
    profile?: { firstName?: string; lastName?: string }
  }
  vendor?: { company?: { name?: string } | null }
  orderItems?: Array<{ id: string }>
}

export interface AdminVendorSummary {
  id: string
  businessName: string
}

interface Pagination {
  page: number
  limit: number
  total: number
}

export const useAdminOrders = () => {
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const orders = ref<AdminOrder[]>([])
  const vendors = ref<AdminVendorSummary[]>([])
  const loading = ref(false)
  const filterStatus = ref('')
  const filterVendorId = ref('')
  const searchQuery = ref('')
  const selectedOrderIds = ref<string[]>([])
  const bulkProcessing = ref(false)
  const bulkStatus = ref('')

  const pagination = reactive<Pagination>({ page: 1, limit: 20, total: 0 })
  const totalPages = computed(() => Math.ceil((pagination.total || 0) / (pagination.limit || 20)))
  const totalOrders = computed(() => pagination.total)

  // Search backend'e iletildiği için client-side filter sadece local cache içindir
  const filteredOrders = computed(() => orders.value)

  const isAllOrdersSelected = computed(() =>
    orders.value.length > 0 && selectedOrderIds.value.length === orders.value.length,
  )

  const fetchOrders = async () => {
    loading.value = true
    try {
      const res = await $api<{ data?: { items: AdminOrder[]; total: number } }>('/api/v1/admin/orders', {
        query: {
          status: filterStatus.value || undefined,
          vendorId: filterVendorId.value || undefined,
          search: searchQuery.value || undefined,
          page: pagination.page,
          limit: pagination.limit,
        },
      })
      orders.value = res.data?.items || []
      pagination.total = res.data?.total || 0
    } catch {
      $toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  interface VendorRaw {
    id: string
    company?: { name?: string } | null
    profile?: { storeName?: string } | null
  }

  const fetchVendors = async () => {
    try {
      const res = await $api<{ data: VendorRaw[] }>('/api/v1/admin/vendors')
      vendors.value = (res.data || []).map((v: VendorRaw) => ({
        id: v.id,
        businessName: v.company?.name || v.profile?.storeName || 'Bilinmeyen',
      }))
    } catch {
      $toast.warning('Satıcılar yüklenemedi')
    }
  }

  const toggleSelectAllOrders = () => {
    if (isAllOrdersSelected.value) {
      selectedOrderIds.value = []
    } else {
      selectedOrderIds.value = orders.value.map(o => o.id)
    }
  }

  const bulkUpdateStatus = async () => {
    if (!bulkStatus.value || !selectedOrderIds.value.length) return
    bulkProcessing.value = true
    try {
      const res = await $api<{ data: { succeeded: string[]; failed: Array<{ orderId: string; error: string }> } }>(
        '/api/v1/admin/orders/bulk-status',
        {
          method: 'PATCH',
          body: { orderIds: selectedOrderIds.value, status: bulkStatus.value },
        },
      )
      const result = res.data
      if (result?.failed?.length) {
        $toast.warning(`${result.succeeded.length} sipariş güncellendi, ${result.failed.length} başarısız`)
      } else {
        $toast.success(`${result?.succeeded?.length ?? selectedOrderIds.value.length} sipariş güncellendi`)
      }
      selectedOrderIds.value = []
      bulkStatus.value = ''
      fetchOrders()
    } catch {
      $toast.error('Toplu güncelleme başarısız')
    } finally {
      bulkProcessing.value = false
    }
  }

  // Status/vendor değişiminde sayfa 1'e dön ve backend'den yeniden çek
  watch([filterStatus, filterVendorId], () => {
    pagination.page = 1
    fetchOrders()
  })

  // Search değişiminde debounce
  let searchTimer: ReturnType<typeof setTimeout> | null = null
  watch(searchQuery, () => {
    if (searchTimer) clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      pagination.page = 1
      fetchOrders()
    }, 400)
  })

  // Sayfa değişiminde fetch
  watch(() => pagination.page, () => fetchOrders())

  return {
    orders, vendors, loading,
    filterStatus, filterVendorId, searchQuery,
    totalOrders, totalPages, pagination,
    selectedOrderIds,
    bulkProcessing, bulkStatus,
    filteredOrders, isAllOrdersSelected,
    fetchVendors, fetchOrders,
    toggleSelectAllOrders, bulkUpdateStatus,
  }
}
