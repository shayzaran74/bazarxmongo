export interface Order {
    id: string;
    orderNumber: string;
    userId: string;
    status: string;
    total: number;
    paymentStatus: string;
    shippingStatus: string;
    items: OrderItem[];
    createdAt: string;
    totalAmount?: number;
    paymentMethod?: string;
    orderItems?: OrderItem[];
    OrderItem?: OrderItem[];
}
export interface OrderItem {
    id: string;
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
    productName: string;
    productImage?: string;
    Listing?: any;
}
