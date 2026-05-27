// apps/backend/src/infrastructure/rate-limit/tier-rate-limit.guard.ts

import {
  Injectable, CanActivate, ExecutionContext,
  Inject, HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model } from 'mongoose';
import { IVendor, ITierBenefit } from '@barterborsa/shared-persistence';
import { SKIP_TIER_RATE_LIMIT } from './skip-tier-rate-limit.decorator';

// Dakika bucket'ı — her dakikada bir sıfırlanır
const minuteBucket = () => Math.floor(Date.now() / 60_000);

// Tier config önbellek süresi: 5 dakika (ms)
const TIER_CACHE_TTL = 300_000;

// Rate limit sayaç TTL'i: 70 saniye (küçük buffer)
const RL_COUNTER_TTL = 70_000;

// Vendor→tier mapping önbellek süresi: 2 dakika
const VENDOR_TIER_CACHE_TTL = 120_000;

// Fallback limit — tier bulunamazsa uygulanır
const FALLBACK_LIMIT = 60;

@Injectable()
export class TierRateLimitGuard implements CanActivate {
  private readonly logger = new Logger(TierRateLimitGuard.name);

  constructor(
    private readonly reflector:   Reflector,
    @Inject(CACHE_MANAGER)       private readonly cache:       Cache,
    @InjectModel('Vendor')       private readonly vendorModel: Model<IVendor>,
    @InjectModel('TierBenefit')  private readonly tierModel:   Model<ITierBenefit>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ── Dekoratör bypass ──────────────────────────────────────────────────
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_TIER_RATE_LIMIT, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const request = context.switchToHttp().getRequest<{
      user?: { id?: string; role?: string };
    }>();
    const user = request.user;

    // Giriş yapmamış kullanıcılar — public endpoint, geç
    if (!user?.id) return true;

    // Admin / SuperAdmin — sınırsız
    const adminRoles = ['ADMIN', 'SUPER_ADMIN'];
    if (user.role && adminRoles.includes(user.role)) return true;

    // VENDOR değilse (normal kullanıcı) — geç
    if (user.role !== 'VENDOR') return true;

    const userId = user.id;

    // ── Vendor tier'ını al (önbellekli) ──────────────────────────────────
    const vendorCacheKey = `tier:vendor:${userId}`;
    let vendorTier = await this.cache.get<string>(vendorCacheKey);

    if (!vendorTier) {
      const vendor = await this.vendorModel
        .findOne({ userId }, { tier: 1, id: 1 })
        .lean();

      vendorTier = vendor?.tier ?? 'CORE';
      await this.cache.set(vendorCacheKey, vendorTier, VENDOR_TIER_CACHE_TTL);
    }

    // ── Tier limitini al (önbellekli) ─────────────────────────────────────
    const tierConfigKey = `tier:config:${vendorTier}`;
    let apiRatePerMin = await this.cache.get<number>(tierConfigKey);

    if (apiRatePerMin === null || apiRatePerMin === undefined) {
      const benefit = await this.tierModel
        .findOne({ tier: vendorTier }, { apiRatePerMin: 1 })
        .lean();

      apiRatePerMin = benefit?.apiRatePerMin ?? FALLBACK_LIMIT;
      await this.cache.set(tierConfigKey, apiRatePerMin, TIER_CACHE_TTL);
    }

    // ── Rate limiti uygula ────────────────────────────────────────────────
    const bucket  = minuteBucket();
    const rlKey   = `tier:rl:${userId}:${bucket}`;
    const current = (await this.cache.get<number>(rlKey)) ?? 0;

    if (current >= apiRatePerMin) {
      this.logger.warn(
        `Rate limit aşıldı — userId: ${userId} tier: ${vendorTier} limit: ${apiRatePerMin}/dk`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error:      'Too Many Requests',
          message:    `${vendorTier} tier için dakikalık API limiti (${apiRatePerMin} istek) aşıldı. Bir dakika sonra tekrar deneyin.`,
          tier:       vendorTier,
          limit:      apiRatePerMin,
          resetAt:    new Date((bucket + 1) * 60_000).toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Sayacı artır — TTL'i her seferinde yenile
    await this.cache.set(rlKey, current + 1, RL_COUNTER_TTL);

    return true;
  }
}
