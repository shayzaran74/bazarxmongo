// apps/backend/src/modules/content/application/commands/create-home-banner.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateHomeBannerCommand } from './create-content.commands';
import { IHomeBannerRepository } from '../../domain/repositories/home-banner.repository.interface';
import { HomeBanner } from '../../domain/entities/home-banner.entity';

@CommandHandler(CreateHomeBannerCommand)
export class CreateHomeBannerHandler implements ICommandHandler<CreateHomeBannerCommand> {
  constructor(
    @Inject('IHomeBannerRepository') private readonly repository: IHomeBannerRepository,
  ) {}

  async execute(command: CreateHomeBannerCommand) {
    const { dto } = command;
    const banner = HomeBanner.create({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
    });

    await this.repository.save(banner);
    return { id: banner.id.toString() };
  }
}
