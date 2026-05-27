// apps/backend/src/infrastructure/rate-limit/tier-rate-limit.module.ts

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorSchema, TierBenefitSchema } from '@barterborsa/shared-persistence';
import { TierRateLimitGuard } from './tier-rate-limit.guard';

/**
 * TierRateLimitModule — Vendor başına dakikalık API istek sınırı.
 *
 * Limit kaynağı: tier_benefits.apiRatePerMin (CORE:60, PRIME:120, ELITE:300, APEX:1000)
 * Önbellek: CACHE_MANAGER (dev: in-memory, prod: Redis)
 * Bypass: @SkipTierRateLimit() dekoratörü, Admin/SuperAdmin, public routes
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vendor',      schema: VendorSchema },
      { name: 'TierBenefit', schema: TierBenefitSchema },
    ]),
  ],
  providers: [
    TierRateLimitGuard,
    {
      provide:  APP_GUARD,
      useClass: TierRateLimitGuard,
    },
  ],
  exports: [TierRateLimitGuard],
})
export class TierRateLimitModule {}
