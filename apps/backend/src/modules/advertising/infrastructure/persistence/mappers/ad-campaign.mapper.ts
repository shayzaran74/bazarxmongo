// apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.ts
// AdCampaignMapper — Prisma → Mongoose (ADR-005 Faz 2b)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { IAdCampaign } from '@barterborsa/shared-persistence/schemas/backend/adCampaign.schema';
import { AdCampaign } from '../../../domain/entities/ad-campaign.entity';

export interface AdCampaignDocument extends IAdCampaign {
  _id?: string;
}

@Injectable()
export class AdCampaignMapper {
  static toDomain(doc: AdCampaignDocument): AdCampaign {
    return (AdCampaign as any).createFrom({
      name: doc.name,
      vendorId: doc.vendorId ?? undefined,
      creatorId: doc.creatorId ?? undefined,
      budget: Number(doc.budget) || 0,
      remainingBudget: Number(doc.remainingBudget) || 0,
      bidAmount: Number(doc.bidAmount) || 0,
      startDate: doc.startDate,
      endDate: doc.endDate,
      imageUrl: doc.imageUrl ?? undefined,
      linkUrl: doc.linkUrl ?? undefined,
      targetUrl: doc.targetUrl ?? undefined,
      mediaUrl: doc.mediaUrl ?? undefined,
      adStatus: doc.adStatus as any,
      adType: doc.adType as any,
      platform: doc.platform ?? undefined,
      qualityScore: Number(doc.qualityScore) || 0,
      historicCTR: Number(doc.historicCTR) || 0,
      maxBidPerClick: doc.maxBidPerClick ? Number(doc.maxBidPerClick) : undefined,
      maxBidPerMille: doc.maxBidPerMille ? Number(doc.maxBidPerMille) : undefined,
      rejectionReason: doc.rejectionReason ?? undefined,
      metadata: doc.metadata as unknown as Record<string, unknown> | undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    }, doc.id);
  }

  static toPersistence(domain: AdCampaign): Record<string, unknown> {
    const props = domain.getProps();
    return {
      _id: domain.id,
      id: domain.id,
      name: props.name,
      vendorId: props.vendorId,
      creatorId: props.creatorId,
      budget: Types.Decimal128.fromString(String(props.budget)),
      remainingBudget: Types.Decimal128.fromString(String(props.remainingBudget)),
      bidAmount: Types.Decimal128.fromString(String(props.bidAmount)),
      startDate: props.startDate,
      endDate: props.endDate,
      imageUrl: props.imageUrl,
      linkUrl: props.linkUrl,
      targetUrl: props.targetUrl,
      mediaUrl: props.mediaUrl,
      adStatus: props.adStatus,
      adType: props.adType,
      platform: props.platform,
      qualityScore: Types.Decimal128.fromString(String(props.qualityScore)),
      historicCTR: Types.Decimal128.fromString(String(props.historicCTR)),
      maxBidPerClick: props.maxBidPerClick != null ? Types.Decimal128.fromString(String(props.maxBidPerClick)) : undefined,
      maxBidPerMille: props.maxBidPerMille != null ? Types.Decimal128.fromString(String(props.maxBidPerMille)) : undefined,
      rejectionReason: props.rejectionReason,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}