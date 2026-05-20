// apps/backend/src/modules/garage-sale/application/services/garage-sale-closer.service.ts
// Master Plan v4.3 §4.4 — Süresi dolan Garaj Günü kampanyalarını otomatik kapat.
// Stok bitince purchase handler zaten EXHAUSTED yapar; bu cron süre kontrolü içindir.

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IGarageSale } from '@barterborsa/shared-persistence';

@Injectable()
export class GarageSaleCloserService {
  private readonly logger = new Logger(GarageSaleCloserService.name);

  constructor(
    @InjectModel('GarageSale') private readonly gsModel: Model<IGarageSale>,
  ) {}

  /** Her 5 dakikada bir — süresi dolan ACTIVE/SCHEDULED kampanyaları EXPIRED'a çek. */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async closeExpiredSales(): Promise<void> {
    const now = new Date();
    const expired = await this.gsModel.updateMany(
      { status: { $in: ['ACTIVE', 'SCHEDULED'] }, endsAt: { $lte: now } },
      { $set: { status: 'EXPIRED', closedAt: now, closedReason: 'TIME_EXPIRED' } },
    );

    if (expired.modifiedCount > 0) {
      this.logger.log(`${expired.modifiedCount} Garaj Günü kampanyası süre dolduğu için kapatıldı.`);
    }

    // SCHEDULED → ACTIVE geçişi (başlangıç saati gelenler)
    const activated = await this.gsModel.updateMany(
      { status: 'SCHEDULED', startsAt: { $lte: now }, endsAt: { $gt: now } },
      { $set: { status: 'ACTIVE' } },
    );
    if (activated.modifiedCount > 0) {
      this.logger.log(`${activated.modifiedCount} Garaj Günü kampanyası aktif duruma geçti.`);
    }
  }
}
