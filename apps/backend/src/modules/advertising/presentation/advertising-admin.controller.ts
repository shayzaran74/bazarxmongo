import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiParam, 
  ApiBody 
} from '@nestjs/swagger';
import { Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import * as cmd from '../application/commands/advertising.commands';
import { GetAdsAdminQuery } from '../application/queries/advertising.queries';

@ApiTags('Advertising Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/ads')
export class AdvertisingAdminController {
  constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'List all campaigns (Admin)', description: 'Sistemdeki tüm reklam kampanyalarını onay bekleyenler dahil listeler.' })
  @ApiResponse({ status: 200, description: 'Tüm kampanyalar listesi.' })
  @Get('campaigns')
  async getAllCampaigns() {
    return this.queryBus.execute(new GetAdsAdminQuery());
  }

  @ApiOperation({ summary: 'Approve ad campaign (Admin)', description: 'Bir reklam kampanyasını onaylar ve yayına alır.' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  @ApiResponse({ status: 200, description: 'Kampanya onaylandı.' })
  @Post('campaigns/:id/approve')
  async approve(@Param('id') id: string) {
    return this.commandBus.execute(new cmd.ApproveAdCampaignCommand(id));
  }

  @ApiOperation({ summary: 'Reject ad campaign (Admin)', description: 'Bir reklam kampanyasını reddeder.' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        reason: { type: 'string', example: 'Görsel kalitesi yetersiz.' }
      },
      required: ['reason']
    }
  })
  @ApiResponse({ status: 200, description: 'Kampanya reddedildi.' })
  @Post('campaigns/:id/reject')
  async reject(@Param('id') id: string, @Body('reason') reason: string) {
    return this.commandBus.execute(new cmd.RejectAdCampaignCommand(id, reason));
  }

  @ApiOperation({ summary: 'Record ad impression (Admin/System)', description: 'Bir reklamın kaç kez görüntülendiğini ve maliyetini kaydeder.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string' },
        cost: { type: 'number' }
      },
      required: ['campaignId', 'cost']
    }
  })
  @ApiResponse({ status: 201, description: 'Görüntüleme kaydedildi.' })
  @Post('impression')
  async recordImpression(@Body() dto: { campaignId: string, cost: number }) {
    return this.commandBus.execute(new cmd.RecordImpressionCommand(dto.campaignId, dto.cost));
  }

  @ApiOperation({ summary: 'Record ad click (Admin/System)', description: 'Bir reklama kaç kez tıklandığını ve maliyetini kaydeder.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        campaignId: { type: 'string' },
        cost: { type: 'number' }
      },
      required: ['campaignId', 'cost']
    }
  })
  @ApiResponse({ status: 201, description: 'Tıklama kaydedildi.' })
  @Post('click')
  async recordClick(@Body() dto: { campaignId: string, cost: number }) {
    return this.commandBus.execute(new cmd.RecordClickCommand(dto.campaignId, dto.cost));
  }
}
