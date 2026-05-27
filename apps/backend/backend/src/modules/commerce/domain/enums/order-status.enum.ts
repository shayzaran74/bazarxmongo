// apps/backend/src/modules/commerce/domain/enums/order-status.enum.ts

export enum OrderStatus {
  PENDING            = 'PENDING',
  PAID               = 'PAID',
  CONFIRMED          = 'CONFIRMED',
  PROCESSING         = 'PROCESSING',
  // BazarX Go — RESTAURANT mutfak akışı
  PREPARING          = 'PREPARING',
  READY              = 'READY',
  AWAITING_PICKUP    = 'AWAITING_PICKUP',
  OUT_FOR_DELIVERY   = 'OUT_FOR_DELIVERY',
  // E-ticaret kargo akışı
  SHIPPED            = 'SHIPPED',
  DELIVERED          = 'DELIVERED',
  COMPLETED          = 'COMPLETED',
  CANCELLED          = 'CANCELLED',
  REFUNDED           = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
  DISPUTED           = 'DISPUTED',
}
