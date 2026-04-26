import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetHomeBannersQuery } from '../application/queries/content.queries';

@ApiTags('Home Banners')
@Controller('banners')
export class HomeBannerController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List home banners', description: 'Ana sayfada gösterilecek aktif banner listesini döner.' })
  @ApiQuery({ name: 'platform', required: false, type: String, example: 'BAZARX' })
  @ApiResponse({ status: 200, description: 'Banner listesi.' })
  @Get()
  async getBanners(
    @Query('platform') platform: string = 'BAZARX',
    @Query('tag') tag?: string
  ) {
    return this.queryBus.execute(new GetHomeBannersQuery(platform, tag));
  }
}
