// apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DrawLotteryCommand } from './draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';
import * as crypto from 'crypto';

@CommandHandler(DrawLotteryCommand)
export class DrawLotteryHandler implements ICommandHandler<DrawLotteryCommand> {
  private readonly logger = new Logger(DrawLotteryHandler.name);

  constructor(
    @Inject('ILotteryRepository') private readonly repository: ILotteryRepository,
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(command: DrawLotteryCommand) {
    const lottery = await this.repository.findById(command.lotteryId);
    if (!lottery) throw new DomainException('Lottery not found');

    // Satılan biletleri getir
    const soldTickets = await this.prisma.lotteryTicket.findMany({
      where: { lotteryId: command.lotteryId },
    });

    let winningNumber: string | null = null;
    let winnerId: string | null = null;

    if (soldTickets.length === 0) {
      this.logger.warn('Çekiliş için satılmış bilet bulunamadı', { lotteryId: command.lotteryId });
      lottery.draw();
    } else {
      const winningIndex = crypto.randomInt(0, soldTickets.length);
      const winnerTicket = soldTickets[winningIndex];
      winningNumber = winnerTicket.numbers[0].toString();
      winnerId = winnerTicket.userId;

      lottery.drawManual(winningNumber, winnerId);
      
      this.logger.log('Çekiliş kazananı bulundu', {
        lotteryId: command.lotteryId,
        winnerId,
        winningNumber,
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
