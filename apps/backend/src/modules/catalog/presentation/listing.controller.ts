import { Controller, Post, Body, Get, Param, Query, UseGuards, Delete, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse,
  ApiBearerAuth, ApiParam, ApiQuery, ApiBody
} from '@nestjs/swagger';
import { CreateListingCommand } from '../application/commands/create-listing.command';
import { DeleteListingCommand } from '../application/commands/delete-listing.command';
import { UpdateListingCommand } from '../application/commands/update-listing.command';
import { CreateListingDto } from '../application/dtos/create-listing.dto';
import { GetCategoryTreeQuery } from '../application/queries/get-category-tree/get-category-tree.query';
import { ListCatalogListingsQuery } from '../application/queries/list-catalog-listings/list-catalog-listings.query';
import { GetListingBySlugQuery } from '../application/queries/get-listing-by-slug/get-listing-by-slug.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Get all categories' })
  @ApiQuery({ name: 'all', required: false, type: Boolean })
  @ApiQuery({ name: 'includeChildren', required: false, type: Boolean })
  @Get('categories')
  async getCategories() {
    // GetCategoryTreeQuery zaten tam ağaç döndürüyor
    const data = await this.queryBus.execute(new GetCategoryTreeQuery());
    return { success: true, data };
  }

  // ─── Genel Marketplace (Anonim erişim) ────────────────────────────────────
  @Public()
  @ApiOperation({ summary: 'Public marketplace listings' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'vendorType', required: false, type: String })
  @Get('marketplace')
  async publicList(
    @Query('search') search?: string,
    @Query('limit') limit: string = '50',
    @Query('page') page: string = '1',
    @Query('vendorType') vendorType?: string,
  ) {
    const data = await this.queryBus.execute(
      new ListCatalogListingsQuery( undefined, undefined, {
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
        vendorType,
        scope: 'public'
      })
    );
    return { success: true, data };
  }

  // ─── Yetkili Listeleme (Vendor/Admin — JWT zorunlu) ──────────────────────
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List products/listings (authenticated)' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'vendorType', required: false, type: String })
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(
    @CurrentUser() user: any,
    @Query('search') search?: string,
    @Query('limit') limit: string = '50',
    @Query('page') page: string = '1',
    @Query('vendorType') vendorType?: string,
    @Query('scope') scope?: string
  ) {
    const data = await this.queryBus.execute(
      new ListCatalogListingsQuery(user?.id, user?.role, {
        search,
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 50,
        vendorType,
        scope
      })
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new product listing' })
  @ApiBody({ type: CreateListingDto })
  @ApiResponse({ status: 201 })
  @Post()
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: any, @Body() dto: CreateListingDto) {
    // VENDOR rolündeki kullanıcılar için vendorId'yi bulalım
    let vendorId = user.id;
    
    if (user.role === 'VENDOR') {
      const vendor = await this.prisma.vendor.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });
      
      if (!vendor) {
        throw new Error('Satıcı profili bulunamadı. Lütfen önce satıcı başvurusu yapın.');
      }
      
      vendorId = vendor.id;
    }

    return this.commandBus.execute(
      new CreateListingCommand(vendorId, dto)
    );
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a listing' })
  @ApiParam({ name: 'id' })
  @Put(':id')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: any) {
    const result = await this.commandBus.execute(
      new UpdateListingCommand(user.id, user.role, id, dto)
    );
    return { success: true, data: result };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a listing' })
  @ApiParam({ name: 'id' })
  @Delete(':id')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    // Burada yetki kontrolü handler içinde yapılacak
    const result = await this.commandBus.execute(
      new DeleteListingCommand(user.id, user.role, id)
    );
    return { success: true, data: result };
  }

  @Public()
  @ApiOperation({ summary: 'Get listing by slug' })
  @ApiParam({ name: 'slug' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404 })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetListingBySlugQuery(slug));
    return { success: !!data, data };
  }
}
