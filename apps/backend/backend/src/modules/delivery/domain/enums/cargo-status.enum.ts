// apps/backend/src/modules/delivery/domain/enums/cargo-status.enum.ts

export enum CargoStatus {
  PENDING        = 'PENDING',
  PICKED_UP      = 'PICKED_UP',
  IN_TRANSIT     = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED      = 'DELIVERED',
  RETURNED       = 'RETURNED',
  EXCEPTION      = 'EXCEPTION',
}