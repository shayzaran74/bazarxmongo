// apps/backend/src/modules/barter/domain/enums/surplus-status.enum.ts

export enum SurplusStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  ACTIVE           = 'ACTIVE',
  REJECTED         = 'REJECTED',
  RESERVED         = 'RESERVED',
  TRADED           = 'TRADED',
  EXPIRED          = 'EXPIRED',
  DEACTIVATED      = 'DEACTIVATED',
}
