// apps/backend/src/modules/vendor/application/schedulers/garage-sale.scheduler.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GarageSaleService } from '../services/garage-sale.service';
import { RedisService } from '@barterborsa/shared-security';

const LOCK_KEY = 'scheduler:garage-sale:lock';
const LOCK_TTL_SECONDS = 55;

@Injectable()
export class GarageSaleScheduler {
  private readonly logger = new Logger(GarageSaleScheduler.name);

  constructor(
    private readonly garageSaleService: GarageSaleService,
    private readonly redisService: RedisService,
  ) {}

  @Cron('*/5 * * * *')
  async activateScheduledSales(): Promise<void> {
    const locked = await this.redisService.get(LOCK_KEY);
    if (locked === '1') return;
    await this.redisService.set(LOCK_KEY, '1', LOCK_TTL_SECONDS);

    try {
      await this.garageSaleService.activateScheduledSales();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`activateScheduledSales hatası: ${msg}`);
    } finally {
      await this.redisService.del(LOCK_KEY);
    }
  }

  @Cron('*/5 * * * *')
  async closeExpiredSales(): Promise<void> {
    const lockKey = 'scheduler:garage-sale-close:lock';
    const locked = await this.redisService.get(lockKey);
    if (locked === '1') return;
    await this.redisService.set(lockKey, '1', LOCK_TTL_SECONDS);

    try {
      await this.garageSaleService.closeExpiredSales();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`closeExpiredSales hatası: ${msg}`);
    } finally {
      await this.redisService.del(lockKey);
    }
  }
}
