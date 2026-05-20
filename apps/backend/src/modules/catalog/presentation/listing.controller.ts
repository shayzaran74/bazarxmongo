// apps/backend/src/modules/catalog/presentation/listing.controller.ts

import { Controller, Post, Body, Get, Param, Query, UseGuards, Delete, Put } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateListingCommand }        from '../application/commands/create-listing.command';
import { DeleteListingCommand }        from '../application/commands/delete-listing.command';
import { UpdateListingCommand }        from '../application/commands/update-listing.command';
import { CreateListingDto }            from '../application/dtos/create-listing.dto';
import { GetCategoryTreeQuery }        from '../application/queries/get-category-tree/get-category-tree.query';
import { ListCatalogListingsQuery }    from '../application/queries/list-catalog-listings/list-catalog-listings.query';
import { GetListingBySlugQuery }       from '../application/queries/get-listing-by-slug/get-listing-by-slug.query';
import { CurrentUser }                 from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard, Roles, Public } from '@barterborsa/shared-security';
import { IVendor }                     from '@barterborsa/shared-persistence';

interface AuthenticatedUser { id: string; role: string }

@ApiTags('Listings')
@Controller('listings')
export class ListingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    @InjectModel('Vendor') private readonly vendorModel: Model<IVendor>,
  ) {}

  @Public()
  @Get('categories')
  async getCategories(@Query('all') all?: string) {
    const data = await this.queryBus.execute(new GetCategoryTreeQuery());
    if (all === 'true') {
      const flat: any[] = [];
      const traverse = (node: any) => {
        const { children, ...rest } = node;
        flat.push({
          ...rest,
          parentId: rest.parentId || null,
        });
        if (children && children.length > 0) {
          children.forEach(traverse);
        }
      };
      data.forEach(traverse);
      return { success: true, data: flat };
    }
    return { success: true, data };
  }

  @Public()
  @Get('marketplace')
  async publicList(
    @Query('search')         search?: string,
    @Query('limit')          limit = '50',
    @Query('page')           page = '1',
    @Query('vendorType')     vendorType?: string,
    @Query('city')           city?: string,
    @Query('categoryId')     categoryId?: string,
    @Query('isFeatured')     isFeatured?: string,
    @Query('isFlashSale')    isFlashSale?: string,
    @Query('isSpecialOffer') isSpecialOffer?: string,
  ) {
    const parseBool = (v?: string) => v === 'true' ? true : v === 'false' ? false : undefined;
    const data = await this.queryBus.execute(
      new ListCatalogListingsQuery(undefined, undefined, {
        search, page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 50,
        vendorType, scope: 'public', city, categoryId,
        isFeatured:    parseBool(isFeatured),
        isFlashSale:   parseBool(isFlashSale),
        isSpecialOffer:parseBool(isSpecialOffer),
      }),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(
    @CurrentUser()           user: AuthenticatedUser,
    @Query('search')         search?: string,
    @Query('limit')          limit = '50',
    @Query('page')           page = '1',
    @Query('vendorType')     vendorType?: string,
    @Query('scope')          scope?: string,
    @Query('city')           city?: string,
    @Query('categoryId')     categoryId?: string,
    @Query('isFeatured')     isFeatured?: string,
    @Query('isFlashSale')    isFlashSale?: string,
    @Query('isSpecialOffer') isSpecialOffer?: string,
    @Query('isActive')       isActive?: string,
  ) {
    const parseBool = (v?: string) => v === 'true' ? true : v === 'false' ? false : undefined;
    const data = await this.queryBus.execute(
      new ListCatalogListingsQuery(user?.id, user?.role, {
        search, page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 50,
        vendorType, scope, city, categoryId,
        isFeatured:    parseBool(isFeatured),
        isFlashSale:   parseBool(isFlashSale),
        isSpecialOffer:parseBool(isSpecialOffer),
        isActive:      parseBool(isActive),
      }),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @Post()
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateListingDto) {
    let vendorId = user.id;
    if (user.role === 'VENDOR') {
      const vendor = await this.vendorModel.findOne({ userId: user.id }, { id: 1 }).lean();
      if (!vendor) throw new Error('Satıcı profili bulunamadı. Lütfen önce satıcı başvurusu yapın.');
      vendorId = vendor.id;
    }
    return this.commandBus.execute(new CreateListingCommand(vendorId, dto));
  }

  @ApiBearerAuth()
  @Put(':id')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() dto: Record<string, unknown>) {
    const result = await this.commandBus.execute(new UpdateListingCommand(user.id, user.role, id, dto));
    return { success: true, data: result };
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async delete(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const result = await this.commandBus.execute(new DeleteListingCommand(user.id, user.role, id));
    return { success: true, data: result };
  }

  @Public()
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetListingBySlugQuery(slug));
    return { success: !!data, data };
  }
}
