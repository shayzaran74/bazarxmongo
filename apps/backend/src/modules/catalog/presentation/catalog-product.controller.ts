import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
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

@ApiTags('Listings')
@Controller('products')
export class CatalogProductController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus
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
