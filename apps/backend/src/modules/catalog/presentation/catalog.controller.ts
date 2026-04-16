// apps/backend/src/modules/catalog/presentation/catalog.controller.ts
import {
  Controller,
  Get,
  Param,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiQuery, ApiParam, ApiOperation } from '@nestjs/swagger';
import { Public } from '@barterborsa/shared-security';

import { GetProductDetailsQuery } from '../application/queries/get-product-details/get-product-details.query';
import { GetProductBySlugQuery } from '../application/queries/get-product-by-slug/get-product-by-slug.query';
import { GetListingsQuery } from '../application/queries/get-listings/get-listings.query';
import {
  ProductDetailsDto,
  PaginatedListingsDto,
} from '../application/dtos/catalog-response.dtos';

@ApiTags('Catalog')
@Public()
@Controller('catalog')
export class CatalogController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('products')
  @ApiOperation({ summary: 'Ürünleri listele', description: 'Kategori ve fiyat filtreleri ile sayfalı liste döner.' })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getListings(
    @Query('categoryId') categoryId?: string,
    @Query('minPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true }))
    minPrice?: number,
    @Query('maxPrice', new DefaultValuePipe(undefined), new ParseIntPipe({ optional: true }))
    maxPrice?: number,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ): Promise<PaginatedListingsDto> {
    return this.queryBus.execute(
      new GetListingsQuery({ categoryId, minPrice, maxPrice, page, limit }),
    );
  }

  @Get('products/slug/:slug')
  @ApiOperation({ summary: 'Slug ile ürün detayı', description: 'SEO uyumlu slug üzerinden ürünün tüm detaylarını (medya dahil) döner.' })
  @ApiParam({ name: 'slug', example: 'iphone-14-pro-ikinci-el' })
  getBySlug(@Param('slug') slug: string): Promise<ProductDetailsDto> {
    return this.queryBus.execute(new GetProductBySlugQuery(slug));
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'ID ile ürün detayı', description: 'UUID üzerinden ürünün tüm detaylarını (medya dahil) döner.' })
  @ApiParam({ name: 'id', example: '123e4567-e89b-12d3-a456-426614174000' })
  getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ProductDetailsDto> {
    return this.queryBus.execute(new GetProductDetailsQuery(id));
  }
}
