import { ref, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { AdminOrder, AdminOrderItem, ApiResponse } from '@barterborsa/shared-types'

export const useAdminOrderDetail = (orderId: string) => {
  const { $api } = useApi()
  const toast = useNuxtApp().$toast
  
  const order = ref<AdminOrder | null>(null)
  const loading = ref(true)
  const updating = ref(false)

  const shippingUpdate = ref({
    status: 'Pending',
    trackingNumber: '',
    shippingCarrier: '',
    estimatedDelivery: '',
    notes: ''
  })

  // Computed
  const parsedAddress = computed(() => {
    if (!order.value?.shippingAddress) return null
    try {
      return JSON.parse(order.value.shippingAddress)
    } catch (e) {
      return null
    }
  })

  const subTotal = computed(() => {
    return order.value?.OrderItem?.reduce((sum: number, item: AdminOrderItem) => sum + (Number(item.price) * item.quantity), 0) || 0
  })

  const shippingCost = computed(() => {
    const total = Number(order.value?.totalAmount || 0)
    return total - subTotal.value
  })

  // Methods
  const fetchOrder = async () => {
    loading.value = true
    try {
      const response = await $api<AdminOrder>(`/api/admin/orders/${orderId}`)
      if (response.success && response.data) {
        const data = response.data as AdminOrder
        order.value = data
        shippingUpdate.value = {
          status: data.status,
          trackingNumber: data.trackingNumber || '',
          shippingCarrier: data.shippingCarrier || '',
          estimatedDelivery: data.estimatedDelivery ? data.estimatedDelivery.split('T')[0] : '',
          notes: data.notes || ''
        }
      }
    } catch (error) {
      console.error('Fetch order error:', error)
      toast.error('Sipariş bilgileri yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const deleteOrder = async () => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return false

    try {
      const response = await $api<ApiResponse<void>>(`/api/admin/orders/${order.value?.id}`, { method: 'DELETE' })
      if (response.success) {
        toast.success('Sipariş silindi')
        return true
      }
    } catch (error) {
      console.error('Delete order error:', error)
      toast.error('Sipariş silinirken bir hata oluştu')
    }
    return false
  }

  const rejectOrder = async () => {
    if (!confirm('Siparişi reddetmek ve iptal etmek istiyor musunuz?')) return

    try {
      const response = await $api<ApiResponse<AdminOrder>>(`/api/admin/orders/${order.value?.id}/status`, {
        method: 'PATCH',
        body: { status: 'Cancelled', notes: 'Sipariş yönetici tarafından reddedildi.' }
      })
      if (response.success && order.value) {
        toast.success('Sipariş reddedildi')
        order.value.status = 'Cancelled'
        shippingUpdate.value.status = 'Cancelled'
      }
    } catch (error) {
      console.error('Reject order error:', error)
      toast.error('İşlem sırasında bir hata oluştu')
    }
  }

  const updateStatus = async () => {
    updating.value = true
    try {
      const payload = {
        status: shippingUpdate.value.status,
        trackingNumber: shippingUpdate.value.trackingNumber || null,
        shippingCarrier: shippingUpdate.value.shippingCarrier || null,
        estimatedDelivery: shippingUpdate.value.estimatedDelivery || null,
        notes: shippingUpdate.value.notes || null
      }

      const response = await $api<ApiResponse<AdminOrder>>(`/api/admin/orders/${order.value?.id}/status`, {
        method: 'PATCH',
        body: payload
      })
      if (response.success && response.data) {
        toast.success('Sipariş başarıyla güncellendi')
        order.value = { ...order.value!, ...response.data }
        shippingUpdate.value.status = order.value!.status
      }
    } catch (error: unknown) {
      console.error('Update status error:', error)
      const err = error as { data?: { error?: string } }
      toast.error(err.data?.error || 'Güncelleme sırasında bir hata oluştu')
    } finally {
      updating.value = false
    }
  }

  return {
    order, loading, updating, shippingUpdate,
    parsedAddress, subTotal, shippingCost,
    fetchOrder, deleteOrder, rejectOrder, updateStatus
  }
}
