// apps/frontend/types/surplus.ts

export type SurplusStatus =
  | 'PENDING_APPROVAL'
  | 'ACTIVE'
  | 'REJECTED'
  | 'RESERVED'
  | 'TRADED'
  | 'EXPIRED'
  | 'DEACTIVATED'

export interface SurplusCompany {
  id:   string
  name: string
}

export interface SurplusItem {
  id:                string
  companyId:         string
  title:             string
  description?:      string
  category:          string
  materialType?:     string
  quantity:          string | number
  unit:              string
  unitPrice?:        string | number
  images?:           string[]
  location?:         string
  city?:             string
  wantedCategories?: string[]
  tradeModes?:       string[]
  technicalSpecs?:   Record<string, unknown>
  status:            SurplusStatus
  rejectionReason?:  string
  reactivationCount: number
  createdAt:         string
  updatedAt:         string
  company?:          SurplusCompany
}

export interface TradeOfferItem {
  id?:    string
  title?: string
  images?: string[]
}

export interface TradeOffer {
  id:              string
  fromCompanyId:   string
  toCompanyId:     string
  status:          string
  cashAmount?:     string | number
  message?:        string
  createdAt:       string
  fromCompany?:    SurplusCompany
  toCompany?:      SurplusCompany
  offeredItems?:   TradeOfferItem[]
  requestedItems?: TradeOfferItem[]
}

export interface BarterChain {
  id:     string
  offers: Array<{ offeredItemId?: string; requestedItemId?: string }>
}

export interface SurplusListResponse {
  success: boolean
  items:   SurplusItem[]
  data:    SurplusItem[]
  meta:    { page: number; limit: number; total: number; totalPages: number }
}

export interface OfferListResponse {
  success: boolean
  offers:  TradeOffer[]
  data:    TradeOffer[]
}
