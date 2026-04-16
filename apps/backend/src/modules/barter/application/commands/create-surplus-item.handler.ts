// apps/backend/src/modules/barter/application/commands/create-surplus-item.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSurplusItemCommand } from './create-surplus-item.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';
import { Prisma } from '@prisma/client';

@CommandHandler(CreateSurplusItemCommand)
export class CreateSurplusItemHandler implements ICommandHandler<CreateSurplusItemCommand> {
  constructor(
    @Inject('ISurplusItemRepository') private readonly repository: ISurplusItemRepository,
  ) {}

  async execute(command: CreateSurplusItemCommand) {
    const surplus = SurplusItem.create(
      command.companyId,
      command.title,
      command.category,
      new Prisma.Decimal(command.quantity),
      command.unit,
      command.city,
      command.description,
      command.unitPrice ? new Prisma.Decimal(command.unitPrice) : undefined
    );

    await this.repository.save(surplus);

    return { success: true, id: surplus.id };
  }
}
