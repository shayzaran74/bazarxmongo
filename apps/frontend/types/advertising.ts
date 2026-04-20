// apps/frontend/pages/vendor/advertising/types/advertising.ts

export interface AdMetric {
    impressions: number;
    clicks: number;
    spend: number;
    sales: number;
    orders: number;
}

export interface AdCampaign {
    id: string;
    name: string;
    type: 'SPONSORED_PRODUCT' | 'SPONSORED_BRAND' | 'SPONSORED_DISPLAY';
    status: 'ENABLED' | 'PAUSED' | 'PENDING' | 'REJECTED';
    budget: number;
    startDate: string;
    endDate: string | null;
    rejectionReason?: string;
    pricingModel: 'CPC' | 'CPM';
    maxBidPerClick?: number;
    maxBidPerMille?: number;
    products: Array<{
        id: string;
        product: {
            id: string;
            name: string;
            image: string;
            sku: string;
        };
    }>;
    metrics?: AdMetric[];
    adPackage?: string;
}

export interface AdSummary {
    impressions: number;
    clicks: number;
    spend: number;
    sales: number;
    orders: number;
    ctr: number;
    cpc: number;
    roas: number;
}

export interface VendorProduct {
    id: string;
    name: string;
    sku: string;
    price: number;
    image: string;
    stock: number;
    status: string;
}

export interface TargetSlot {
    id: string;
    label: string;
}

export interface NewCampaignForm {
    name: string;
    type: string;
    budget: number;
    startDate: string;
    endDate: string | null;
    pricingModel: string;
    maxBidPerClick: number;
    maxBidPerMille: number;
    budgetOverflow: number;
    targetSlots: string[];
    platform: string;
    negativeKeywords: string[];
}

export interface SwapCampaignForm {
    name: string;
    adPackage: string;
    campaignType: string;
    platform: string;
    targetSlots: string[];
    productIds: string[];
    targetUrl?: string;
}

export interface LayoutForm {
    id: string | null;
    imageUrl: string;
    linkUrl: string;
    template: string;
    status?: string;
    rejectionReason?: string;
}

export interface SummaryStat {
    label: string;
    value: string | number;
    icon: any;
    color: string;
    trend: number;
}
