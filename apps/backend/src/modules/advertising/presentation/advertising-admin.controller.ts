// apps/backend/src/modules/advertising/presentation/advertising-admin.controller.ts

import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Roles } from '@barterborsa/shared-nest';
import * as cmd from '../application/commands/advertising.commands';
import { GetAdsAdminQuery } from '../application/queries/advertising.queries';

@Controller('admin/ads')
@Roles('ADMIN')
export class AdvertisingAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @Get('campaigns')
  async getAllCampaigns() {
    return this.queryBus.execute(new GetAdsAdminQuery());
  }

  @Post('campaigns/:id/approve')
  async approve(@Param('id') id: string) {
    return this.commandBus.execute(new cmd.ApproveAdCampaignCommand(id));
  }

  @Post('campaigns/:id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.commandBus.execute(new cmd.RejectAdCampaignCommand(id, reason));
  }

  @Post('impression')
  async recordImpression(@Body() dto: { campaignId: string, cost: number }) {
    return this.commandBus.execute(new cmd.RecordImpressionCommand(dto.campaignId, dto.cost));
  }

  @Post('click')
  async recordClick(@Body() dto: { campaignId: string, cost: number }) {
    return this.commandBus.execute(new cmd.RecordClickCommand(dto.campaignId, dto.cost));
  }
}
