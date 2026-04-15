import type { BaseEntity } from '~/types/common'

/** Kategori */
export interface Category extends BaseEntity {
  name: string
  slug: string
  description: string | null
  icon: string | null
  image: string | null
  parentId: string | null
  isActive: boolean
  sortOrder: number
  children?: Category[]
  parent?: Category | null
  _count?: { products: number }
}

/** Marka */
export interface Brand extends BaseEntity {
  name: string
  slug: string
  logo: string | null
  description: string | null
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  isActive: boolean
}

/** Ürün görseli */
export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

/** Ürün varyantı */
export interface ProductVariant {
  id: string
  sku: string | null
  price: number
  compareAtPrice: number | null
  stock: number
  attributes: Record<string, string>
  isActive: boolean
}

/** Ürün badge */
export interface ProductBadge {
  text: string
  class?: string
  style?: { backgroundColor: string; color: string }
  iconUrl?: string | null
}

/** Dinamik badge pozisyonları */
export interface DynamicBadges {
  topLeft?: ProductBadge
  topRight?: ProductBadge
  bottomLeft?: ProductBadge
  bottomRight?: ProductBadge
}

/** Yorum */
export interface Review extends BaseEntity {
  rating: number
  comment: string | null
  userId: string
  orderId: string
  user?: { profile?: { firstName: string | null; lastName: string | null; avatar: string | null } }
}

/** Vendor özet (ürün kartında gösterilecek) */
export interface VendorInfo {
  id: string
  slug: string
  businessName?: string
  logo: string | null
  isVerified: boolean
  tier: string
  rating?: number
}

/** Listing — vendor'ın ürün listesi */
export interface Listing extends BaseEntity {
  price: number
  compareAtPrice: number | null
  stock: number
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
  vendor?: VendorInfo
  images?: ProductImage[]
}

/** Ürün — ana entity (CatalogProduct + aktif Listing bilgileri) */
export interface Product extends BaseEntity {
  name: string
  slug: string
  description: string | null
  shortDescription: string | null
  image: string | null
  images: string[]
  price: number
  compareAtPrice: number | null
  stock: number
  sku: string | null
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DRAFT'
  isFeatured: boolean
  isFlashSale: boolean
  hasVariants: boolean
  variants?: ProductVariant[]
  category?: Category | null
  brand?: Brand | null
  vendor?: VendorInfo | null
  vendorId?: string
  reviews?: Review[]
  reviewCount?: number
  averageRating?: number
  dynamicBadges?: DynamicBadges
  specifications?: Record<string, string>
  bestListingId?: string
  freeShipping?: boolean
  maxPurchasePerMember?: number
  purchasedCount?: number
  listing?: Listing
}

/** Banner */
export interface Banner extends BaseEntity {
  title: string
  subtitle: string | null
  image: string
  link: string | null
  sortOrder: number
  isActive: boolean
  ecosystem: string
}

/** QuadCard */
export interface QuadCard extends BaseEntity {
  title: string
  image: string | null
  link: string | null
  sortOrder: number
  items?: QuadCardItem[]
}

export interface QuadCardItem {
  id: string
  title: string
  image: string | null
  link: string | null
  price: number | null
}

/** Kampanya */
export interface Campaign extends BaseEntity {
  name: string
  slug: string
  description: string | null
  image: string | null
  startDate: string
  endDate: string
  discountType: 'PERCENTAGE' | 'FIXED'
  discountValue: number
  status: 'ACTIVE' | 'SCHEDULED' | 'ENDED'
}
