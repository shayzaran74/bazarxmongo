// apps/backend/src/modules/commerce/application/services/return-scheduler.service.ts
// ReturnSchedulerService — 48 saat satıcı timeout sonrası auto-approve
// Master Plan §3.5.1: "Süre aşımında iade otomatik onaylanır"

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy, Inject } from '@nestjs/common';
import { IReturnRequestRepository } from '../../domain/repositories/return-request.repository.interface';
import { ReturnService } from './return.service';
import { ReturnStatus } from '../../domain/enums/return-status.enum';

const TICK_INTERVAL_MS = 15 * 60 * 1000; // 15 dakika
const BATCH_SIZE = 50;

@Injectable()
export class ReturnSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(ReturnSchedulerService.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('IReturnRequestRepository') private readonly returnRepo: IReturnRequestRepository,
    private readonly returnService: ReturnService,
  ) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      void this.tick();
      this.intervalHandle = setInterval(() => void this.tick(), TICK_INTERVAL_MS);
    }, 60_000); // Sistem yüklenene kadar 1 dakika bekle
    this.logger.log('ReturnSchedulerService başlatıldı (15 dakika periyot)');
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async tick(): Promise<void> {
    try {
      await this.autoApproveExpiredReturns();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('ReturnScheduler tick hatası', { error: msg });
    }
  }

  /**
   * Satıcı deadline'ı geçmiş ama PENDING olan iade taleplerini AUTO_APPROVED yap.
   * Master Plan §3.5.1: "Süre aşımında iade otomatik onaylanır"
   */
  private async autoApproveExpiredReturns(): Promise<void> {
    const now = new Date();

    const expired = await this.returnRepo.findByStatusAndSellerDeadlineBefore(
      ReturnStatus.PENDING,
      now,
      BATCH_SIZE,
    );

    if (expired.length === 0) return;

    this.logger.log(`${expired.length} iade talebi auto-approve edilecek`);

    for (const entity of expired) {
      try {
        // approveReturn aynı vendorId kontrolünü atlar — scheduler SYSTEM actor
        const result = await this.returnService.approveReturn(entity.id, 'SYSTEM_AUTO_APPROVE');

        this.logger.log('İade auto-approve edildi', {
          returnId: entity.id,
          orderId: entity.orderId,
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
        this.logger.error('Auto-approve başarısız', {
          returnId: entity.id,
          error: msg,
        });
      }
    }
  }
}