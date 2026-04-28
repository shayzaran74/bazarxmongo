// apps/backend/src/modules/advertising/application/commands/ad-lifecycle.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ApproveAdCampaignCommand } from './approve-ad-campaign.command';
import { RecordImpressionCommand } from './record-impression.command';
import { RecordClickCommand } from './record-click.command';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { BudgetManagerService } from '../services/budget-manager.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(ApproveAdCampaignCommand)
export class ApproveAdCampaignHandler implements ICommandHandler<ApproveAdCampaignCommand> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute(command: ApproveAdCampaignCommand) {
    const campaign = await this.repository.findById(command.campaignId);
    if (!campaign) throw new DomainException('Campaign not found');
    campaign.approve();
    await this.repository.save(campaign);
    return { success: true };
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
