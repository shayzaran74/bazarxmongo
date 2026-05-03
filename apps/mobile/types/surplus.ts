// apps/mobile/types/surplus.ts

export interface SurplusItem {
  id: string
  title: string
  description?: string
  unitPrice: number
  quantity: number
  status: 'PENDING' | 'ACTIVE' | 'REJECTED' | 'PASSIVE' | 'COMPLETED'
  images: string[]
  city?: string
  categoryId?: string
  categoryName?: string
  tradeModes?: string[]
  wantedCategories?: string[]
  technicalSpecs?: Record<string, string>
  company?: { id: string; name: string; logo?: string }
  vendorId: string
  createdAt: string
}

export interface TradeOffer {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER_OFFERED' | 'EXPIRED' | 'CANCELLED' | 'COMPLETED'
  fromCompanyId: string
  toCompanyId: string
  fromCompany?: { id: string; name: string; logo?: string }
  toCompany?: { id: string; name: string; logo?: string }
  offeredItem?: SurplusItem
  requestedItem?: SurplusItem
  offeredQuantity?: number
  requestedQuantity?: number
  cashDifference?: number
  message?: string
  parentOfferId?: string | null
  swapSession?: { id: string; status: string } | null
  createdAt: string
}

export interface SwapSession {
  id: string
  status: 'PENDING_COLLATERAL' | 'ACTIVE' | 'SHIPPING' | 'PARTIALLY_COMPLETED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'TIMEOUT'
  collateralStatus?: string
  tradeOfferId: string
  tradeOffer?: TradeOffer
  fromCompanyId: string
  toCompanyId: string
  fromCompany?: { id: string; name: string; logo?: string }
  toCompany?: { id: string; name: string; logo?: string }
  parts?: BarterPart[]
  disputeWindowEndsAt?: string
  createdAt: string
}

export interface BarterPart {
  id: string
  senderId: string
  recipientId: string
  status: 'PENDING' | 'SHIPPED' | 'DELIVERED' | 'CONFIRMED'
  trackingCode?: string
  carrier?: string
}

export interface CreateSurplusDto {
  title: string
  description: string
  unitPrice: number
  quantity: number
  images: string[]
  categoryId?: string
  city?: string
  tradeModes?: string[]
  wantedCategories?: string[]
}

export interface CreateOfferDto {
  toCompanyId: string
  offeredItemId: string
  requestedItemId: string
  offeredQuantity: number
  requestedQuantity: number
  cashDifference?: number
  message?: string
}
