import type { Product } from '../catalog/product.dto';

export interface HomeAuction extends Product {
    auctionEndTime: string;
    endDate: string;
    currentBid: number;
    startBid: number;
    bidCount: number;
    title?: string;
    Product?: Product;
    _count?: {
        bids: number;
    };
}

export interface HomeLottery extends Product {
    drawDate: string;
    ticketPrice: number;
    soldTickets: number;
    totalTickets: number;
    title?: string;
    _count?: {
        participants: number;
    };
    Product?: Product;
}

export interface GroupBuyDTO extends Product {
    endDate: string;
    currentQuantity: number;
    tiers: GroupBuyTier[];
    title?: string;
    Product?: Product;
}

export interface GroupBuyTier {
    minQuantity: number;
    price: number;
}

export interface HomeQuadCard {
    id: string;
    title: string;
    link?: string;
    items: HomeQuadCardItem[];
}

export interface HomeQuadCardItem {
    id: string;
    title: string;
    image: string;
    link: string;
}

export interface HomePerformanceShowcaseData {
    bestSellers?: Product[];
    mostRepurchased?: Product[];
    mostVisited?: Product[];
    mostFavorited?: Product[];
    mostRated?: Product[];
}

export interface HomeCategoryHighlightsData {
    bestSellersByCategory: Record<string, Product[]>;
}
