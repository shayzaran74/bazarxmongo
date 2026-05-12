// apps/frontend/composables/useOrderStatusLabel.ts

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'PREPARING'
  | 'READY'
  | 'AWAITING_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'

export interface StatusLabel {
  label: string
  description: string
  color: string
  bgColor: string
}

export const useOrderStatusLabel = (vendorType?: 'RESTAURANT' | 'COMMERCE' | 'MARKET' | 'SERVICE' | '') => {
  const getStatusInfo = (status: OrderStatus): StatusLabel => {
    const restaurantLabels: Record<OrderStatus, StatusLabel> = {
      PENDING: { label: 'Beklemede', description: 'Sipariş henüz onaylanmadı', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      PROCESSING: { label: 'Mutfağa Alındı', description: 'Sipariş hazırlanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      PREPARING: { label: 'Hazırlanıyor', description: 'Mutfakta hazırlanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      READY: { label: 'Hazır', description: 'Kurye bekleniyor', color: 'text-green-600', bgColor: 'bg-green-50' },
      AWAITING_PICKUP: { label: 'Kurye Bekliyor', description: 'Kurye siparişi almak üzere', color: 'text-green-600', bgColor: 'bg-green-50' },
      OUT_FOR_DELIVERY: { label: 'Yolda', description: 'Kurye teslimatda', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      SHIPPED: { label: 'Kargoda', description: 'Kargo ile gönderildi', color: 'text-gray-600', bgColor: 'bg-gray-50' },
      DELIVERED: { label: 'Teslim Edildi', description: 'Sipariş teslim edildi', color: 'text-green-600', bgColor: 'bg-green-50' },
      CANCELLED: { label: 'İptal Edildi', description: 'Sipariş iptal edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
      REFUNDED: { label: 'İade Edildi', description: 'Ödeme iade edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
    }

    const commerceLabels: Record<OrderStatus, StatusLabel> = {
      PENDING: { label: 'Beklemede', description: 'Ödeme bekleniyor', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      PROCESSING: { label: 'Paketleniyor', description: 'Sipariş paketleniyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      PREPARING: { label: 'Hazırlanıyor', description: 'Kargoya hazırlanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      READY: { label: 'Kargoya Hazır', description: 'Kargo bekleniyor', color: 'text-green-600', bgColor: 'bg-green-50' },
      AWAITING_PICKUP: { label: 'Kargo Bekliyor', description: 'Kargo şirketi bekleniyor', color: 'text-green-600', bgColor: 'bg-green-50' },
      OUT_FOR_DELIVERY: { label: 'Kargoda', description: 'Kargo yolda', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      SHIPPED: { label: 'Teslim Edildi', description: 'Teslim edildi', color: 'text-green-600', bgColor: 'bg-green-50' },
      DELIVERED: { label: 'Teslim Edildi', description: 'Sipariş teslim edildi', color: 'text-green-600', bgColor: 'bg-green-50' },
      CANCELLED: { label: 'İptal Edildi', description: 'Sipariş iptal edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
      REFUNDED: { label: 'İade Edildi', description: 'Ödeme iade edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
    }

    const marketLabels: Record<OrderStatus, StatusLabel> = {
      PENDING: { label: 'Beklemede', description: 'Sipariş bekleniyor', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      PROCESSING: { label: 'Hazırlanıyor', description: 'Ürünler toplanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      PREPARING: { label: 'Paketleniyor', description: 'Sipariş paketleniyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      READY: { label: 'Teslimata Hazır', description: 'Kurye bekleniyor', color: 'text-green-600', bgColor: 'bg-green-50' },
      AWAITING_PICKUP: { label: 'Kurye Bekliyor', description: 'Kurye siparişi almak üzere', color: 'text-green-600', bgColor: 'bg-green-50' },
      OUT_FOR_DELIVERY: { label: 'Yolda', description: 'Teslimatda', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      SHIPPED: { label: 'Kargoda', description: 'Kargo ile gönderildi', color: 'text-gray-600', bgColor: 'bg-gray-50' },
      DELIVERED: { label: 'Teslim Edildi', description: 'Sipariş teslim edildi', color: 'text-green-600', bgColor: 'bg-green-50' },
      CANCELLED: { label: 'İptal Edildi', description: 'Sipariş iptal edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
      REFUNDED: { label: 'İade Edildi', description: 'Ödeme iade edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
    }

    const serviceLabels: Record<OrderStatus, StatusLabel> = {
      PENDING: { label: 'Beklemede', description: 'Randevu bekleniyor', color: 'text-orange-600', bgColor: 'bg-orange-50' },
      PROCESSING: { label: 'Onaylandı', description: 'Randevu onaylandı', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      PREPARING: { label: 'Hazırlanıyor', description: 'Hizmet hazırlanıyor', color: 'text-blue-600', bgColor: 'bg-blue-50' },
      READY: { label: 'Tamamlandı', description: 'Hizmet tamamlandı', color: 'text-green-600', bgColor: 'bg-green-50' },
      AWAITING_PICKUP: { label: 'Randevulu', description: 'Müşteri bekleniyor', color: 'text-green-600', bgColor: 'bg-green-50' },
      OUT_FOR_DELIVERY: { label: 'Hizmette', description: 'Hizmet sunuluyor', color: 'text-purple-600', bgColor: 'bg-purple-50' },
      SHIPPED: { label: 'Tamamlandı', description: 'Hizmet tamamlandı', color: 'text-green-600', bgColor: 'bg-green-50' },
      DELIVERED: { label: 'Tamamlandı', description: 'Hizmet tamamlandı', color: 'text-green-600', bgColor: 'bg-green-50' },
      CANCELLED: { label: 'İptal Edildi', description: 'Randevu iptal edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
      REFUNDED: { label: 'İade Edildi', description: 'Ödeme iade edildi', color: 'text-red-600', bgColor: 'bg-red-50' },
    }

    const labels = vendorType === 'RESTAURANT' ? restaurantLabels
      : vendorType === 'MARKET' ? marketLabels
      : vendorType === 'SERVICE' ? serviceLabels
      : commerceLabels

    return labels[status] || {
      label: status,
      description: '',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    }
  }

  return { getStatusInfo }
}