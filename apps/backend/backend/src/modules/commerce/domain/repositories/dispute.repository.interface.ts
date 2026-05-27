// apps/backend/src/modules/commerce/domain/repositories/dispute.repository.interface.ts

export interface DisputeRecord {
  id: string;
  orderId: string;
  userId: string;
  vendorId: string;
  reason: string;
  description?: string | null;
  status: string;
  evidenceUrls?: string[];
  adminNote?: string | null;
  resolvedAt?: Date | null;
  resolutionType?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDisputeRepository {
  save(dispute: Partial<DisputeRecord>): Promise<DisputeRecord>;
  findById(id: string): Promise<DisputeRecord | null>;
  findByOrderId(orderId: string): Promise<DisputeRecord | null>;
  list(filters: { status?: string; vendorId?: string; userId?: string }): Promise<DisputeRecord[]>;
}
