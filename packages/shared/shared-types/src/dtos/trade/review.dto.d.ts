export interface Review {
    id: string;
    productId: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
    User?: {
        name: string;
    };
    isVerified?: boolean;
}
