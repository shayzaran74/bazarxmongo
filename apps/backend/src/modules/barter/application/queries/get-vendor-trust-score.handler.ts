import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { GetVendorTrustScoreQuery } from './get-vendor-trust-score.query';
import { VendorTierVO } from '../../../vendor/domain/value-objects/vendor-tier.vo';
import { VendorTier } from '../../../vendor/domain/enums/vendor-tier.enum';
import { IVendorRepository } from '../../../vendor/domain/repositories/vendor.repository.interface';
import { ITrustScoreRepository } from '../../../vendor/domain/repositories/trust-score.repository.interface';

@QueryHandler(GetVendorTrustScoreQuery)
export class GetVendorTrustScoreHandler implements IQueryHandler<GetVendorTrustScoreQuery> {
  constructor(
    @Inject('IVendorRepository') private readonly vendorRepository: IVendorRepository,
    @Inject('ITrustScoreRepository') private readonly trustScoreRepository: ITrustScoreRepository,
  ) {}

  async execute(query: GetVendorTrustScoreQuery) {
    const { vendorId } = query;

    const vendor = await this.vendorRepository.findById(vendorId);
    if (!vendor) throw new NotFoundException('Vendor bulunamadı');

    const trustScore = await this.trustScoreRepository.findByVendorId(vendorId);

    const tier = vendor.getProps().tier as VendorTier;
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
        overall:           score.score,
        tradingPerformance: score.tradingPerformance,
        xpLoyalty:         score.xpLoyalty,
        compliance:        score.compliance,
        violationCount:    score.violationCount,
        isFrozen:          score.isFrozen,
        inactiveDays:      score.inactiveDays,
        lastCalculatedAt:  score.lastCalculatedAt,
        level: this.scoreLevel(score.score),
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