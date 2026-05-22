import type { Product } from '../catalog/product.dto';

export interface CartItem {
  id: string;
  productId: string;
  product?: Product;
  Product: Product; // Legacy compatibility
  quantity: number;
  price: number;
  productVariantId?: string;
  addedAt: string;
  campaignId?: string;
}

export interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  totalPrice?: number;
  totalItems?: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  summary: CartSummary;
}
