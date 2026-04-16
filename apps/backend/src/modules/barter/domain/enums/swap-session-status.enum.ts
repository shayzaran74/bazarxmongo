// apps/backend/src/modules/barter/domain/enums/swap-session-status.enum.ts

export enum SwapSessionStatus {
  PENDING_COLLATERAL = 'PENDING_COLLATERAL',
  ACTIVE = 'ACTIVE',
  SHIPPING = 'SHIPPING',
  PARTIALLY_COMPLETED = 'PARTIALLY_COMPLETED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  TIMEOUT = 'TIMEOUT',
}
