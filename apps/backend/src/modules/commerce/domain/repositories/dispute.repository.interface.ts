// apps/backend/src/modules/commerce/domain/repositories/dispute.repository.interface.ts

import { Dispute } from '@prisma/client';

export interface IDisputeRepository {
  save(dispute: Partial<Dispute>): Promise<Dispute>;
  findById(id: string): Promise<Dispute | null>;
  findByOrderId(orderId: string): Promise<Dispute | null>;
  list(filters: { status?: string; vendorId?: string; userId?: string }): Promise<Dispute[]>;
}
