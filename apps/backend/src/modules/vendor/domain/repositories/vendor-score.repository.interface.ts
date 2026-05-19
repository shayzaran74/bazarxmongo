// apps/backend/src/modules/vendor/domain/repositories/vendor-score.repository.interface.ts

import { VendorScore } from '../entities/vendor-score.entity';
import { VendorViolation } from '../entities/vendor-violation.entity';
import { VendorViolationType } from '../enums/vendor-violation-type.enum';

export interface IVendorScoreRepository {
  // VendorScore operations
  findByVendorId(vendorId: string): Promise<VendorScore | null>;
  findById(id: string): Promise<VendorScore | null>;
  save(score: VendorScore): Promise<void>;
  upsert(score: { vendorId: string; commercialPerformanceScore: number; xpLoyaltyScore: number; complianceScore: number; totalScore: number }): Promise<void>;
  findAll(): Promise<VendorScore[]>;
  delete(vendorId: string): Promise<void>;

  // VendorViolation operations
  findViolationById(id: string): Promise<VendorViolation | null>;
  findActiveViolationsByVendor(vendorId: string): Promise<VendorViolation[]>;
  findViolationsByVendorAndType(vendorId: string, type: VendorViolationType): Promise<VendorViolation[]>;
  saveViolation(violation: VendorViolation): Promise<void>;
  deactivateViolation(id: string): Promise<void>;
  countActiveViolations(vendorId: string): Promise<number>;
}