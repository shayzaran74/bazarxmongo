// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-trust-score.repository.ts

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { TrustScore as TrustScoreModel, ITrustScore } from '@barterborsa/shared-persistence';
import { ITrustScoreRepository } from '../../domain/repositories/trust-score.repository.interface';

@Injectable()
export class MongoTrustScoreRepository implements ITrustScoreRepository {
  private readonly model: Model<ITrustScore>;

  constructor() {
    this.model = TrustScoreModel;
  }

  async findByVendorId(vendorId: string): Promise<any | null> {
    const doc = await this.model.findOne({ vendorId }).exec();
    return doc ? {
      id:                 doc.id,
      vendorId:           doc.vendorId,
      score:              Number(doc.score),
      tradingPerformance: Number(doc.tradingPerformance),
      xpLoyalty:          Number(doc.xpLoyalty),
      compliance:         Number(doc.compliance),
      level:              doc.level,
      lastCalculatedAt:   doc.lastCalculatedAt,
      isFrozen:           doc.isFrozen,
      violationCount:     doc.violationCount,
      inactiveDays:       doc.inactiveDays,
    } : null;
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async save(score: ITrustScore): Promise<void> {
    await this.model.findOneAndUpdate(
      { vendorId: score.vendorId },
      { $set: score },
      { upsert: true },
    );
  }

  async updateScore(vendorId: string, data: {
    score?: number;
    tradingPerformance?: number;
    xpLoyalty?: number;
    compliance?: number;
    level?: string;
    violationCount?: number;
    isFrozen?: boolean;
    inactiveDays?: number;
    lastCalculatedAt?: Date;
  }): Promise<void> {
    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.score             !== undefined) updateData.score             = data.score;
    if (data.tradingPerformance!== undefined) updateData.tradingPerformance= data.tradingPerformance;
    if (data.xpLoyalty         !== undefined) updateData.xpLoyalty         = data.xpLoyalty;
    if (data.compliance        !== undefined) updateData.compliance        = data.compliance;
    if (data.level             !== undefined) updateData.level             = data.level;
    if (data.violationCount    !== undefined) updateData.violationCount    = data.violationCount;
    if (data.isFrozen          !== undefined) updateData.isFrozen          = data.isFrozen;
    if (data.inactiveDays      !== undefined) updateData.inactiveDays      = data.inactiveDays;
    if (data.lastCalculatedAt  !== undefined) updateData.lastCalculatedAt  = data.lastCalculatedAt;
    await this.model.updateOne({ vendorId }, { $set: updateData }).exec();
  }

  async upsert(vendorId: string, data: {
    score: number;
    tradingPerformance: number;
    xpLoyalty: number;
    compliance: number;
    level: string;
    isFrozen?: boolean;
    inactiveDays?: number;
  }): Promise<void> {
    const docId = 'ts-' + vendorId;
    await this.model.findOneAndUpdate(
      { vendorId },
      {
        $set: {
          id:                 docId,
          vendorId,
          score:              data.score,
          tradingPerformance: data.tradingPerformance,
          xpLoyalty:          data.xpLoyalty,
          compliance:         data.compliance,
          level:              data.level,
          isFrozen:           data.isFrozen ?? false,
          inactiveDays:       data.inactiveDays ?? 0,
          lastCalculatedAt:   new Date(),
          updatedAt:          new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, new: true },
    ).exec();
  }

  async findFreezeCandidates(violationThreshold: number): Promise<{ vendorId: string; violationCount: number }[]> {
    const docs = await this.model
      .find(
        { violationCount: { $gte: violationThreshold }, isFrozen: false },
        { vendorId: 1, violationCount: 1 },
      )
      .lean()
      .exec();
    return (docs as { vendorId: string; violationCount: number }[]).map(d => ({
      vendorId: d.vendorId,
      violationCount: d.violationCount,
    }));
  }

  async findAll(): Promise<any[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => doc.toObject());
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }
}
