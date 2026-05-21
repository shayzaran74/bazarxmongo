// apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.ts
// AdCampaignMapper — Prisma → Mongoose (ADR-005 Faz 2b)

import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { IAdCampaign, AdCampaignStatus, AdType } from '@barterborsa/shared-persistence/schemas/backend/adCampaign.schema';
import { AdCampaign, AdCampaignProps } from '../../../domain/entities/ad-campaign.entity';
import { AdStatus, AdType as DomainAdType, BillingModel, PricingModel, TargetRole } from '../../../domain/enums/advertising.enums';

export interface AdCampaignDocument extends IAdCampaign {
  _id?: string;
}

@Injectable()
export class AdCampaignMapper {
  static toDomain(doc: AdCampaignDocument): AdCampaign {
    const props: AdCampaignProps = {
      name: doc.name,
      vendorId: doc.vendorId ?? undefined,
      creatorId: doc.creatorId ?? undefined,
      budget: Number(doc.budget) || 0,
      remainingBudget: Number(doc.remainingBudget) || 0,
      bidAmount: Number(doc.bidAmount) || 0,
      billingModel: BillingModel.PREPAID,
      pricingModel: PricingModel.CPC,
      adStatus: (doc.adStatus as AdStatus) ?? AdStatus.PENDING,
      adType: (doc.adType as DomainAdType) ?? DomainAdType.BANNER,
      platform: '',
      startDate: doc.startDate,
      endDate: doc.endDate,
      imageUrl: doc.imageUrl ?? undefined,
      linkUrl: doc.linkUrl ?? undefined,
      targetCategories: [],
      targetKeywords: [],
      targetRole: TargetRole.ALL,
      targetCities: [],
      targetDistricts: [],
      targetSlots: [],
      targetUrl: doc.targetUrl ?? undefined,
      qualityScore: Number(doc.qualityScore) || 0,
      historicCTR: Number(doc.historicCTR) || 0,
      maxBidPerClick: doc.maxBidPerClick ? Number(doc.maxBidPerClick) : undefined,
      maxBidPerMille: doc.maxBidPerMille ? Number(doc.maxBidPerMille) : undefined,
      mediaUrl: doc.mediaUrl ?? undefined,
      negativeKeywords: [],
      rejectionReason: doc.rejectionReason ?? undefined,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return AdCampaign.create(props as Omit<AdCampaignProps, 'createdAt' | 'updatedAt' | 'adStatus' | 'remainingBudget' | 'qualityScore' | 'historicCTR'>, doc.id);
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