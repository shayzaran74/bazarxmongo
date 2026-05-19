// apps/backend/src/modules/catalog/presentation/catalog-product.controller.ts

import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { ICategory } from '@barterborsa/shared-persistence';
import { CreateCatalogProductDto }     from '../application/dtos/create-catalog-product.dto';
import { CreateCatalogProductCommand } from '../application/commands/create-catalog-product.command';
import { GetCatalogProductsQuery }     from '../application/queries/get-catalog-products/get-catalog-products.query';
import { GetCatalogProductBySlugQuery }from '../application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.query';

@ApiTags('Listings')
@Controller('products')
export class CatalogProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    @InjectModel('Category') private readonly categoryModel: Model<ICategory>,
  ) {}

  @Public()
  @Get('homepage-bulk')
  async getHomepageBulk() {
    const result = await this.queryBus.execute(
      new GetCatalogProductsQuery({ page: 1, limit: 8, excludeVendorTypes: ['RESTAURANT'] }),
    );

    const categories = await this.categoryModel.find({}, { id: 1, parentId: 1 }).lean();

    const getRootId = (catId: string): string => {
      let current = categories.find(c => c.id === catId);
      while (current?.parentId) {
        const parent = categories.find(c => c.id === current!.parentId);
        if (!parent) break;
        current = parent;
      }
      return current?.id || catId;
    };

    const bestSellersByCategory: Record<string, unknown[]> = {};
    (result.items as Array<Record<string, unknown>>).forEach(item => {
      if (item.categoryId) {
        const rootId = getRootId(item.categoryId as string);
        if (!bestSellersByCategory[rootId]) bestSellersByCategory[rootId] = [];
        bestSellersByCategory[rootId].push(item);
      }
    });

    return {
      success: true,
      data: {
        featured: result.items, newArrivals: result.items,
        bestSellers: result.items, bestSellersByCategory,
      },
    };
  }

  @Public()
  @Get()
  async getProducts(@Query() query: Record<string, string>) {
    const result = await this.queryBus.execute(
      new GetCatalogProductsQuery({
        search:          query.q || query.search,
        categoryId:      query.categoryId || query.categorySlug || query.category,
        brandId:         query.brandId || query.brand,
        minPrice:        query.minPrice !== undefined ? Number(query.minPrice) : undefined,
        maxPrice:        query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
        isFeatured:      query.isFeatured === 'true',
        isSpecialOffer:  query.isSpecialOffer === 'true',
        isFlashSale:     query.isFlashSale === 'true',
        vendorId:        query.vendorId,
        vendorType:      query.vendorType,
        excludeVendorTypes: query.vendorType ? undefined : ['RESTAURANT'],
        page:  Number(query.page)  || 1,
        limit: Number(query.limit) || 20,
      }),
    );
    return { success: true, data: result.items, meta: result.meta };
  }

  @Public()
  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetCatalogProductBySlugQuery(slug));
    if (!data) return { success: false, error: 'Ürün bulunamadı', data: null };
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  create(@Body() dto: CreateCatalogProductDto) {
    return this.commandBus.execute(new CreateCatalogProductCommand(dto));
  }
}
