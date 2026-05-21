// apps/backend/src/modules/advertising/application/services/ad-auction.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { AdCampaign } from '../../domain/entities/ad-campaign.entity';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { AdSlotType } from '../../domain/enums/advertising.enums';

interface AdAuctionContext {
  keywords?: string[];
}

@Injectable()
export class AdAuctionService {
  constructor(
    @Inject('IAdCampaignRepository') private readonly campaignRepository: IAdCampaignRepository,
  ) {}

  async getAdsForSlot(slotType: AdSlotType, platform: string, context: AdAuctionContext): Promise<AdCampaign[]> {
    const activeCampaigns = await this.campaignRepository.findActiveBySlot(slotType, platform);

    // 1. Filter campaigns that are actually running (date + budget)
    const runningCampaigns = activeCampaigns.filter(c => c.isRunning());

    // 2. Hedefleme Kontrolü (Simple version for now, can be expanded)
    const targetedCampaigns = runningCampaigns.filter(c => {
      const props = c.getProps();

      // Keywords check
      if (context.keywords && props.targetKeywords.length > 0) {
        const hasKeyword = props.targetKeywords.some(k => context.keywords!.includes(k));
        if (!hasKeyword) return false;
      }

      // Negative keywords check
      if (context.keywords && props.negativeKeywords.length > 0) {
        const hasNegative = props.negativeKeywords.some(k => context.keywords!.includes(k));
        if (hasNegative) return false;
      }

      return true;
    });

    // 3. Ad Rank Hesapla ve Sırala: bidAmount × qualityScore, then createdAt (desc)
    return targetedCampaigns.sort((a, b) => {
      const rankA = a.getProps().bidAmount * a.getProps().qualityScore;
      const rankB = b.getProps().bidAmount * b.getProps().qualityScore;

      if (rankA !== rankB) {
        return rankB - rankA;
      }

      return b.getProps().createdAt.getTime() - a.getProps().createdAt.getTime();
    });
  }
}
