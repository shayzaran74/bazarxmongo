import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiParam 
} from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetAdsForSlotQuery } from '../application/queries/get-ads-for-slot.query';
import { AdSlotType } from '../domain/enums/advertising.enums';

@ApiTags('Ad Campaigns')
@Controller('ads')
export class AdCampaignController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'Get ads for a specific slot', description: 'Belirli bir reklam alanı (örn: HOME_HERO, SIDEBAR) için aktif reklamları döner.' })
  @ApiParam({ name: 'slotType', enum: AdSlotType, description: 'Reklam alanı tipi' })
  @ApiQuery({ name: 'platform', required: false, type: String, example: 'BAZARX' })
  @ApiQuery({ name: 'keywords', required: false, type: String, description: 'İlişkili anahtar kelimeler (virgülle ayrılmış)' })
  @ApiResponse({ status: 200, description: 'Aktif reklam listesi.' })
  @Get('slot/:slotType')
  async getAdsBySlot(
    @Param('slotType') slotType: AdSlotType,
    @Query('platform') platform: string = 'BAZARX',
    @Query('keywords') keywords?: string
  ) {
    const context = { keywords: keywords ? keywords.split(',') : [] };
    return this.queryBus.execute(new GetAdsForSlotQuery(slotType, platform, context));
  }
}
