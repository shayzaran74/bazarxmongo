// apps/backend/src/modules/content/application/commands/create-quad-card.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateQuadCardCommand } from './create-content.commands';
import { IHomeQuadCardRepository } from '../../domain/repositories/home-quad-card.repository.interface';
import { HomeQuadCard } from '../../domain/entities/home-quad-card.entity';
import { HomeQuadCardItem } from '../../domain/entities/home-quad-card-item.entity';

@CommandHandler(CreateQuadCardCommand)
export class CreateQuadCardHandler implements ICommandHandler<CreateQuadCardCommand> {
  constructor(
    @Inject('IHomeQuadCardRepository') private readonly repository: IHomeQuadCardRepository,
  ) {}

  async execute(command: CreateQuadCardCommand) {
    const { dto } = command;
    const quadCard = HomeQuadCard.create({
      title: dto.title,
      order: dto.order,
      isActive: dto.isActive,
      platform: dto.platform,
    });

    const items = dto.items.map(itemDto => 
      HomeQuadCardItem.create({
        ...itemDto,
        quadCardId: quadCard.id.toString(),
      })
    );

    // Items are handled by repository during save (mapping to prisma include)
    // We set items on domain props
    quadCard.getProps().items = items;

    await this.repository.save(quadCard);
    return { id: quadCard.id.toString() };
  }
}
