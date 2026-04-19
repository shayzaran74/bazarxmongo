import type { Category } from '../catalog/category.dto';
import type { Product } from '../catalog/product.dto';

export interface Vendor {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  isVerified: boolean;
  rating: number;
  userId: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
  businessName?: string;
  showFlashSales?: boolean;
  flashProducts?: Product[];
  products?: Product[];
  _count?: {
    products?: number;
    orders?: number;
    listings?: number;
    receivedReviews?: number;
  };
  
  // Ad and Display Fields
  showAd?: boolean;
  adProductLeft?: Product;
  adProductRight?: Product;
  adImageUrlLeft?: string;
  adLinkUrlLeft?: string;
  adImageUrlRight?: string;
  adLinkUrlRight?: string;
  coverImageUrl?: string;
  logoUrl?: string;
  averageRating?: number;
  avgRating?: number;
  
  categories?: {
    category: Category;
  }[];
  brands?: any[];
  user?: any;
  phone?: string;
  isFeatured?: boolean;
  verifiedAt?: string;
  rejectionReason?: string;
  isB2B?: boolean;
  b2bTier?: string;
  corporateCode?: string;
  barterLimitOverride?: number;
  commissionRateB2B?: number;
}

export type AdminVendor = Vendor;
export type VendorAdProduct = Product;

export interface VendorPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}
