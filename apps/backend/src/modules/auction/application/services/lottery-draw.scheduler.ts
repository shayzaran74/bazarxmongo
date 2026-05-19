// apps/backend/src/modules/auction/application/services/lottery-draw.scheduler.ts

import { Injectable, Logger, OnModuleDestroy, OnApplicationBootstrap, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DrawLotteryCommand } from '../commands/draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';

const CHECK_INTERVAL_MS = 60_000;

@Injectable()
export class LotteryDrawScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(LotteryDrawScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(
    @Inject('ILotteryRepository') private readonly lotteryRepository: ILotteryRepository,
    private readonly commandBus: CommandBus,
  ) {}

  onApplicationBootstrap(): void {
    void this.drawExpiredLotteries();
    this.intervalHandle = setInterval(
      () => void this.drawExpiredLotteries(),
      CHECK_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async drawExpiredLotteries(): Promise<void> {
    const expired = await this.lotteryRepository.findExpiredActive();

    if (expired.length === 0) return;

    this.logger.log(`Süresi dolmuş ${expired.length} çekiliş için kura çekiliyor`);

    for (const lottery of expired) {
      try {
        await this.commandBus.execute(
          new DrawLotteryCommand(lottery.id, 'SYSTEM'),
        );
        this.logger.log('Çekiliş otomatik tamamlandı', { lotteryId: lottery.id, title: lottery.title });
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error('Otomatik çekiliş başarısız', { lotteryId: lottery.id, error: msg });
      }
    }
  }
}