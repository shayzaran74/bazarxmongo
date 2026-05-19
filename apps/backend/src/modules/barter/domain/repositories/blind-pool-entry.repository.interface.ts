// apps/backend/src/modules/barter/domain/repositories/blind-pool-entry.repository.interface.ts

export interface IBlindPoolEntryRepository {
  closeEntriesByVendor(vendorId: string): Promise<void>;
}