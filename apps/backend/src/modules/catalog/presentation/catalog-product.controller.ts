import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '@barterborsa/shared-security';

@Controller('products')
export class CatalogProductController {
  @Public()
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
