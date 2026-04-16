// apps/backend/src/modules/advertising/infrastructure/persistence/mappers/ad-campaign.mapper.ts

import { AdCampaign } from '../../../domain/entities/ad-campaign.entity';

export class AdCampaignMapper {
  static toDomain(raw: any): AdCampaign {
    return (AdCampaign as any).create({
      ...raw,
      budget: Number(raw.budget),
      remainingBudget: Number(raw.remainingBudget),
      bidAmount: Number(raw.bidAmount),
      qualityScore: Number(raw.qualityScore),
      historicCTR: Number(raw.historicCTR),
      maxBidPerClick: raw.maxBidPerClick ? Number(raw.maxBidPerClick) : undefined,
      maxBidPerMille: raw.maxBidPerMille ? Number(raw.maxBidPerMille) : undefined,
    }, raw.id);
  }

  static toPersistence(domain: AdCampaign): any {
    const props = domain.getProps();
    return {
      ...props,
      id: domain.id.toString(),
      budget: props.budget,
      remainingBudget: props.remainingBudget,
      bidAmount: props.bidAmount,
      qualityScore: props.qualityScore,
      historicCTR: props.historicCTR,
      adStatus: props.adStatus as any,
      adType: props.adType as any,
      billingModel: props.billingModel as any,
      pricingModel: props.pricingModel as any,
      targetRole: props.targetRole as any,
      platform: props.platform as any,
    };
  }
}
