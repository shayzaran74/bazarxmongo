// apps/backend/src/modules/vendor/application/schedulers/garage-sale.scheduler.ts

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { GarageSaleService } from '../services/garage-sale.service';

@Injectable()
export class GarageSaleScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(GarageSaleScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly garageSaleService: GarageSaleService) {}

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  // Her 5 dakikada SCHEDULED → ACTIVE geçişi
  @Cron('*/5 * * * *')
  async activateScheduledSales(): Promise<void> {
    try {
      await this.garageSaleService.activateScheduledSales();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`activateScheduledSales hatası: ${msg}`);
    }
  }

  // Her 5 dakikada süresi dolan ACTIVE → ENDED geçişi
  @Cron('*/5 * * * *')
  async closeExpiredSales(): Promise<void> {
    try {
      await this.garageSaleService.closeExpiredSales();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      this.logger.error(`closeExpiredSales hatası: ${msg}`);
    }
  }
}