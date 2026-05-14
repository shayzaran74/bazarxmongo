export interface ProductType {
    id: string;
    name: string;
    slug: string;
    schema?: any;
}
export interface Coupon {
    id: string;
    code: string;
    discountAmount: number;
    discountType: 'PERCENTAGE' | 'FIXED';
}
export interface HelpArticle {
    id: string;
    title: string;
    content: string;
    slug: string;
    category?: HelpCategory;
}
export interface HelpCategory {
    id: string;
    name: string;
    title?: string;
    slug: string;
    icon?: string;
    articles?: HelpArticle[];
}
export interface LegalDocument {
    id: string;
    title: string;
    content: string;
    slug: string;
    updatedAt?: string;
}
export interface LoyaltyProgressResponse {
    currentPoints: number;
    nextTierPoints: number;
    tierName: string;
    progressPercentage: number;
}
export interface EscrowCoupon {
    id: string;
    code: string;
    amount: number;
    rewardValue?: number;
    expiryDate: string;
    listing?: {
        catalogProduct?: {
            name: string;
        };
    };
}
export interface PaymentResponse {
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
}
export type BrandEcosystem = any;
