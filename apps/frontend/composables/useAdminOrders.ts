import { ref, computed, watch } from 'vue'
import { useAdminOrderService } from '~/services/api/AdminOrderService'
import type { AdminOrder, AdminVendor } from '@barterborsa/shared-types'

export const useAdminOrders = () => {
  const adminOrderService = useAdminOrderService()
  const toast = useNuxtApp().$toast

  // State
  const orders = ref<AdminOrder[]>([])
  const vendors = ref<AdminVendor[]>([])
  const loading = ref(false)
  
  // Filters
  const filterStatus = ref('')
  const filterVendorId = ref('')
  const searchQuery = ref('')
  
  // Pagination
  const totalOrders = ref(0)
  
  // Bulk Actions
  const selectedOrderIds = ref<(string | number)[]>([])
  const bulkProcessing = ref(false)
  const bulkStatus = ref('')

  // Computed
  const filteredOrders = computed(() => {
    if (!searchQuery.value) return orders.value
    const query = searchQuery.value.toLowerCase()
    return orders.value.filter((order: AdminOrder) =>
      (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
      (order.User?.name && order.User.name.toLowerCase().includes(query)) ||
      (order.User?.email && order.User.email.toLowerCase().includes(query))
    )
  })

  const isAllOrdersSelected = computed(() => {
    return filteredOrders.value.length > 0 && selectedOrderIds.value.length === filteredOrders.value.length
  })

  // Methods
  const fetchVendors = async () => {
    try {
      const response = await adminOrderService.getVendors()
      if (response.success && response.data) {
        vendors.value = response.data
      }
    } catch (err) {
      console.error('Fetch vendors error:', err)
    }
  }

  const fetchOrders = async () => {
    loading.value = true
    try {
      const response = await adminOrderService.getOrders({
        status: filterStatus.value,
        vendorId: filterVendorId.value
      }) // any is removed
      if (response.success && response.data) {
        orders.value = response.data.items || []
        totalOrders.value = response.data.total || orders.value.length
      }
    } catch (error) {
      console.error('Fetch orders error:', error)
    } finally {
      loading.value = false
    }
  }

  const handleSearch = () => {
    // Computed property filteredOrders handles local search
  }

  const toggleSelectAllOrders = () => {
    if (isAllOrdersSelected.value) {
      selectedOrderIds.value = []
    } else {
      selectedOrderIds.value = filteredOrders.value.map((o: AdminOrder) => o.id)
    }
  }

  const bulkUpdateStatus = async () => {
    if (!bulkStatus.value || selectedOrderIds.value.length === 0) return

    bulkProcessing.value = true
    try {
      const response = await adminOrderService.bulkUpdateStatus(selectedOrderIds.value, bulkStatus.value)

      if (response.success) {
        toast.success(`${selectedOrderIds.value.length} sipariş güncellendi`)
        selectedOrderIds.value = []
        bulkStatus.value = ''
        await fetchOrders()
      } else {
        toast.error(response.message || 'Toplu güncelleme başarısız')
      }
    } catch (error) {
      console.error('Bulk order update error:', error)
      toast.error('Toplu güncelleme sırasında hata oluştu')
    } finally {
      bulkProcessing.value = false
    }
  }

  // Watchers
  watch([filterStatus, filterVendorId], () => {
    fetchOrders()
  })

  return {
    // State
    orders, vendors, loading, filterStatus, filterVendorId, searchQuery,
    totalOrders, selectedOrderIds, bulkProcessing, bulkStatus,
    // Computed
    filteredOrders, isAllOrdersSelected,
    // Methods
    fetchVendors, fetchOrders, handleSearch, toggleSelectAllOrders, bulkUpdateStatus
  }
}
