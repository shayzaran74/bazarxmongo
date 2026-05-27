import { Command } from '@barterborsa/shared-core';
import { CreateAdCampaignDto } from '../dtos/create-ad-campaign.dto';

export class RejectAdCampaignCommand extends Command {
  constructor(public readonly campaignId: string, public readonly reason: string) { super(); }
}
