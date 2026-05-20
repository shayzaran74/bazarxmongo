// apps/backend/src/modules/menu/application/services/menu-rights-cleanup.service.ts
// Master Plan v4.3 §2.7 — Downgrade grace süresi (30 gün) dolan menü haklarını deaktive eder.

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IMenuRight } from '@barterborsa/shared-persistence';

@Injectable()
export class MenuRightsCleanupService {
  private readonly logger = new Logger(MenuRightsCleanupService.name);

  constructor(
    @InjectModel('MenuRight') private readonly menuRightModel: Model<IMenuRight>,
  ) {}

  /**
   * Her gece 03:00 — süresi dolan menü haklarını deaktive eder.
   * Hem normal hak hem DOWNGRADE_GRACE için aynı kural uygulanır.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanupExpiredRights(): Promise<void> {
    const now = new Date();
    const result = await this.menuRightModel.updateMany(
      { isActive: true, validUntil: { $lt: now } },
      { $set: { isActive: false } },
    );
    if (result.modifiedCount > 0) {
      this.logger.log(`Süresi dolan ${result.modifiedCount} menü hakkı deaktive edildi.`);
    }
  }
}
