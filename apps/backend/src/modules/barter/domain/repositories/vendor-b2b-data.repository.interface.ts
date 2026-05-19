// apps/backend/src/modules/barter/domain/repositories/vendor-b2b-data.repository.interface.ts

export interface IVendorB2BDataRepository {
  findByVendorId(vendorId: string): Promise<any | null>;
  updateFirstTransaction(vendorIds: string[]): Promise<void>;
  updateSubscriptionStatus(vendorId: string, status: string): Promise<void>;
}