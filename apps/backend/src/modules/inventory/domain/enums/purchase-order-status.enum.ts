// apps/backend/src/modules/inventory/domain/enums/purchase-order-status.enum.ts

export enum PurchaseOrderStatus {
  DRAFT = 'Draft',
  ORDERED = 'Ordered',
  PARTIALLY_RECEIVED = 'PartiallyReceived',
  RECEIVED = 'Received',
  CANCELLED = 'Cancelled',
}
