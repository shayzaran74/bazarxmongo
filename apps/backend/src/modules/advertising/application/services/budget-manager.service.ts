// apps/backend/src/modules/advertising/application/services/budget-manager.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class BudgetManagerService {
  constructor(
    @Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository,
    private readonly prisma: PrismaService,
  ) {}

  async deductBudget(campaignId: string, amount: number): Promise<void> {
    // Race condition'a karşı Prisma transaction kullanıyoruz
    await this.prisma.$transaction(async (tx) => {
      const campaign = await this.repository.findById(campaignId);
      if (!campaign || !campaign.hasBudget()) return;

      if (campaign.getProps().pricingModel === 'CPC' || campaign.getProps().pricingModel === 'CPM') {
        // Record at domain level
        campaign.recordClick(amount); 
        await this.repository.save(campaign);
        
        // Also update actual tabular metrics for reporting
        await this.repository.updateMetric(campaignId, 'click', amount);
      }
    });
  }
}
