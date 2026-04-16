// apps/backend/src/modules/auction/application/commands/draw-lottery.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { DrawLotteryCommand } from './draw-lottery.command';
import { ILotteryRepository } from '../../domain/repositories/lottery.repository.interface';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(DrawLotteryCommand)
export class DrawLotteryHandler implements ICommandHandler<DrawLotteryCommand> {
  constructor(
    @Inject('ILotteryRepository') private readonly repository: ILotteryRepository,
  ) {}

  async execute(command: DrawLotteryCommand) {
    const lottery = await this.repository.findById(command.lotteryId);
    if (!lottery) throw new DomainException('Lottery not found');

    const winningNumber = lottery.draw();
    await this.repository.save(lottery);

    return { success: true, winningNumber };
  }
}
