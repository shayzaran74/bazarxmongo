// apps/backend/src/modules/inventory/domain/repositories/transfer.repository.interface.ts

export interface ITransferRepository {
  findByVendorId(vendorId: string): Promise<any[]>;
  findById(id: string): Promise<any | null>;
}