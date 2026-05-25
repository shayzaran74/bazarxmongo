// apps/backend/src/modules/advertising/application/commands/ad-lifecycle.handlers.ts

import { CommandHandler, ICommandHandler, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ApproveAdCampaignCommand } from './approve-ad-campaign.command';
import { RecordImpressionCommand } from './record-impression.command';
import { RecordClickCommand } from './record-click.command';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { BudgetManagerService } from '../services/budget-manager.service';
import { ListingFlagService } from '../services/listing-flag.service';
import { DomainException } from '@barterborsa/shared-core';
import { CampaignExpiredEvent } from '../../domain/events/advertising.events';
import { AdSlotType } from '../../domain/enums/advertising.enums';

@CommandHandler(ApproveAdCampaignCommand)
export class ApproveAdCampaignHandler implements ICommandHandler<ApproveAdCampaignCommand> {
  constructor(
    @Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository,
    private readonly listingFlagService: ListingFlagService,
  ) {}
  async execute(command: ApproveAdCampaignCommand) {
    const campaign = await this.repository.findById(command.campaignId);
    if (!campaign) throw new DomainException('Campaign not found');
    campaign.approve();
    await this.repository.save(campaign);
    // Listing flag — sadece flag'li slot tipleri için uygulanır
    const props = campaign.getProps();
    if (props.targetListingId && props.targetSlotType) {
      await this.listingFlagService.applyAdFlag(
        props.targetListingId,
        props.targetSlotType as AdSlotType,
      );
    }
    return { success: true };
  }
}

@EventsHandler(CampaignExpiredEvent)
export class CampaignExpiredHandler implements IEventHandler<CampaignExpiredEvent> {
  constructor(private readonly listingFlagService: ListingFlagService) {}
  async handle(event: CampaignExpiredEvent): Promise<void> {
    if (event.targetListingId && event.targetSlotType) {
      await this.listingFlagService.clearAdFlag(
        event.targetListingId,
        event.targetSlotType as AdSlotType,
      );
    }
  }
}

@CommandHandler(RecordImpressionCommand)
export class RecordImpressionHandler implements ICommandHandler<RecordImpressionCommand> {
  constructor(private readonly budgetManager: BudgetManagerService) {}
  async execute(command: RecordImpressionCommand) {
    await this.budgetManager.deductBudget(command.campaignId, command.cost);
    return { success: true };
  }
}

@CommandHandler(RecordClickCommand)
export class RecordClickHandler implements ICommandHandler<RecordClickCommand> {
  constructor(private readonly budgetManager: BudgetManagerService) {}
  async execute(command: RecordClickCommand) {
    await this.budgetManager.deductBudget(command.campaignId, command.cost);
    return { success: true };
  }
}
