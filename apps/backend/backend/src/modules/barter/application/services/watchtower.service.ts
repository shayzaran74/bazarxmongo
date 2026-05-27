// apps/backend/src/modules/barter/application/services/watchtower.service.ts
// Master Plan v4.3 §3.4 — Watchtower ve Denetim
// ADR-005 Faz 2c: Prisma → Mongoose (WatchtowerService migration)

import { Injectable, Logger } from '@nestjs/common';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import { DomainException } from '@barterborsa/shared-core';
import { MongoBlindPoolRepository } from '../../../barterborsa/infrastructure/persistence/mongo-blind-pool.repository';
import { MongoVendorB2BDataRepository } from '../../../barterborsa/infrastructure/persistence/mongo-vendor-b2b-data.repository';
import { AuditLogRepository } from '@barterborsa/shared-persistence/mongodb/audit/audit-log.repository';

export type WatchFlag = 'PRICE_MANIPULATION' | 'QUOTA_ABUSE' | 'SUSPICIOUS_PATTERN' | 'COMPLIANCE_BREACH';

export interface WatchtowerEvent {
  vendorId:    string;
  flag:        WatchFlag;
  description: string;
  tradeId?:    string;
  severity:    'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable()
export class WatchtowerService {
  private readonly logger = new Logger(WatchtowerService.name);

  constructor(
    private readonly auditLog:      AuditLogService,
    private readonly poolRepo:       MongoBlindPoolRepository,
    private readonly b2bDataRepo:    MongoVendorB2BDataRepository,
    private readonly auditRepo:      AuditLogRepository,
  ) {}

  async flag(event: WatchtowerEvent): Promise<void> {
    await this.auditLog.log({
      actorId:      event.vendorId,
      action:       `WATCHTOWER_FLAG_${event.flag}`,
      resourceType: 'Vendor',
      resourceId:   event.vendorId,
      newValue:     {
        flag:        event.flag,
        description: event.description,
        tradeId:     event.tradeId,
        severity:    event.severity,
        flaggedAt:   new Date().toISOString(),
      },
    });

    this.logger.warn('Watchtower bayrağı oluşturuldu', {
      vendorId: event.vendorId,
      flag:     event.flag,
      severity: event.severity,
    });
  }

  async checkPriceFloor(vendorId: string, offeredPrice: number, marketPrice: number): Promise<boolean> {
    const PRICE_FLOOR_THRESHOLD = 0.30;
    const isViolation = offeredPrice < marketPrice * (1 - PRICE_FLOOR_THRESHOLD);

    if (isViolation) {
      await this.flag({
        vendorId,
        flag:        'PRICE_MANIPULATION',
        description: `Teklif fiyatı (${offeredPrice}₺) piyasa değerinin %${Math.round((1 - offeredPrice / marketPrice) * 100)} altında`,
        severity:    'HIGH',
      });
    }

    return isViolation;
  }

  async checkSmartCap(poolId: string, vendorId: string, requestedQty: number): Promise<boolean> {
    const pool = await this.poolRepo.findById(poolId);
    if (!pool) return false;

    const pct = requestedQty / Number(pool.totalStock);
    const isViolation = pct > 0.25;

    if (isViolation) {
      await this.flag({
        vendorId,
        flag:        'QUOTA_ABUSE',
        description: `Tek işlemde havuz stoğunun %${Math.round(pct * 100)}'i talep edildi (limit: %25)`,
        severity:    'MEDIUM',
      });
    }

    return isViolation;
  }

  async checkBarterSmartCap(
    vendorId: string,
    collateralAmount: number,
    offerId: string,
  ): Promise<void> {
    const DEFAULT_BARTER_LIMIT = 50_000;

    const b2bData = await this.b2bDataRepo.findByVendorId(vendorId);

    const limit = b2bData?.barterLimitOverride
      ? Number(b2bData.barterLimitOverride.toString())
      : b2bData?.b2bWalletLimit
      ? Number(b2bData.b2bWalletLimit.toString())
      : DEFAULT_BARTER_LIMIT;

    const collateralNum = Number(collateralAmount);

    if (collateralNum > limit) {
      await this.flag({
        vendorId,
        flag: 'QUOTA_ABUSE',
        description: `Teminat tutarı (${collateralNum} TRY) firma limitini (${limit} TRY) aşıyor`,
        tradeId: offerId,
        severity: 'HIGH',
      });
      throw new DomainException(
        `Takas teklifi firma barter limitini aşıyor (limit: ${limit} TRY)`,
      );
    }
  }

  async getFlags(vendorId?: string, limit = 50): Promise<object[]> {
    const allLogs = await this.auditRepo.findByAction('WATCHTOWER_FLAG_', limit * 2);

    const filtered = vendorId
      ? allLogs.filter(log => log.actorId === vendorId)
      : allLogs;

    return filtered.slice(0, limit).map((log) => ({
      id:        log.id,
      vendorId:  log.actorId,
      flag:      log.action.replace('WATCHTOWER_FLAG_', ''),
      details:   log.newValue,
      flaggedAt: log.createdAt,
    }));
  }
}
