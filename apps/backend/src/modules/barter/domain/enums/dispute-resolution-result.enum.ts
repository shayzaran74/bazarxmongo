// apps/backend/src/modules/barter/domain/enums/dispute-resolution-result.enum.ts

export enum DisputeResolutionResult {
  BUYER_WINS = 'BUYER_WINS',
  SELLER_WINS = 'SELLER_WINS',
  RELEASE_ALL = 'RELEASE_ALL',
  REFUND_ALL = 'REFUND_ALL',
  SPLIT = 'SPLIT',
  CANCELLED = 'CANCELLED',
}
