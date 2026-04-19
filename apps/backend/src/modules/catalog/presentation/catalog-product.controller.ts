import { Controller, Get, Post, Body, Query, UseGuards, Param } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiQuery, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CreateCatalogProductDto } from '../application/dtos/create-catalog-product.dto';
import { CreateCatalogProductCommand } from '../application/commands/create-catalog-product.command';
import { GetListingsQuery } from '../application/queries/get-listings/get-listings.query';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Listings')
@Controller('products')
export class CatalogProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService
  ) {}

  @Public()
  @ApiOperation({ summary: 'Homepage bulk products', description: 'Ana sayfa için kategorize edilmiş vitrin ürünlerini döner.' })
  @Get('homepage-bulk')
  async getHomepageBulk() {
    const result = await this.queryBus.execute(new GetListingsQuery({ page: 1, limit: 8 }));
    
    return {
      success: true,
      data: {
        featured: result.items,
        newArrivals: result.items,
        bestSellers: result.items
      }
    };
  }

  @Public()
  @ApiOperation({ summary: 'List catalog products', description: 'Sistemdeki ana ürün kataloğunu listeler. Sayfalama ve arama destekler.' })
  @ApiQuery({ name: 'search', required: false, description: 'Ürün adı veya açıklama ile arama' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Ürün listesi.' })
  @Get()
  async getProducts(@Query() query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      status: 'ACTIVE' // Sadece aktif ürünler
    };

    if (query.q || query.search) {
      whereClause.name = { contains: query.q || query.search, mode: 'insensitive' };
    }
    if (query.categoryId) {
      whereClause.categoryId = String(query.categoryId);
    }
    if (query.isFeatured === 'true') whereClause.isFeatured = true;
    if (query.isSpecialOffer === 'true') whereClause.isSpecialOffer = true;
    if (query.isFlashSale === 'true') whereClause.isFlashSale = true;

    const [rawItems, total] = await Promise.all([
      this.prisma.catalogProduct.findMany({
        where: whereClause,
        include: { category: true, media: { orderBy: { sortOrder: 'asc' } }, listings: true, brands: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.catalogProduct.count({ where: whereClause })
    ]);

    const items = rawItems.map(item => {
      const listing = item.listings && item.listings.length > 0 ? item.listings[0] : null;
      return {
        ...item,
        Brand: item.brands && item.brands.length > 0 ? item.brands[0] : null,
        image: item.media && item.media.length > 0 ? item.media[0].url : null,
        images: item.media ? item.media.map(m => m.url) : [],
        price: listing ? Number(listing.price) : 0,
        stock: listing ? listing.stock : 0,
        sku: listing ? listing.sku : ''
      };
    });

    return {
      success: true,
      data: items,
      meta: {
        total,
        page,
        limit
      }
    };
  }

  @Public()
  @ApiOperation({ summary: 'Get product by slug or id' })
  @Get('slug/:slug')
  async getProductBySlug(@Param('slug') slug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);

    const rawProduct = await this.prisma.catalogProduct.findUnique({
      where: isUuid ? { id: slug } : { slug },
      include: { 
        category: true, 
        media: { orderBy: { sortOrder: 'asc' } }, 
        listings: { include: { vendor: true } }, 
        brands: true,
        catalogModel: true,
        productType: true
      }
    });

    if (!rawProduct) {
      return { success: false, error: 'Ürün bulunamadı', data: null };
    }

    const listing = rawProduct.listings && rawProduct.listings.length > 0 ? rawProduct.listings[0] : null;
    
    const mappedProduct = {
      ...rawProduct,
      Brand: rawProduct.brands && rawProduct.brands.length > 0 ? rawProduct.brands[0] : null,
      Vendor: listing ? listing.vendor : null,
      price: listing ? Number(listing.price) : 0,
      stock: listing ? listing.stock : 0,
      sku: listing ? listing.sku : '',
      image: rawProduct.media && rawProduct.media.length > 0 ? rawProduct.media[0].url : null,
      images: rawProduct.media ? rawProduct.media.map(m => m.url) : [],
    };

    return {
      success: true,
      data: mappedProduct
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create catalog product (Admin/Vendor)', description: 'Kataloğa yeni bir master ürün ekler. GTIN ve Marka bilgisi gereklidir.' })
  @ApiBody({ type: CreateCatalogProductDto })
  @ApiResponse({ status: 201, description: 'Ürün kataloğa eklendi.' })
  @ApiResponse({ status: 403, description: 'Sadece yetkili kullanıcılar ürün ekleyebilir.' })
  @Post()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() dto: CreateCatalogProductDto) {
    return this.commandBus.execute(new CreateCatalogProductCommand(dto));
  }
}
