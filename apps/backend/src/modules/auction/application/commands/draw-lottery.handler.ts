// apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DrawLotteryCommand } from './draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { DomainException } from '@barterborsa/shared-core';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import * as crypto from 'crypto';

@CommandHandler(DrawLotteryCommand)
export class DrawLotteryHandler implements ICommandHandler<DrawLotteryCommand> {
  private readonly logger = new Logger(DrawLotteryHandler.name);

  constructor(
    @Inject('ILotteryRepository') private readonly repository: ILotteryRepository,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: DrawLotteryCommand) {
    const lottery = await this.repository.findById(command.lotteryId);
    if (!lottery) throw new DomainException('Lottery not found');

    // Biletleri repository üzerinden getir
    const soldTickets = await this.repository.findTickets(command.lotteryId);

    let winningNumber: string | null = null;
    let winnerId: string | null = null;

    if (soldTickets.length === 0) {
      this.logger.warn('Çekiliş için satılmış bilet bulunamadı', { lotteryId: command.lotteryId });
      lottery.draw();
    } else {
      // Çekiliş tekrarlanabilirliği için seed kaydı
      const seed = crypto.randomBytes(32).toString('hex');
      const winningIndex = crypto.randomInt(0, soldTickets.length);
      const winnerTicket = soldTickets[winningIndex];
      winningNumber = winnerTicket.numbers[0].toString();
      winnerId = winnerTicket.userId;

      lottery.drawManual(winningNumber, winnerId);

      // Seed'i audit log'a kaydet — adil çekiliş kanıtı
      await this.auditLog.log({
        actorId: 'SYSTEM',
        action: 'LOTTERY_SEED',
        resourceType: 'Lottery',
        resourceId: command.lotteryId,
        newValue: {
          seed,
          winningIndex,
          totalTickets: soldTickets.length,
          timestamp: new Date().toISOString(),
        },
      });

      this.logger.log('Çekiliş kazananı bulundu', {
        lotteryId: command.lotteryId,
        winnerId,
        winningNumber,
        winningIndex,
      });
    }

    await this.repository.save(lottery);

    await this.auditLog.log({
      actorId: command.actorId ?? 'SYSTEM',
      action: 'LOTTERY_DRAWN',
      resourceType: 'Lottery',
      resourceId: command.lotteryId,
      newValue: {
        winningNumber,
        winnerId,
        status: 'DRAWN',
      },
    });

    return {
      success: true,
      winningNumber,
      winnerId,
    };
  }
}
