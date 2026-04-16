// apps/backend/src/modules/advertising/application/commands/ad-lifecycle.handlers.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import * as cmd from './advertising.commands';
import { IAdCampaignRepository } from '../../domain/repositories/ad-campaign.repository.interface';
import { BudgetManagerService } from '../services/budget-manager.service';
import { DomainException } from '@barterborsa/shared-core';

@CommandHandler(cmd.ApproveAdCampaignCommand)
export class ApproveAdCampaignHandler implements ICommandHandler<cmd.ApproveAdCampaignCommand> {
  constructor(@Inject('IAdCampaignRepository') private readonly repository: IAdCampaignRepository) {}
  async execute(command: cmd.ApproveAdCampaignCommand) {
    const campaign = await this.repository.findById(command.campaignId);
    if (!campaign) throw new DomainException('Campaign not found');
    campaign.approve();
    await this.repository.save(campaign);
    return { success: true };
  }
}

@CommandHandler(cmd.RecordImpressionCommand)
export class RecordImpressionHandler implements ICommandHandler<cmd.RecordImpressionCommand> {
  constructor(private readonly budgetManager: BudgetManagerService) {}
  async execute(command: cmd.RecordImpressionCommand) {
    await this.budgetManager.deductBudget(command.campaignId, command.cost);
    return { success: true };
  }
}

@CommandHandler(cmd.RecordClickCommand)
export class RecordClickHandler implements ICommandHandler<cmd.RecordClickCommand> {
  constructor(private readonly budgetManager: BudgetManagerService) {}
  async execute(command: cmd.RecordClickCommand) {
    await this.budgetManager.deductBudget(command.campaignId, command.cost);
    return { success: true };
  }
}
