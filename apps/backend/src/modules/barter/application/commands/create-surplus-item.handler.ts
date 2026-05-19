// apps/backend/src/modules/barter/application/commands/create-surplus-item.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateSurplusItemCommand } from './create-surplus-item.command';
import { ISurplusItemRepository } from '../../domain/repositories/surplus-item.repository.interface';
import { SurplusItem } from '../../domain/entities/surplus-item.entity';
import { SurplusStatus } from '../../domain/enums/surplus-status.enum';

@CommandHandler(CreateSurplusItemCommand)
export class CreateSurplusItemHandler implements ICommandHandler<CreateSurplusItemCommand> {
  constructor(
    @Inject('ISurplusItemRepository') private readonly repository: ISurplusItemRepository,
  ) {}

  async execute(command: CreateSurplusItemCommand): Promise<{ success: boolean; id: string }> {
    const now = new Date();
    const id = 'surplus-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const props = {
      companyId:         command.companyId,
      title:             command.title,
      description:       command.description,
      category:          command.category,
      materialType:      command.materialType,
      quantity:          command.quantity as any, // Decimal → number için cast
      blockedQuantity:   0 as any,
      unit:              command.unit,
      minTradeQuantity:  undefined,
      unitPrice:         command.unitPrice as any,
      wantedCategories:  command.wantedCategories,
      tradeModes:       command.tradeModes,
      technicalSpecs:    command.technicalSpecs,
      images:            command.images,
      location:          command.location,
      city:              command.city,
      status: SurplusStatus.PENDING_APPROVAL,
      rejectionReason:   undefined,
      approvedBy:        undefined,
      reactivationCount: 0,
      lastReactivatedAt: undefined,
      createdAt:         now,
      updatedAt:         now,
    };
    const surplus = SurplusItem.createFrom(props, id);

    await this.repository.save(surplus);

    return { success: true, id: surplus.id };
  }
}