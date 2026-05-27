// composables/useAdminOrderDetail.ts

interface OrderItem {
  id: string
  quantity: number
  price: number | string
  totalPrice?: number | string
  Product?: {
    id?: string
    name?: string
    image?: string
    sku?: string
    media?: Array<{ url: string; type: string }>
    Vendor?: { id?: string; businessName?: string; profile?: { storeName?: string } | null }
  } | null
}

interface ShippingAddressData {
  fullName?: string
  name?: string
  firstName?: string
  lastName?: string
  phone?: string
  addressLine1?: string
  addressLine2?: string
  neighborhood?: string
  district?: string
  city?: string
  postalCode?: string
  address?: string
  country?: string
}

interface AdminOrderDetail {
  id: string
  orderNumber?: string
  status: string
  totalAmount: number | string
  subtotal?: number | string
  shippingFee?: number | string
  taxAmount?: number | string
  discountAmount?: number | string
  paymentMethod?: string
  paymentStatus?: string
  paidAt?: string
  paymentIntentId?: string
  trackingNumber?: string
  shippingCarrier?: string
  deliveryDate?: string
  shippingAddress?: ShippingAddressData | string
  cancelReason?: string
  cancelledAt?: string
  createdAt: string
  User?: {
    id: string
    email?: string
    profile?: { firstName?: string; lastName?: string }
  }
  OrderItem?: OrderItem[]
}

interface ShippingUpdate {
  trackingNumber: string
  shippingCarrier: string
  estimatedDelivery: string
  notes: string
  status: string
}

export const useAdminOrderDetail = (orderId?: string) => {
  const route = useRoute()
  const { $api } = useApi()
  const { $toast } = useNuxtApp()

  const order = ref<AdminOrderDetail | null>(null)
  const loading = ref(false)
  const updating = ref(false)

  const resolveId = (): string | undefined => orderId || (route.params.id as string | undefined)

  const shippingUpdate = ref<ShippingUpdate>({
    trackingNumber: '',
    shippingCarrier: '',
    estimatedDelivery: '',
    notes: '',
    status: 'PENDING',
  })

  const parsedAddress = computed<ShippingAddressData | null>(() => {
    const addr = order.value?.shippingAddress
    if (!addr) return null
    if (typeof addr === 'string') {
      try {
        return JSON.parse(addr) as ShippingAddressData
      } catch {
        return null
      }
    }
    return addr
  })

  const subTotal = computed(() => {
    if (order.value?.subtotal) return Number(order.value.subtotal)
    return (order.value?.OrderItem || []).reduce((sum, item) => {
      const lineTotal = Number(item.totalPrice ?? Number(item.price) * item.quantity)
      return sum + (Number.isFinite(lineTotal) ? lineTotal : 0)
    }, 0)
  })

  const shippingCost = computed(() => Number(order.value?.shippingFee || 0))

  const fetchOrder = async () => {
    const id = resolveId()
    if (!id) return
    loading.value = true
    try {
      const res = await $api<{ data: AdminOrderDetail }>(`/api/v1/admin/orders/${id}`)
      order.value = (res as any).data || null
      if (order.value) {
        shippingUpdate.value.trackingNumber = order.value.trackingNumber || ''
        shippingUpdate.value.shippingCarrier = order.value.shippingCarrier || ''
        shippingUpdate.value.status = order.value.status
      }
    } catch {
      $toast.error('Sipariş yüklenemedi')
    } finally {
      loading.value = false
    }
  }

  const updateStatus = async () => {
    const id = resolveId()
    if (!id) return
    updating.value = true
    try {
      // Kargo bilgisi varsa ve durum SHIPPED ise mevcut ship endpoint'ini kullan
      if (shippingUpdate.value.status === 'SHIPPED' && shippingUpdate.value.trackingNumber) {
        await $api(`/api/v1/orders/${id}/ship`, {
          method: 'POST',
          body: {
            trackingNumber: shippingUpdate.value.trackingNumber,
            carrier: shippingUpdate.value.shippingCarrier,
          },
        })
      } else {
        await $api(`/api/v1/admin/orders/${id}/status`, {
          method: 'PATCH',
          body: { status: shippingUpdate.value.status, reason: shippingUpdate.value.notes || undefined },
        })
      }
      $toast.success('Sipariş güncellendi')
      fetchOrder()
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      $toast.error(err?.data?.message || 'Güncellenemedi')
    } finally {
      updating.value = false
    }
  }

  const cancelWithReason = async (reason: string, refund: boolean) => {
    const id = resolveId()
    if (!id) return false
    try {
      await $api(`/api/v1/admin/orders/${id}/cancel`, {
        method: 'POST',
        body: { reason, refund },
      })
      $toast.success('Sipariş iptal edildi')
      return true
    } catch (e: unknown) {
      const err = e as { data?: { message?: string } }
      $toast.error(err?.data?.message || 'İşlem başarısız')
      return false
    }
  }

  const rejectOrder = async () => {
    const reason = prompt('Reddetme sebebi:') ?? 'Admin tarafından reddedildi'
    if (!confirm('Bu siparişi reddetmek istediğinize emin misiniz?')) return
    const ok = await cancelWithReason(reason, true)
    if (ok) fetchOrder()
  }

  const deleteOrder = async (): Promise<boolean> => {
    if (!confirm('Bu siparişi silmek istediğinize emin misiniz? (Sipariş iptal olarak işaretlenecek)')) return false
    return cancelWithReason('Admin tarafından silindi', false)
  }

  onMounted(fetchOrder)

  return {
    order, loading, updating,
    shippingUpdate, parsedAddress, subTotal, shippingCost,
    fetchOrder, updateStatus, rejectOrder, deleteOrder,
  }
}
