// apps/backend/src/modules/advertising/infrastructure/persistence/mongo-ad-campaign.repository.ts
// AdCampaign repository — Mongoose implementation (ADR-005 Faz 2b)

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { AdCampaign as AdCampaignModel, IAdCampaign } from '@barterborsa/shared-persistence/schemas/backend/adCampaign.schema';
import { AdCampaignMetric } from '@barterborsa/shared-persistence/schemas/backend/adCampaignMetric.schema';
import { AdCampaignMapper, AdCampaignDocument } from './mappers/ad-campaign.mapper';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { AdCampaign } from '../../domain/entities/ad-campaign.entity';
import { AdSlotType } from '../../domain/enums/advertising.enums';

@Injectable()
export class MongoAdCampaignRepository
  extends BaseMongoRepository<AdCampaign, AdCampaignDocument>
  implements IAdCampaignRepository
{
  constructor() {
    const model: Model<AdCampaignDocument> = AdCampaignModel;
    super(model, {
      toDomain: AdCampaignMapper.toDomain.bind(AdCampaignMapper),
      toPersistence: AdCampaignMapper.toPersistence.bind(AdCampaignMapper),
    });
  }

  async findActiveBySlot(slotType: AdSlotType, platform: string): Promise<AdCampaign[]> {
    const docs = await this.model.find({
      adStatus: 'ACTIVE',
      platform,
    }).exec();
    return docs.map(doc => AdCampaignMapper.toDomain(doc));
  }

  async findByVendorId(vendorId: string): Promise<AdCampaign[]> {
    const docs = await this.model.find({ vendorId }).exec();
    return docs.map(doc => AdCampaignMapper.toDomain(doc));
  }

  async findActiveByListingAndSlot(listingId: string, slotType: string): Promise<AdCampaign | null> {
    const doc = await this.model.findOne({
      targetListingId: listingId,
      targetSlotType: slotType,
      adStatus: 'ACTIVE',
    }).exec();
    return doc ? AdCampaignMapper.toDomain(doc) : null;
  }

  async updateMetric(campaignId: string, type: 'impression' | 'click', cost: number): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const inc = type === 'impression'
      ? { impressions: 1, spend: cost }
      : { clicks: 1, spend: cost };
    await AdCampaignMetric.updateOne(
      { adCampaignId: campaignId, date: today },
      {
        $inc: inc,
        $setOnInsert: {
          id: randomUUID(),
          adCampaignId: campaignId,
          date: today,
          sales: 0,
        },
      },
      { upsert: true },
    ).exec();
  }
}