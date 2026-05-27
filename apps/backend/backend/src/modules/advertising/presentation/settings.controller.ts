import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetSideAdsQuery } from '../application/queries/get-side-ads.query';
import { SystemSetting } from '@barterborsa/shared-persistence/schemas/backend/systemSetting.schema';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'Get global settings', description: 'Ekosistem ayarlarını döner.' })
  @Get()
  async getSettings(@Query('ecosystem') ecosystem: string = 'BAZARX') {
    const key = `homepageSettings_${ecosystem.toUpperCase()}`;
    const row = await SystemSetting.findOne({ key }).exec();
    const saved = (row?.value ?? {}) as Record<string, unknown>;

    return {
      success: true,
      data: {
        siteName: (saved.siteName as string) || (ecosystem === 'BAZARX' ? 'BazarX' : 'BarterBorsa'),
        siteLogo: saved.siteLogo as string,
        ...saved,
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
    const ads = await this.queryBus.execute(new GetSideAdsQuery(ecosystem)) as { id: { toString(): string }; getProps(): Record<string, unknown> }[];
    return {
      success: true,
      data: ads.map(ad => {
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
