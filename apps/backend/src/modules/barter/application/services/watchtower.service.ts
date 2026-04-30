// apps/backend/src/modules/barter/application/services/watchtower.service.ts
// Master Plan v4.3 §3.4 — Watchtower ve Denetim
// KVKK md. 5, 10, 12 — kullanıcı üyelik sözleşmesinde bu yetkiyi kabul eder

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';

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
    private readonly prisma:    PrismaService,
    private readonly auditLog:  AuditLogService,
  ) {}

  // Şüpheli işlemi kaydet ve ilgili admin'e bildir
  async flag(event: WatchtowerEvent): Promise<void> {
    // Şifreli log formatında AuditLog'a kaydet
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

  // Fiyat tabanı (Price Floor) ihlali tespiti
  async checkPriceFloor(vendorId: string, offeredPrice: number, marketPrice: number): Promise<boolean> {
    const PRICE_FLOOR_THRESHOLD = 0.30; // Piyasa fiyatının %30 altı şüpheli
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

  // Smart Cap (%25) ihlali tespiti
  async checkSmartCap(poolId: string, vendorId: string, requestedQty: number): Promise<boolean> {
    const pool = await this.prisma.blindPool.findUnique({
      where: { id: poolId },
      select: { totalStock: true },
    });
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

  // Admin: Watchtower olaylarını listele
  async getFlags(vendorId?: string, limit = 50): Promise<object[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action:       { startsWith: 'WATCHTOWER_FLAG_' },
        ...(vendorId ? { actorId: vendorId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return logs.map((log) => ({
      id:          log.id,
      vendorId:    log.actorId,
      flag:        log.action.replace('WATCHTOWER_FLAG_', ''),
      details:     log.newValue,
      flaggedAt:   log.createdAt,
    }));
  }
}
