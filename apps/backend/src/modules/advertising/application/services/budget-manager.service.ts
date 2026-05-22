// apps/backend/src/modules/advertising/application/services/budget-manager.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';

@Injectable()
export class BudgetManagerService {
  constructor(
    @Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository,
  ) {}

  async deductBudget(campaignId: string, amount: number, event: 'click' | 'impression' = 'click'): Promise<void> {
    const campaign = await this.repository.findById(campaignId);
    if (!campaign || !campaign.hasBudget()) return;

    const model = campaign.getProps().pricingModel;
    if (model === 'CPC' && event === 'click') {
      campaign.recordClick(amount);
      await this.repository.save(campaign);
      await this.repository.updateMetric(campaignId, 'click', amount);
    } else if (model === 'CPM' && event === 'impression') {
      campaign.recordImpression(amount);
      await this.repository.save(campaign);
      await this.repository.updateMetric(campaignId, 'impression', amount);
    }
  }
}
