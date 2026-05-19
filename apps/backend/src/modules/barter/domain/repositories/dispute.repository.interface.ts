// apps/backend/src/modules/barter/domain/repositories/dispute.repository.interface.ts

export interface IDisputeRepository {
  create(data: {
    swapSessionId: string;
    tradeOfferId: string;
    openedById: string;
    respondentId: string;
    reason: string;
    status: string;
    resolutionDeadlineAt: Date;
  }): Promise<void>;
  updateStatus(id: string, status: string): Promise<void>;
  updateResolved(swapSessionId: string, data: {
    resolvedAt: Date;
    resolvedById: string;
    resolutionNote?: string;
  }): Promise<void>;
  findOpenByUserId(userId: string): Promise<{ id: string } | null>;
  findByStatus(status: string, limit?: number): Promise<any[]>;
  findById(id: string): Promise<any | null>;
  // Scheduler desteği
  findByStatusAndCreatedBefore(status: string, cutoff: Date, limit?: number): Promise<any[]>;
  findByStatusAndUpdatedBefore(status: string, cutoff: Date, limit?: number): Promise<any[]>;
  updateStatusAndDeadline(id: string, status: string, resolutionDeadlineAt: Date): Promise<void>;
  updateResolutionDetails(id: string, data: {
    status: string;
    resolution?: string;
    resolutionNote?: string;
    resolvedAt: Date;
    arbitratorType?: string;
    resolutionDeadlineAt?: Date;
  }): Promise<void>;
}