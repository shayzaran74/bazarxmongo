// apps/backend/src/modules/content/presentation/help.controller.ts

import { Controller, Get, Param, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';
import { GetHelpCategoriesQuery } from '../application/queries/get-help-categories.query';
import { GetHelpArticleQuery } from '../application/queries/get-help-article.query';
import { SearchHelpArticlesQuery } from '../application/queries/search-help-articles.query';

@ApiTags('Help Center')
@Controller('help')
export class HelpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List help categories' })
  @ApiQuery({ name: 'platform', required: false, example: 'BAZARX' })
  @ApiQuery({ name: 'lang', required: false, example: 'tr' })
  @ApiResponse({ status: 200 })
  @Get('categories')
  async getCategories(@Query('platform') platform = 'BAZARX', @Query('lang') lang = 'tr') {
    const categories = await this.queryBus.execute(new GetHelpCategoriesQuery(platform, lang));
    const data = categories.map((cat: any) => ({ id: cat.id.toString(), ...cat.getProps() }));
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'List popular help articles' })
  @Get('popular')
  async getPopular() { return { success: true, data: [] }; }

  @Public()
  @ApiOperation({ summary: 'Get help article by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200 })
  @Get('articles/:slug')
  async getArticle(@Param('slug') slug: string) {
    const article = await this.queryBus.execute(new GetHelpArticleQuery(slug));
    if (!article) return { success: false, data: null };
    return { success: true, data: { id: article.id.toString(), ...article.getProps() } };
  }

  @Public()
  @ApiOperation({ summary: 'Search help articles' })
  @ApiQuery({ name: 'q', required: true })
  @ApiQuery({ name: 'platform', required: false })
  @ApiQuery({ name: 'lang', required: false })
  @ApiResponse({ status: 200 })
  @Get('search')
  async search(@Query('q') q: string, @Query('platform') platform = 'BAZARX', @Query('lang') lang = 'tr') {
    const articles = await this.queryBus.execute(new SearchHelpArticlesQuery(q, platform, lang));
    const data = articles.map((art: any) => ({ id: art.id.toString(), ...art.getProps() }));
    return { success: true, data };
  }
}
