// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-vendor-score.repository.ts
// VendorScore + VendorViolation MongoDB repository (ADR-005 Faz 2a)

import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  VendorViolationModel,
  IVendorViolation,
  TrustScore,
  ITrustScore,
} from '@barterborsa/shared-persistence';
import { IVendorScoreRepository } from '../../domain/repositories/vendor-score.repository.interface';
import { VendorScore } from '../../domain/entities/vendor-score.entity';
import { VendorViolation } from '../../domain/entities/vendor-violation.entity';
import { VendorViolationType } from '../../domain/enums/vendor-violation-type.enum';

// Mapper for VendorViolation
class VendorViolationMapper {
  toDomain(persistence: IVendorViolation & { _id?: string }): VendorViolation {
    return VendorViolation.fromPersistence({
      vendorId: persistence.vendorId,
      type: persistence.type as VendorViolationType,
      severity: persistence.severity,
      description: persistence.description,
      relatedEntityId: persistence.relatedEntityId,
      relatedEntityType: persistence.relatedEntityType,
      penaltyScore: persistence.penaltyScore,
      isActive: persistence.isActive,
      expiresAt: persistence.expiresAt,
      createdAt: persistence.createdAt,
    }, persistence.id);
  }

  toPersistence(entity: VendorViolation): Record<string, unknown> {
    const props = entity.getProps();
    return {
      id: entity.id,
      vendorId: props.vendorId,
      type: props.type,
      severity: props.severity,
      description: props.description,
      relatedEntityId: props.relatedEntityId,
      relatedEntityType: props.relatedEntityType,
      penaltyScore: props.penaltyScore,
      isActive: props.isActive,
      expiresAt: props.expiresAt,
      createdAt: props.createdAt,
    };
  }
}

@Injectable()
export class MongoVendorScoreRepository implements IVendorScoreRepository {
  private readonly logger = new Logger(MongoVendorScoreRepository.name);
  private readonly violationMapper = new VendorViolationMapper();
  private readonly trustScoreModel: Model<ITrustScore>;
  private readonly violationModel: Model<IVendorViolation>;

  constructor() {
    this.trustScoreModel = TrustScore;
    this.violationModel = VendorViolationModel;
  }

  // =====================
  // VendorScore operations
  // =====================

  async findByVendorId(vendorId: string): Promise<VendorScore | null> {
    const doc = await this.trustScoreModel.findOne({ vendorId }).exec();
    if (!doc) return null;

    return this.mapTrustScoreToVendorScore(doc);
  }

  async findById(id: string): Promise<VendorScore | null> {
    const doc = await this.trustScoreModel.findOne({ id }).exec();
    if (!doc) return null;
    return this.mapTrustScoreToVendorScore(doc);
  }

  async save(score: VendorScore): Promise<void> {
    const props = score.getProps();
    await this.trustScoreModel.findOneAndUpdate(
      { vendorId: props.vendorId },
      {
        $set: {
          id: score.id,
          vendorId: props.vendorId,
          score: props.totalScore,
          tradingPerformance: props.commercialPerformanceScore,
          xpLoyalty: props.xpLoyaltyScore,
          compliance: props.complianceScore,
          lastCalculatedAt: new Date(),
        },
      },
      { upsert: true },
    ).exec();
  }

  async upsert(data: {
    vendorId: string;
    commercialPerformanceScore: number;
    xpLoyaltyScore: number;
    complianceScore: number;
    totalScore: number;
  }): Promise<void> {
    const id = 'vs-' + data.vendorId;
    await this.trustScoreModel.findOneAndUpdate(
      { vendorId: data.vendorId },
      {
        $set: {
          id,
          vendorId: data.vendorId,
          score: data.totalScore,
          tradingPerformance: data.commercialPerformanceScore,
          xpLoyalty: data.xpLoyaltyScore,
          compliance: data.complianceScore,
          lastCalculatedAt: new Date(),
        },
      },
      { upsert: true, new: true },
    ).exec();
  }

  async findAll(): Promise<VendorScore[]> {
    const docs = await this.trustScoreModel.find().exec();
    return docs.map(doc => this.mapTrustScoreToVendorScore(doc));
  }

  async delete(vendorId: string): Promise<void> {
    await this.trustScoreModel.deleteOne({ vendorId }).exec();
  }

  // =====================
  // VendorViolation operations
  // =====================

  async findViolationById(id: string): Promise<VendorViolation | null> {
    const doc = await this.violationModel.findOne({ id }).exec();
    if (!doc) return null;
    return this.violationMapper.toDomain(doc);
  }

  async findActiveViolationsByVendor(vendorId: string): Promise<VendorViolation[]> {
    const docs = await this.violationModel.find({
      vendorId,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }).exec();
    return docs.map(doc => this.violationMapper.toDomain(doc));
  }

  async findViolationsByVendorAndType(
    vendorId: string,
    type: VendorViolationType,
  ): Promise<VendorViolation[]> {
    const docs = await this.violationModel.find({ vendorId, type }).exec();
    return docs.map(doc => this.violationMapper.toDomain(doc));
  }

  async saveViolation(violation: VendorViolation): Promise<void> {
    const persistence = this.violationMapper.toPersistence(violation);
    await this.violationModel.findOneAndUpdate(
      { id: violation.id },
      { $set: persistence },
      { upsert: true },
    ).exec();
  }

  async deactivateViolation(id: string): Promise<void> {
    await this.violationModel.updateOne(
      { id },
      { $set: { isActive: false, updatedAt: new Date() } },
    ).exec();
  }

  async countActiveViolations(vendorId: string): Promise<number> {
    return this.violationModel.countDocuments({
      vendorId,
      isActive: true,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } },
      ],
    }).exec();
  }

  // =====================
  // Private helpers
  // =====================

  private mapTrustScoreToVendorScore(doc: ITrustScore & { _id?: string }): VendorScore {
    const now = new Date();
    return VendorScore.fromPersistence({
      vendorId: doc.vendorId,
      commercialPerformanceScore: Number(doc.tradingPerformance),
      xpLoyaltyScore: Number(doc.xpLoyalty),
      complianceScore: Number(doc.compliance),
      totalScore: Number(doc.score),
      lastCalculatedAt: doc.lastCalculatedAt ?? now,
      periodStart: doc.lastCalculatedAt ?? now,
      periodEnd: now,
      breakdown: {
        commercialPerformance: Number(doc.tradingPerformance),
        xpLoyalty: Number(doc.xpLoyalty),
        compliance: Number(doc.compliance),
      },
    }, doc.id);
  }
}