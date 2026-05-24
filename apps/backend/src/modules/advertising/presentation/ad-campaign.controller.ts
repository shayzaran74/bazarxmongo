// apps/backend/src/modules/advertising/presentation/ad-campaign.controller.ts

import { Controller, Get, Post, Body, Param, Query, Inject, BadRequestException } from '@nestjs/common';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiQuery, ApiParam,
} from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetAdsForSlotQuery } from '../application/queries/get-ads-for-slot.query';
import { RecordImpressionCommand } from '../application/commands/record-impression.command';
import { RecordClickCommand } from '../application/commands/record-click.command';
import { AdSlotType } from '../domain/enums/advertising.enums';
import { IAdCampaignRepository } from '../domain/repositories/ad-campaign.repository.interface';

@ApiTags('Ad Campaigns')
@Controller('ads')
export class AdCampaignController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    @Inject('IAdCampaignRepository') private readonly campaignRepository: IAdCampaignRepository,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Tüm aktif reklamları listele' })
  @ApiResponse({ status: 200 })
  @Get()
  async findAll() {
    const campaigns = await this.campaignRepository.findAll();
    return { success: true, data: campaigns.map(c => ({ id: c.id, ...c.getProps() })) };
  }

  @Public()
  @ApiOperation({ summary: 'Belirli bir slot için reklamları döner' })
  @ApiParam({ name: 'slotType', enum: AdSlotType })
  @ApiQuery({ name: 'platform', required: false, type: String })
  @ApiQuery({ name: 'keywords', required: false, type: String })
  @ApiResponse({ status: 200 })
  @Get('slot/:slotType')
  async getAdsBySlot(
    @Param('slotType') slotType: AdSlotType,
    @Query('platform') platform: string = 'BAZARX',
    @Query('keywords') keywords?: string,
  ) {
    const context = { keywords: keywords ? keywords.split(',') : [] };
    const result = await this.queryBus.execute(new GetAdsForSlotQuery(slotType, platform, context));
    return { success: true, data: result };
  }

  // Görüntülenme izleme (public — frontend reklamı gördüğünde çağırır)
  @Public()
  @ApiOperation({ summary: 'Reklam görüntülenme kaydı' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  @Post(':id/impression')
  async recordImpression(@Param('id') id: string) {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) throw new BadRequestException('Reklam kampanyası bulunamadı');
    const cost = campaign.getProps().pricingModel === 'CPM'
      ? (campaign.getProps().maxBidPerMille ?? campaign.getProps().bidAmount) / 1000
      : 0;
    const result = await this.commandBus.execute(new RecordImpressionCommand(id, cost));
    return { success: true, data: result };
  }

  // Tıklama izleme (public — frontend reklamı tıkladığında çağırır)
  @Public()
  @ApiOperation({ summary: 'Reklam tıklanma kaydı' })
  @ApiParam({ name: 'id', description: 'Kampanya ID' })
  @Post(':id/click')
  async recordClick(@Param('id') id: string) {
    const campaign = await this.campaignRepository.findById(id);
    if (!campaign) throw new BadRequestException('Reklam kampanyası bulunamadı');
    const cost = campaign.getProps().pricingModel === 'CPC'
      ? (campaign.getProps().maxBidPerClick ?? campaign.getProps().bidAmount)
      : 0;
    const result = await this.commandBus.execute(new RecordClickCommand(id, cost));
    return { success: true, data: result };
  }
}
