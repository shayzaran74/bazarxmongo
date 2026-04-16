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
import * as qry from '../application/queries/content.queries';

@ApiTags('Help Center')
@Controller('help')
export class HelpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Public()
  @ApiOperation({ summary: 'List help categories', description: 'Yardım merkezi kategorilerini (SSS, Ödeme, Teslimat vb.) listeler.' })
  @ApiQuery({ name: 'platform', required: false, type: String, example: 'BAZARX' })
  @ApiQuery({ name: 'lang', required: false, type: String, example: 'tr' })
  @ApiResponse({ status: 200, description: 'Kategori listesi.' })
  @Get('categories')
  async getCategories(
    @Query('platform') platform: string = 'BAZARX',
    @Query('lang') lang: string = 'tr'
  ) {
    return this.queryBus.execute(new qry.GetHelpCategoriesQuery(platform, lang));
  }

  @Public()
  @ApiOperation({ summary: 'Get help article by slug', description: 'URL slug bilgisi verilen yardım makalesinin içeriğini döner.' })
  @ApiParam({ name: 'slug', description: 'Makale slug (örn: nasil-siparis-verilir)' })
  @ApiResponse({ status: 200, description: 'Makale detayları.' })
  @ApiResponse({ status: 404, description: 'Makale bulunamadı.' })
  @Get('articles/:slug')
  async getArticle(@Param('slug') slug: string) {
    return this.queryBus.execute(new qry.GetHelpArticleQuery(slug));
  }

  @Public()
  @ApiOperation({ summary: 'Search help articles', description: 'Yardım merkezi makaleleri içinde metin bazlı arama yapar.' })
  @ApiQuery({ name: 'q', required: true, type: String, description: 'Arama terimi' })
  @ApiQuery({ name: 'platform', required: false, type: String })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Arama sonuçları.' })
  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('platform') platform: string = 'BAZARX',
    @Query('lang') lang: string = 'tr'
  ) {
    return this.queryBus.execute(new qry.SearchHelpArticlesQuery(q, platform, lang));
  }
}
