// apps/backend/src/modules/vendor/domain/repositories/trust-score.repository.interface.ts

export interface ITrustScoreRepository {
  findByVendorId(vendorId: string): Promise<any | null>;
  findById(id: string): Promise<any | null>;
  findAll(): Promise<any[]>;
  save(score: any): Promise<void>;
  delete(id: string): Promise<void>;
  updateScore(vendorId: string, data: {
    score?: number;
    tradingPerformance?: number;
    xpLoyalty?: number;
    compliance?: number;
    level?: string;
    violationCount?: number;
    isFrozen?: boolean;
    inactiveDays?: number;
    lastCalculatedAt?: Date;
  }): Promise<void>;
  upsert(vendorId: string, data: {
    score: number;
    tradingPerformance: number;
    xpLoyalty: number;
    compliance: number;
    level: string;
    isFrozen?: boolean;
    inactiveDays?: number;
  }): Promise<void>;
  findFreezeCandidates(violationThreshold: number): Promise<{ vendorId: string; violationCount: number }[]>;
}
