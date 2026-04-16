// apps/backend/src/modules/inventory/domain/enums/transfer-status.enum.ts

export enum TransferStatus {
  PENDING = 'Pending',
  IN_TRANSIT = 'InTransit',
  PARTIALLY_RECEIVED = 'PartiallyReceived',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}
