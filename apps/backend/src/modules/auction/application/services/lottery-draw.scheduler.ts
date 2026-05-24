// apps/backend/src/modules/auction/application/services/lottery-draw.scheduler.ts

import { Injectable, Logger, Inject, OnModuleDestroy } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CommandBus } from '@nestjs/cqrs';
import { DrawLotteryCommand } from '../commands/draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { RedisService } from '@barterborsa/shared-security';

const LOCK_KEY = 'scheduler:lottery-draw:lock';
const LOCK_TTL_SECONDS = 55;

@Injectable()
export class LotteryDrawScheduler implements OnModuleDestroy {
  private readonly logger = new Logger(LotteryDrawScheduler.name);

  constructor(
    @Inject('ILotteryRepository') private readonly lotteryRepository: ILotteryRepository,
    private readonly commandBus: CommandBus,
    private readonly redisService: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE, { name: 'lotteryDraw', timeZone: 'Europe/Istanbul' })
  async drawExpiredLotteriesWithLock(): Promise<void> {
    const locked = await this.redisService.get(LOCK_KEY);
    if (locked === '1') {
      this.logger.debug('Kilit meşgul — diğer instance çalışıyor, atlanıyor');
      return;
    }
    await this.redisService.set(LOCK_KEY, '1', LOCK_TTL_SECONDS);

    try {
      await this.runDrawExpiredLotteries();
    } finally {
      await this.redisService.del(LOCK_KEY);
    }
  }

  onModuleDestroy(): void {}

  private async runDrawExpiredLotteries(): Promise<void> {
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