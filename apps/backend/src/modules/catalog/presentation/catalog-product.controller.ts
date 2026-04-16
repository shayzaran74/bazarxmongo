import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

@ApiTags('Listings')
@Controller('products')
export class CatalogProductController {
  @Public()
  @ApiOperation({ summary: 'List catalog products', description: 'Sistemdeki ana ürün kataloğunu listeler. Sayfalama ve arama destekler.' })
  @ApiQuery({ name: 'search', required: false, description: 'Ürün adı veya açıklama ile arama' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Ürün listesi.' })
  @Get()
  async getProducts(@Query() query: any) {
    // Featured selection için boş veri veya dummy dönüyoruz
    return {
      success: true,
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10
      }
    };
  }
}
