import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetSideAdsQuery } from '../application/queries/advertising.queries';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'Get side ads', description: 'Ekosistem (BAZARX, TICARITAKAS, BARTERBORSA) bazlı yan panel reklamlarını döner.' })
  @ApiQuery({ name: 'ecosystem', required: false, type: String, example: 'BAZARX' })
  @ApiResponse({ status: 200, description: 'Reklam listesi.' })
  @Get('side-ads')
  async getSideAds(@Query('ecosystem') ecosystem: string = 'BAZARX') {
    const ads = await this.queryBus.execute(new GetSideAdsQuery(ecosystem));
    return {
      success: true,
      data: ads.map((ad: any) => {
        const p = ad.getProps();
        return {
          id: ad.id.toString(),
          side: p.side,
          title: p.title,
          subtitle: p.subtitle,
          image: p.image,
          emoji: p.emoji,
          link: p.link,
          order: p.order,
          category: p.category
        };
      })
    };
  }
}
