// apps/backend/src/modules/advertising/application/commands/advertising.commands.ts

import { Command } from '@barterborsa/shared-core';
import { CreateAdCampaignDto } from '../dtos/create-ad-campaign.dto';

export class CreateAdCampaignCommand extends Command {
  constructor(public readonly vendorId: string, public readonly dto: CreateAdCampaignDto) { super(); }
}

export class ApproveAdCampaignCommand extends Command {
  constructor(public readonly campaignId: string) { super(); }
}

export class RejectAdCampaignCommand extends Command {
  constructor(public readonly campaignId: string, public readonly reason: string) { super(); }
}

export class RecordImpressionCommand extends Command {
  constructor(public readonly campaignId: string, public readonly cost: number) { super(); }
}

export class RecordClickCommand extends Command {
  constructor(public readonly campaignId: string, public readonly cost: number) { super(); }
}
