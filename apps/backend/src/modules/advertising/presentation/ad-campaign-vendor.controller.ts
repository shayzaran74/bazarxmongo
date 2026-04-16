// apps/backend/src/modules/advertising/presentation/ad-campaign-vendor.controller.ts

import { Controller, Get, Post, Body } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetVendorCampaignsQuery } from '../application/queries/advertising.queries';
import { CreateAdCampaignCommand } from '../application/commands/advertising.commands';

@Controller('vendors/me/campaigns')
export class AdCampaignVendorController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get()
  async getMyCampaigns(@CurrentUser() user: any) {
    // Note: Assuming vendorId is same as user.id or reachable via user context
    return this.queryBus.execute(new GetVendorCampaignsQuery(user.id));
  }

  @Post()
  async createCampaign(@CurrentUser() user: any, @Body() dto: any) {
    return this.commandBus.execute(new CreateAdCampaignCommand(user.id, dto));
  }
}
