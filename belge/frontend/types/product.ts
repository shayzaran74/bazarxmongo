export interface Category {
  id: string | number;
  name: string;
  slug: string;
  parentId?: string | number;
}

export interface Brand {
  id: string | number;
  name: string;
  isOfficial?: boolean;
}

export interface VendorAdProduct {
  id: string
  name: string
  price: number
  compareAtPrice?: number
  image?: string | { url: string }
}

export interface Vendor {
  id: string | number
  businessName: string
  userId?: string
  description?: string
  logoUrl?: string
  coverImageUrl?: string
  status?: string
  averageRating?: number
  rating?: string | number
  city?: string
  district?: string
  vendorTier?: string
  createdAt?: string
  _count?: {
    listings?: number
    receivedReviews?: number
  }
  categories?: Array<{ category: { id: string; name: string; slug: string } }>
  brands?: Array<{ id: string; name: string }>
  products?: Product[]
  flashProducts?: Product[]
  // Ad alanları
  showAd?: boolean
  showFlashSales?: boolean
  adProductLeft?: VendorAdProduct
  adProductRight?: VendorAdProduct
  adImageUrlLeft?: string
  adImageUrlRight?: string
  adLinkUrlLeft?: string
  adLinkUrlRight?: string
}

export interface Review {
  id: string | number;
  rating: number;
  comment: string;
  createdAt: string;
  isVerified?: boolean;
  User?: {
    name: string;
  };
}

export interface ProductBadge {
  text: string;
  class: string;
  style?: string;
  iconUrl?: string;
}

export interface ProductBadges {
  topLeft?: ProductBadge;
  topRight?: ProductBadge;
  bottomLeft?: ProductBadge;
  bottomRight?: ProductBadge;
}

export interface OtherSeller {
  id: string | number;
  businessName: string;
  logo?: string;
  price?: number;
  rating?: string | number;
}

export interface ProductVariant {
  id: string | number;
  productId: string | number;
  sku?: string;
  price: number;
  stock: number;
  attributes: Record<string, string | number>;
  image?: string;
}

export interface Product {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  technicalSpecifications?: string;
  price: number;
  compareAtPrice?: number;
  image?: string;
  images?: string[];
  Category?: Category;
  Brand?: Brand;
  brand?: string | Brand; // Fixed legacy compatibility
  vendorId?: string | number;
  Vendor?: Vendor;
  reviewCount?: number;
  soldCount?: number;
  rating?: number;
  averageRating?: number;
  stock: number;
  isAvailable?: boolean;
  maxPurchasePerMember?: number;
  purchasedCount?: number;
  weight?: number;
  barcode?: string;
  sku?: string;
  isActive?: boolean;
  hasVariants?: boolean;
  variants?: ProductVariant[];
  _count?: {
    Review?: number;
    Favorite?: number;
  };
  Review?: Review[];
  otherSellers?: OtherSeller[];
}
