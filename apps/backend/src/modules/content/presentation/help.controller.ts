// apps/backend/src/modules/content/presentation/help.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Public } from '@barterborsa/shared-security';
import * as qry from '../application/queries/content.queries';

@Controller('help')
export class HelpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @Get('categories')
  async getCategories(
    @Query('platform') platform: string = 'BAZARX',
    @Query('lang') lang: string = 'tr'
  ) {
    return this.queryBus.execute(new qry.GetHelpCategoriesQuery(platform, lang));
  }

  @Public()
  @Get('articles/:slug')
  async getArticle(@Param('slug') slug: string) {
    return this.queryBus.execute(new qry.GetHelpArticleQuery(slug));
  }

  @Public()
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('platform') platform: string = 'BAZARX',
    @Query('lang') lang: string = 'tr'
  ) {
    return this.queryBus.execute(new qry.SearchHelpArticlesQuery(q, platform, lang));
  }
}
