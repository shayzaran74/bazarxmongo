import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorTrustScoreQuery } from './get-vendor-trust-score.query';
import { VendorTierVO } from '../../../vendor/domain/value-objects/vendor-tier.vo';
import { VendorTier } from '../../../vendor/domain/enums/vendor-tier.enum';

@QueryHandler(GetVendorTrustScoreQuery)
export class GetVendorTrustScoreHandler implements IQueryHandler<GetVendorTrustScoreQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute(query: GetVendorTrustScoreQuery) {
    const { vendorId } = query;

    const [vendor, trustScore] = await Promise.all([
      this.prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { tier: true, status: true },
      }),
      this.prisma.trustScore.findUnique({ where: { vendorId } }),
    ]);

    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    const tier   = vendor.tier as VendorTier;
    const tierVO = VendorTierVO.create(tier);

    // TrustScore yoksa varsayılan 100 göster
    const score = trustScore ?? {
      score: 100, tradingPerformance: 100, xpLoyalty: 100, compliance: 100,
      violationCount: 0, isFrozen: false, inactiveDays: 0, lastCalculatedAt: new Date(),
    };

    return {
      vendorId,
      tier,
      tierInfo: {
        annualFee:       tierVO.getAnnualFee(),
        commissionRate:  tierVO.getCommissionRate(),
        groupRate:       tierVO.getGroupCommissionRate(),
        xpDiscountRate:  tierVO.getXpDiscountedRate(),
        poolLimit:       tierVO.getPoolLimit(),
      },
      trustScore: {
        overall:           Number(score.score),
        tradingPerformance: Number(score.tradingPerformance),
        xpLoyalty:         Number(score.xpLoyalty),
        compliance:        Number(score.compliance),
        violationCount:    score.violationCount,
        isFrozen:          score.isFrozen,
        inactiveDays:      score.inactiveDays,
        lastCalculatedAt:  score.lastCalculatedAt,
        // Skor açıklaması
        level: this.scoreLevel(Number(score.score)),
      },
    };
  }

  private scoreLevel(score: number): string {
    if (score >= 90) return 'Mükemmel';
    if (score >= 75) return 'İyi';
    if (score >= 60) return 'Orta';
    if (score >= 40) return 'Düşük';
    return 'Kritik';
  }
}
