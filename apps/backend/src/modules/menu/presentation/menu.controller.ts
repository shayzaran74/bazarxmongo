// apps/backend/src/modules/menu/presentation/menu.controller.ts

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, Public } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { BrowseRestaurantsQuery } from '../application/queries/browse-restaurants.query';
import { GetRestaurantDetailQuery } from '../application/queries/get-restaurant-detail.query';
import { GetMyPurchasesQuery } from '../application/queries/get-my-purchases.query';
import { PurchaseMenuCommand } from '../application/commands/purchase-menu.command';
import { ActivateOneFreeCommand } from '../application/commands/activate-one-free.command';
import { MenuUsageTrackerService } from '../application/services/menu-usage-tracker.service';

interface AuthenticatedUser { id: string; role: string; }

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly commandBus:    CommandBus,
    private readonly queryBus:      QueryBus,
    private readonly usageTracker:  MenuUsageTrackerService,
  ) {}

  @Public()
  @ApiOperation({ summary: 'Restoranları listele (şehir/kategori filtreli)' })
  @ApiQuery({ name: 'city',     required: false })
  @ApiQuery({ name: 'district', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search',   required: false })
  @ApiQuery({ name: 'page',     required: false, type: Number })
  @Get('restaurants')
  async browseRestaurants(
    @Query('city')     city?:     string,
    @Query('district') district?: string,
    @Query('category') category?: string,
    @Query('search')   search?:   string,
    @Query('page')     page?:     string,
    @Query('limit')    limit?:    string,
  ) {
    const data = await this.queryBus.execute(
      new BrowseRestaurantsQuery({ city, district, category, search,
        page: Number(page) || 1, limit: Number(limit) || 20 }),
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Restoran detayı ve menüleri' })
  @Get('restaurants/:id')
  async getRestaurantDetail(@Param('id') id: string) {
    const data = await this.queryBus.execute(new GetRestaurantDetailQuery(id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aktif QR\'larım' })
  @Get('my-purchases')
  async getMyPurchases(
    @CurrentUser() user: AuthenticatedUser,
    @Query('all') all?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetMyPurchasesQuery(user.id, all !== 'true'),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aylık menü kredim' })
  @Get('my-credit')
  async getMyCredit(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usageTracker.getRemainingCredit(user.id);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Menü satın al (QR + 1+1 hak)' })
  @Post('purchase/:menuId')
  async purchaseMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('menuId') menuId: string,
  ) {
    return this.commandBus.execute(new PurchaseMenuCommand(user.id, menuId, true));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '1+1 bedava hakkını aktive et' })
  @Post('activate-one-free/:purchaseId')
  async activateOneFree(
    @CurrentUser() user: AuthenticatedUser,
    @Param('purchaseId') purchaseId: string,
  ) {
    return this.commandBus.execute(new ActivateOneFreeCommand(user.id, purchaseId));
  }
}
