// apps/backend/src/modules/catalog/presentation/catalog-product.controller.ts
import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CreateCatalogProductDto } from '../application/dtos/create-catalog-product.dto';
import { CreateCatalogProductCommand } from '../application/commands/create-catalog-product.command';
import { GetCatalogProductsQuery } from '../application/queries/get-catalog-products/get-catalog-products.query';
import { GetCatalogProductBySlugQuery } from '../application/queries/get-catalog-product-by-slug/get-catalog-product-by-slug.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Listings')
@Controller('products')
export class CatalogProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Homepage bulk products' })
  @Get('homepage-bulk')
  async getHomepageBulk() {
    const result = await this.queryBus.execute(
      new GetCatalogProductsQuery({ page: 1, limit: 8 })
    );

    const bestSellersByCategory: Record<string, any[]> = {};
    
    // Fetch all categories to map children to their root parent
    const categories = await this.prisma.category.findMany({
      select: { id: true, parentId: true }
    });

    const getRootId = (catId: string): string => {
      let current = categories.find((c: any) => c.id === catId);
      while (current && current.parentId) {
        const parent = categories.find((c: any) => c.id === current!.parentId);
        if (!parent) break;
        current = parent;
      }
      return current?.id || catId;
    };

    result.items.forEach((item: any) => {
      if (item.categoryId) {
        const rootId = getRootId(item.categoryId);
        if (!bestSellersByCategory[rootId]) {
          bestSellersByCategory[rootId] = [];
        }
        bestSellersByCategory[rootId].push(item);
      }
    });

    return {
      success: true,
      data: {
        featured: result.items,
        newArrivals: result.items,
        bestSellers: result.items,
        bestSellersByCategory,
      },
    };
  }

  @Public()
  @ApiOperation({ summary: 'List catalog products' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isSpecialOffer', required: false, type: Boolean })
  @ApiQuery({ name: 'isFlashSale', required: false, type: Boolean })
  @ApiResponse({ status: 200 })
  @Get()
  async getProducts(@Query() query: any) {
    const result = await this.queryBus.execute(
      new GetCatalogProductsQuery({
        search: query.q || query.search,
        categoryId: query.categoryId || query.categorySlug || query.category,
        brandId: query.brandId || query.brand,
        minPrice: query.minPrice !== undefined ? Number(query.minPrice) : undefined,
        maxPrice: query.maxPrice !== undefined ? Number(query.maxPrice) : undefined,
        isFeatured: query.isFeatured === 'true',
        isSpecialOffer: query.isSpecialOffer === 'true',
        isFlashSale: query.isFlashSale === 'true',
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
      })
    );
    return {
      success: true,
      data: result.items,
      meta: result.meta,
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get product by slug or id' })
  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(
      new GetCatalogProductBySlugQuery(slug)
    );
    if (!data) return { success: false, error: 'Ürün bulunamadı', data: null };
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create catalog product (Admin)' })
  @ApiBody({ type: CreateCatalogProductDto })
  @ApiResponse({ status: 201 })
  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateCatalogProductDto) {
    return this.commandBus.execute(new CreateCatalogProductCommand(dto));
  }
}
