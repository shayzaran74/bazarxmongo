// apps/backend/test/advertising/ad-campaign.entity.spec.ts

import { AdCampaign } from '../../src/modules/advertising/domain/entities/ad-campaign.entity';
import { AdStatus, AdType, BillingModel, PricingModel, TargetRole } from '../../src/modules/advertising/domain/enums/advertising.enums';

describe('AdCampaign Entity', () => {
  const baseProps = {
    name: 'Summer Sale',
    platform: 'BAZARX',
    budget: 1000,
    adType: AdType.BANNER,
    bidAmount: 1,
    billingModel: BillingModel.PREPAID,
    pricingModel: PricingModel.CPC,
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000), // tomorrow
    targetCategories: [],
    targetKeywords: [],
    targetRole: TargetRole.ALL,
    targetCities: [],
    targetDistricts: [],
    targetSlots: ['HOME_BANNER'],
    negativeKeywords: [],
    vendorId: 'vendor-1',
  };

  it('should create a campaign in PENDING status', () => {
    const campaign = AdCampaign.create(baseProps);
    expect(campaign.getProps().adStatus).toBe(AdStatus.PENDING);
    expect(campaign.getProps().remainingBudget).toBe(1000);
  });

  it('should be activatable', () => {
    const campaign = AdCampaign.create(baseProps);
    campaign.approve();
    expect(campaign.getProps().adStatus).toBe(AdStatus.ACTIVE);
  });

  it('should deduct budget on impression/click', () => {
    const campaign = AdCampaign.create(baseProps);
    campaign.approve();
    campaign.recordClick(10);
    expect(campaign.getProps().remainingBudget).toBe(990);
  });

  it('should pause when budget is exhausted', () => {
    const campaign = AdCampaign.create(baseProps);
    campaign.approve();
    campaign.recordClick(1001);
    expect(campaign.getProps().remainingBudget).toBe(0);
    expect(campaign.getProps().adStatus).toBe(AdStatus.PAUSED);
  });

  it('should detect if it is currently running', () => {
    const campaign = AdCampaign.create(baseProps);
    campaign.approve();
    expect(campaign.isRunning()).toBe(true);

    // Expired
    const expiredCampaign = AdCampaign.create({
      ...baseProps,
      endDate: new Date(Date.now() - 1000),
    });
    expiredCampaign.approve();
    expect(expiredCampaign.isRunning()).toBe(false);
  });
});
