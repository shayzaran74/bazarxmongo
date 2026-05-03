// apps/mobile/types/index.ts

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  city?: string
  avatar?: string
  role: 'USER' | 'VENDOR' | 'ADMIN' | 'SUPER_ADMIN'
  loyaltyTier?: string
  xpBalance?: number
}

export interface Address {
  id: string
  title: string
  fullName: string
  phone: string
  city: string
  district: string
  neighborhood: string
  fullAddress: string
  isDefault: boolean
}

export interface Category {
  id: string
  name: string
  slug: string
  image?: string
  parentId?: string | null
  children?: Category[]
}

export interface Product {
  id: string
  title: string
  slug: string
  description?: string
  price: number
  originalPrice?: number
  images: string[]
  stock: number
  categoryId: string
  categoryName?: string
  vendorId: string
  vendor?: { name: string; logo?: string }
  status: string
  rating?: number
  reviewCount?: number
}

export interface CartItem {
  id: string
  listingId: string
  quantity: number
  unitPrice: number
  listing: Pick<Product, 'id' | 'title' | 'images' | 'price'>
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
  itemCount: number
}

export interface Order {
  id: string
  status: 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  total: number
  createdAt: string
  items: OrderItem[]
  address?: Address
}

export interface OrderItem {
  id: string
  title: string
  quantity: number
  unitPrice: number
  image?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  meta?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
