// apps/financial-service/src/modules/escrow/application/commands/create-escrow.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateEscrowCommand } from './create-escrow.command';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { Escrow } from '../../domain/entities/escrow.entity';

@CommandHandler(CreateEscrowCommand)
export class CreateEscrowHandler implements ICommandHandler<CreateEscrowCommand> {
  constructor(
    @Inject('IEscrowRepository')
    private readonly escrowRepository: IEscrowRepository,
  ) {}

  async execute(command: CreateEscrowCommand): Promise<void> {
    const { orderId, buyerId, sellerId, amount } = command;

    const existing = await this.escrowRepository.findByOrderId(orderId);
    if (existing) return;

    const escrow = Escrow.create({
      orderId,
      buyerId,
      sellerId,
      amount,
    });

    await this.escrowRepository.save(escrow);
  }
}
