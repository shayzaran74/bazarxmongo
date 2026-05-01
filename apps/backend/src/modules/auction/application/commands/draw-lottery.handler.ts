// apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject, Logger } from '@nestjs/common';
import { DrawLotteryCommand } from './draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { DomainException } from '@barterborsa/shared-core';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../../audit/application/audit-log.service';

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

    // Kazanan numarayı çek
    const winningNumber = lottery.draw();

    // Çekilen numaraya sahip bileti bul → kazananı ata
    const winnerTicket = await this.prisma.lotteryTicket.findFirst({
      where: { lotteryId: command.lotteryId, numbers: { has: winningNumber } },
    });

    if (winnerTicket) {
      lottery.setWinner(winnerTicket.userId);
      this.logger.log('Çekiliş kazananı bulundu', {
        lotteryId: command.lotteryId,
        winnerId: winnerTicket.userId,
        winningNumber,
      });
    } else {
      // Bu numarayla bilet yoksa çekiliş sona erer ama kazanan atanmaz
      this.logger.warn('Kazanan numarayla eşleşen bilet bulunamadı', {
        lotteryId: command.lotteryId,
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
        winnerId: winnerTicket?.userId ?? null,
        status: 'DRAWN',
      },
    });

    return {
      success: true,
      winningNumber,
      winnerId: winnerTicket?.userId ?? null,
    };
  }
}
