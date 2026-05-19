// apps/backend/src/modules/identity/infrastructure/persistence/mongo-referral.repository.ts
// Referral repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Referral as ReferralModel } from '@barterborsa/shared-persistence';
import { IReferralRepository } from '../../domain/repositories/referral.repository.interface';

@Injectable()
export class MongoReferralRepository implements IReferralRepository {
  private readonly model: Model<any>;

  constructor() {
    this.model = ReferralModel;
  }

  async findByReferee(refereeId: string): Promise<any | null> {
    const doc = await this.model.findOne({ refereeId }).exec();
    return doc ? doc.toObject() : null;
  }

  async findByReferrer(referrerId: string): Promise<any[]> {
    const docs = await this.model.find({ referrerId }).sort({ createdAt: -1 }).exec();
    return docs.map(doc => doc.toObject());
  }

  async findReverseReferral(referrerId: string, refereeId: string): Promise<any | null> {
    const doc = await this.model.findOne({ referrerId: refereeId, refereeId: referrerId }).exec();
    return doc ? doc.toObject() : null;
  }

  async create(data: { referrerId: string; refereeId: string; referralCode: string }): Promise<void> {
    const id = 'ref-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    await this.model.create({
      id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async updateRewardGranted(refereeId: string, xpGranted: number, bonusGranted: number): Promise<void> {
    await this.model.updateOne(
      { refereeId },
      {
        $set: {
          xpGranted,
          bonusGranted,
          rewardGrantedAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ).exec();
  }
}