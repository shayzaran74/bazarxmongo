import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetSideAdsQuery } from '../application/queries/get-side-ads.query';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'Get global settings', description: 'Ekosistem ayarlarını döner.' })
  @Get()
  async getSettings(@Query('ecosystem') ecosystem: string = 'BAZARX') {
    return {
      success: true,
      data: {
        siteName: ecosystem === 'BAZARX' ? 'BazarX' : 'BarterBorsa',
        logo: '/logo.png',
        primaryColor: '#0061ff',
        ecosystem
      }
    };
  }

  @Public()
  @ApiOperation({ summary: 'Detect user location', description: 'IP üzerinden ülke ve dil tespiti yapar.' })
  @Get('detect-location')
  async detectLocation() {
    return {
      success: true,
      data: {
        countryCode: 'TR',
        countryName: 'Turkey',
        language: 'tr',
        currency: 'TRY'
      }
    };
  }

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
