import { ref, computed } from 'vue'
import { useVendorOrderService, type VendorOrderListItem } from '~/services/api/VendorOrderService'

export const useVendorOrders = () => {
  const vendorOrderService = useVendorOrderService()
  const { $toast: toast } = useNuxtApp()
  
  const orders = ref<VendorOrderListItem[]>([])
  const loading = ref(false)
  const searchQuery = ref('')
  const filterStatus = ref('')
  const selectedOrder = ref<VendorOrderListItem | null>(null)
  const updatingItem = ref<string | number | null>(null)
  const isSavingProof = ref(false)

  const carrierOptions = ['Aras Kargo', 'MNG Kargo', 'Yurtiçi Kargo', 'Sürat Kargo', 'PTT Kargo', 'UPS Kargo', 'Hepsijet']

  const statusOptions = [
    { value: 'PENDING', label: 'Bekliyor', icon: '⏳', activeClass: 'bg-orange-500 text-white' },
    { value: 'PROCESSING', label: 'Hazırlanıyor', icon: '📦', activeClass: 'bg-blue-500 text-white' },
    { value: 'SHIPPED', label: 'Kargoda', icon: '🚚', activeClass: 'bg-purple-500 text-white' },
    { value: 'DELIVERED', label: 'Teslim', icon: '✅', activeClass: 'bg-green-500 text-white' }
  ]

  const fetchOrders = async () => {
    loading.value = true
    try {
      const response = await vendorOrderService.getOrders()
      if (response.success) {
        orders.value = response.data || []
      }
    } catch (error) {
      console.error('Fetch vendor orders error:', error)
      toast.error('Siparişler yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const updateItemShipping = async (item: VendorOrderListItem['OrderItem'][0]) => {
    updatingItem.value = item.id
    try {
      const response = await vendorOrderService.updateItemShipping(item.id, {
        status: item.status,
        trackingNumber: item.trackingNumber,
        shippingCarrier: item.shippingCarrier
      })
      if (response.success) {
        toast.success('Ürün durumu güncellendi')
        await fetchOrders()
        if (selectedOrder.value) {
          selectedOrder.value = orders.value.find(o => o.id === selectedOrder.value?.id) || null
        }
      }
    } catch (error) {
      console.error('Update item shipping error:', error)
      toast.error('Güncelleme sırasında hata oluştu')
    } finally {
      updatingItem.value = null
    }
  }

  const saveDispatchProof = async (order: VendorOrderListItem) => {
    isSavingProof.value = true
    try {
      const response = await vendorOrderService.saveDispatchProof(order.id, {
        packingVideoUrl: order.packingVideoUrl,
        packingPhotoUrl: order.packingPhotoUrl
      })

      if (response.success) {
        toast.success(response.message || 'Kusur kanıtları başarıyla eklendi!')
      }
    } catch (err) {
      console.error('Save proof error:', err)
      toast.error('Kanıtlar kaydedilemedi')
    } finally {
      isSavingProof.value = false
    }
  }

  const filteredOrders = computed(() => {
    return orders.value.filter(order => {
      const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.value.toLowerCase())
      const orderStatus = (order.status || '').toUpperCase()
      const matchesStatus = !filterStatus.value || orderStatus === filterStatus.value.toUpperCase()
      return matchesSearch && matchesStatus
    })
  })

  const pendingCount = computed(() => orders.value.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length)
  const shippedCount = computed(() => orders.value.filter(o => o.status === 'SHIPPED').length)
  
  const orderTotalForVendor = (order: VendorOrderListItem) => {
    return order.OrderItem.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
  }

  const totalRevenue = computed(() => {
    return orders.value.reduce((total, order) => total + orderTotalForVendor(order), 0)
  })

  return {
    orders, loading, searchQuery, filterStatus, selectedOrder, updatingItem, isSavingProof,
    carrierOptions, statusOptions,
    filteredOrders, pendingCount, shippedCount, totalRevenue,
    fetchOrders, updateItemShipping, saveDispatchProof, orderTotalForVendor
  }
}
