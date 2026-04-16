// apps/backend/src/modules/advertising/application/commands/create-ad-campaign.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAdCampaignCommand } from './advertising.commands';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { AdCampaign } from '../../domain/entities/ad-campaign.entity';

@CommandHandler(CreateAdCampaignCommand)
export class CreateAdCampaignHandler implements ICommandHandler<CreateAdCampaignCommand> {
  constructor(
    @Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository,
  ) {}

  async execute(command: CreateAdCampaignCommand) {
    const { vendorId, dto } = command;
    const campaign = AdCampaign.create({
      ...dto,
      vendorId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      negativeKeywords: dto.negativeKeywords || [],
      targetCategories: dto.targetCategories || [],
      targetKeywords: dto.targetKeywords || [],
      targetCities: dto.targetCities || [],
      targetDistricts: dto.targetDistricts || [],
      targetSlots: dto.targetSlots || [],
    });

    await this.repository.save(campaign);
    return { id: campaign.id.toString() };
  }
}
