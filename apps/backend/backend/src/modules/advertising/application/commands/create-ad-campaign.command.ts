import { Command } from '@barterborsa/shared-core';
import { CreateAdCampaignDto } from '../dtos/create-ad-campaign.dto';

export class CreateAdCampaignCommand extends Command {
  constructor(public readonly vendorId: string, public readonly dto: CreateAdCampaignDto) { super(); }
}
