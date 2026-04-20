import type { Component } from 'vue'

export interface ProductFormState {
  name: string
  description: string
  image: string
  productImages: string[]
  price: number
  compareAtPrice: number
  costPerItem: number
  stock: number
  sku: string
  barcode: string
  modelCode: string
  brand: string
  trackInventory: boolean
  continueSellingOutOfStock: boolean
  requiresShipping: boolean
  weight: number
  volume: number
  isTaxable: boolean
  categoryId: string
  productType: string
  tags: string
  metaTitle: string
  metaDescription: string
  handle: string
  badgeText: string
  badgeColor: string
  isActive: boolean
  isNew: boolean
  isFeatured: boolean
  isFlashSale: boolean
  isSpecialOffer: boolean
  technicalSpecifications: Record<string, string | number | boolean | null>
  technicalSpecificationsRaw: string
  brandId?: string
  visibility?: 'PUBLIC' | 'PRIVATE_ECOSYSTEM'
  ecosystemId?: string | null
  minMarketPrice?: number | null
  maxPurchasePerMember?: number | null
}

export interface CategoryAttribute {
  id: string
  name: string
  label: string
  type: 'select' | 'number' | 'text'
  isRequired: boolean
  options?: string[] | string
  unit?: string
  placeholder?: string
}

export interface FormSection {
  id: string
  name: string
  icon: Component | string
  required: boolean
}

export interface MarketingFlag {
  key: keyof ProductFormState
  label: string
  activeClass: string
  checkClass: string
}
