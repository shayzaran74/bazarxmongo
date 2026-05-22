// apps/backend/src/modules/barter/domain/repositories/vendor-b2b-data.repository.interface.ts

export interface VendorB2BData {
  vendorId: string;
  poolUsed: number;
  poolLimit: number;
  tier: string;
  barterEnabled: boolean;
  firstTransactionAt?: Date;
  subscriptionStatus: string;
}

export interface IVendorB2BDataRepository {
  findByVendorId(vendorId: string): Promise<VendorB2BData | null>;
  updateFirstTransaction(vendorIds: string[]): Promise<void>;
  updateSubscriptionStatus(vendorId: string, status: string): Promise<void>;
}