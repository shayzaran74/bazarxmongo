import type { Category } from './category.dto';
export interface Product {
    id: string;
    name: string;
    slug: string;
    description?: string;
    sku: string;
    price: number;
    salePrice?: number;
    stock: number;
    isActive: boolean;
    categoryId: string;
    category?: Category;
    Category?: Category;
    images: string[];
    attributes?: Record<string, any>;
    vendorId: string;
    vendor?: any;
    Vendor?: any;
    createdAt: string;
    updatedAt: string;
    badgeText?: string;
    badgeColor?: string;
    compareAtPrice?: number;
    image?: string | {
        url: string;
    };
    bestListingId?: string;
    visibility?: string;
    maxPurchasePerMember?: number;
    minMarketPrice?: number;
    brand?: any;
    purchasedCount?: number;
    hasVariants?: boolean;
    variants?: any[];
    Review?: any[];
    dynamicBadges?: any;
    isSponsored?: boolean;
    distance?: number;
    sellerCount?: number;
    catalogProductId?: string;
    Brand?: any;
    reviews?: any[];
    status?: string;
    reviewCount?: number;
    soldCount?: number;
    weight?: number;
    technicalSpecifications?: string;
    isFlashSale?: boolean;
}
export interface ProductVariant {
    id: string;
    productId: string;
    sku: string;
    price: number;
    stock: number;
    attributes?: Record<string, any>;
}
export interface ListingResponseDto extends Product {
    viewCount?: number;
    favoriteCount?: number;
}
export interface PaginatedListingsDto {
    items: ListingResponseDto[];
    total: number;
    page: number;
    limit: number;
}
