// apps/backend/src/modules/content/presentation/home-banner.controller.ts

import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Public } from '@barterborsa/shared-security';
import { GetHomeBannersQuery } from '../application/queries/content.queries';

@Controller('banners')
export class HomeBannerController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get()
  async getBanners(@Query('platform') platform: string = 'BAZARX') {
    return this.queryBus.execute(new GetHomeBannersQuery(platform));
  }
}
