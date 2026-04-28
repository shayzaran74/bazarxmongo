import { Command } from '@barterborsa/shared-core';
import { CreateAdCampaignDto } from '../dtos/create-ad-campaign.dto';

export class ApproveAdCampaignCommand extends Command {
  constructor(public readonly campaignId: string) { super(); }
}
