// apps/backend/test/advertising/ad-auction.service.spec.ts

import { AdAuctionService } from '../../src/modules/advertising/application/services/ad-auction.service';
import { AdCampaign } from '../../src/modules/advertising/domain/entities/ad-campaign.entity';
import { AdSlotType, AdType, BillingModel, PricingModel, TargetRole } from '../../src/modules/advertising/domain/enums/advertising.enums';

describe('AdAuctionService', () => {
  let service: AdAuctionService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findActiveBySlot: jest.fn(),
    };
    service = new AdAuctionService(mockRepo);
  });

  const createMockCampaign = (id: string, bid: number, score: number) => {
    const campaign = AdCampaign.create({
      name: `Ad ${id}`,
      platform: 'BAZARX',
      budget: 1000,
      adType: AdType.BANNER,
      bidAmount: bid,
      billingModel: BillingModel.PREPAID,
      pricingModel: PricingModel.CPC,
      startDate: new Date(),
      endDate: new Date(Date.now() + 86400000),
      targetCategories: [],
      targetKeywords: [],
      targetRole: TargetRole.ALL,
      targetCities: [],
      targetDistricts: [],
      targetSlots: ['HOME_BANNER'],
      negativeKeywords: [],
    }, id);
    campaign.approve();
    // Manual override for quality score (normally set on create/update)
    (campaign.getProps() as any).qualityScore = score; 
    return campaign;
  };

  it('should sort ads by rank (bid * score)', async () => {
    const ad1 = createMockCampaign('1', 5, 2); // Rank 10, Older
    ad1.getProps().createdAt = new Date(2020, 1, 1);
    
    const ad2 = createMockCampaign('2', 2, 8); // Rank 16
    
    const ad3 = createMockCampaign('3', 10, 1); // Rank 10, Newer
    ad3.getProps().createdAt = new Date(2023, 1, 1);
    
    mockRepo.findActiveBySlot.mockResolvedValue([ad1, ad2, ad3]);

    const result = await service.getAdsForSlot(AdSlotType.HOMEPAGE_BANNER, 'BAZARX', {});

    expect(result[0].id.toString()).toBe('2'); // Highest rank
    expect(result[result.length - 1].id.toString()).toBe('1'); // Tie handled by sort order
  });

  it('should filter by keywords', async () => {
    const ad1 = createMockCampaign('1', 5, 1);
    ad1.getProps().targetKeywords = ['electronics'];
    
    const ad2 = createMockCampaign('2', 5, 1);
    ad2.getProps().targetKeywords = ['fashion'];

    mockRepo.findActiveBySlot.mockResolvedValue([ad1, ad2]);

    const result = await service.getAdsForSlot(AdSlotType.HOMEPAGE_BANNER, 'BAZARX', { keywords: ['fashion'] });

    expect(result).toHaveLength(1);
    expect(result[0].id.toString()).toBe('2');
  });

  it('should exclude negative keywords', async () => {
    const ad1 = createMockCampaign('1', 5, 1);
    ad1.getProps().targetKeywords = ['shoe'];
    ad1.getProps().negativeKeywords = ['used'];

    mockRepo.findActiveBySlot.mockResolvedValue([ad1]);

    const matched = await service.getAdsForSlot(AdSlotType.HOMEPAGE_BANNER, 'BAZARX', { keywords: ['shoe'] });
    expect(matched).toHaveLength(1);

    const excluded = await service.getAdsForSlot(AdSlotType.HOMEPAGE_BANNER, 'BAZARX', { keywords: ['shoe', 'used'] });
    expect(excluded).toHaveLength(0);
  });
});
