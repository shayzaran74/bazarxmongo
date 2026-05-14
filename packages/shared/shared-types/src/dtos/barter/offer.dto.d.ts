export interface Offer {
    id: string;
    senderId: string;
    receiverId: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'DISPUTED' | 'disputed' | 'pending';
    message?: string;
    createdAt: string;
    fromCompany?: {
        id: string;
        name: string;
    };
    toCompany?: {
        id: string;
        name: string;
    };
    offeredItem?: {
        id: string;
        title: string;
        image?: string;
    };
    requestedItem?: {
        id: string;
        title: string;
        image?: string;
    };
}
