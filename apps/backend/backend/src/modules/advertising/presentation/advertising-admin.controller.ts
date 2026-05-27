// apps/backend/src/modules/advertising/presentation/advertising-admin.controller.ts

import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { ApproveAdCampaignCommand } from '../application/commands/approve-ad-campaign.command';
import { RejectAdCampaignCommand } from '../application/commands/reject-ad-campaign.command';
import { RecordImpressionCommand } from '../application/commands/record-impression.command';
import { RecordClickCommand } from '../application/commands/record-click.command';
import { GetAdsAdminQuery } from '../application/queries/get-ads-admin.query';

@ApiTags('Advertising Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/ads')
export class AdvertisingAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all campaigns (Admin)' })
  @ApiResponse({ status: 200 })
  @Get('campaigns')
  async getAllCampaigns() {
    return this.queryBus.execute(new GetAdsAdminQuery());
  }

  @ApiOperation({ summary: 'Approve ad campaign (Admin)' })
  @ApiParam({ name: 'id' })
  @Post('campaigns/:id/approve')
  async approve(@Param('id') id: string) {
    return this.commandBus.execute(new ApproveAdCampaignCommand(id));
  }

  @ApiOperation({ summary: 'Reject ad campaign (Admin)' })
  @ApiParam({ name: 'id' })
  @ApiBody({ schema: { type: 'object', properties: { reason: { type: 'string' } }, required: ['reason'] } })
  @Post('campaigns/:id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.commandBus.execute(new RejectAdCampaignCommand(id, reason));
  }

  @ApiOperation({ summary: 'Record ad impression' })
  @Post('impression')
  async recordImpression(@Body() dto: { campaignId: string; cost: number }) {
    return this.commandBus.execute(new RecordImpressionCommand(dto.campaignId, dto.cost));
  }

  @ApiOperation({ summary: 'Record ad click' })
  @Post('click')
  async recordClick(@Body() dto: { campaignId: string; cost: number }) {
    return this.commandBus.execute(new RecordClickCommand(dto.campaignId, dto.cost));
  }
}
