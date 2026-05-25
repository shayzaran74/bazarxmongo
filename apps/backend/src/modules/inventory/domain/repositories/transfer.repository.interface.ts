// apps/backend/src/modules/inventory/domain/repositories/transfer.repository.interface.ts

import { TransferSearchResult } from '../../infrastructure/persistence/mongo-transfer.repository';

export interface ITransferRepository {
  findByVendorId(vendorId: string): Promise<TransferSearchResult[]>;
  findById(id: string): Promise<TransferSearchResult | null>;
}