// apps/backend/src/modules/vendor/presentation/vendor.controller.ts

import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiQuery, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { RegisterVendorCommand } from '../application/commands/register-vendor.command';
import { UpdateStockCommand } from '../application/commands/update-stock.command';
import { UpdateRestaurantSettingsCommand } from '../application/commands/update-restaurant-settings.command';
import { RegisterVendorDto } from '../application/dtos/register-vendor.dto';
import { UpdateRestaurantSettingsDto } from '../application/dtos/update-restaurant-settings.dto';
import { ListVendorsQuery } from '../application/queries/list-vendors.query';
import { GetVendorBySlugQuery } from '../application/queries/get-vendor-by-slug.query';
import { GetVendorProductsQuery } from '../application/queries/get-vendor-products.query';
import { GetVendorDashboardQuery } from '../application/queries/get-vendor-dashboard.query';
import { GetVendorProfileQuery } from '../application/queries/get-vendor-profile.query';
import { UpdateVendorProfileCommand } from '../application/commands/update-vendor-profile.command';
import { GetVendorOrdersQuery } from '../application/queries/get-vendor-orders.query';
import { GetVendorPendingOrderCountQuery } from '../application/queries/get-vendor-pending-order-count.query';
import { GetVendorTransfersQuery } from '../application/queries/get-vendor-transfers.query';
import { GetVendorInvoicesQuery } from '../application/queries/get-vendor-invoices.query';
import { GetVendorAnalyticsQuery } from '../application/queries/get-vendor-analytics.query';
import { GetVendorUsersQuery } from '../application/queries/get-vendor-users.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { VendorRegistrationService } from '../application/services/vendor-registration.service';

interface AuthenticatedUser {
  id: string;
  role: string;
}

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly vendorRegistrationService: VendorRegistrationService,
  ) {}

  // ─── Siparişler ────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı siparişlerini listele' })
  @Get('orders')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('status') status?: string,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.queryBus.execute(
      new GetVendorOrdersQuery(user.id, {
        status,
        page:  Number(page) || 1,
        limit: Number(limit) || 20,
      }),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bekleyen sipariş sayısı' })
  @Get('orders/pending-count')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingOrderCount(@CurrentUser() user: AuthenticatedUser) {
    const count = await this.queryBus.execute(new GetVendorPendingOrderCountQuery(user.id));
    return { success: true, data: count };
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı dashboard istatistikleri' })
  @Get('me/dashboard')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDashboard(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetVendorDashboardQuery(user.id));
    return { success: true, data };
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı analytics dashboard' })
  @Get('analytics/dashboard')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAnalyticsDashboard(
    @CurrentUser() user: AuthenticatedUser,
    @Query('period') period = '30d',
  ) {
    const data = await this.queryBus.execute(new GetVendorAnalyticsQuery(user.id, period));
    return { success: true, data };
  }

  // ─── Kullanıcılar ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı şirket kullanıcıları' })
  @Get('users')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorUsers(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetVendorUsersQuery(user.id));
    return { success: true, data };
  }

  // ─── Inventory stats — vendor-inventory.controller.ts ile çakışmayı önle ──

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stok istatistikleri (kısa özet)' })
  @Get('inventory/stats')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInventoryStats(@CurrentUser() user: AuthenticatedUser) {
    // Detaylı stats vendor-inventory.controller.ts'te; bu sadece redirect yönlendirmesi
    // Handler: vendor.controller.ts'ten PrismaService kaldırıldı, endpoint korunuyor
    return this.queryBus.execute(new GetVendorDashboardQuery(user.id)).then((d) => ({
      success: true,
      data: {
        totalListings:     d?.summary?.activeListingCount ?? 0,
        pendingOrderCount: d?.summary?.pendingOrderCount ?? 0,
      },
    }));
  }

  // ─── Profil / kayıt ────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı başvurusu yap' })
  @ApiBody({ type: RegisterVendorDto })
  @Post('apply')
  async apply(@CurrentUser() user: AuthenticatedUser, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Şirket + satıcı kaydını tek adımda tamamla' })
  @UseGuards(JwtAuthGuard)
  @Post('apply-atomic')
  async register(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Record<string, unknown>,
  ) {
    return this.vendorRegistrationService.registerAtomic(user.id, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı profili' })
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetVendorProfileQuery(user.id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Vendor profili güncelle (tüm alanlar)' })
  @Patch('profile/me')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateProfile(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: Record<string, unknown>,
  ) {
    const data = await this.commandBus.execute(new UpdateVendorProfileCommand(user.id, body));
    return { success: true, data };
  }

  // ─── BazarX Go — Restoran ayarları ─────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Restoran ayarlarını güncelle (çalışma saatleri, tatil modu, sipariş kabulü)' })
  @ApiBody({ type: UpdateRestaurantSettingsDto })
  @Patch('me/restaurant-settings')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateRestaurantSettings(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateRestaurantSettingsDto,
  ) {
    const data = await this.commandBus.execute(new UpdateRestaurantSettingsCommand(user.id, dto));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer listesi' })
  @Get('transfers')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransfers(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetVendorTransfersQuery(user.id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fatura listesi' })
  @Get('invoices')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInvoices(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.queryBus.execute(
      new GetVendorInvoicesQuery(user.id, {
        page:  parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20,
      }),
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Satıcı listesi' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @Get()
  async list(@Query() query: Record<string, string>) {
    const data = await this.queryBus.execute(new ListVendorsQuery(query));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün listesi' })
  @Get('products')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProducts(
    @CurrentUser() user: AuthenticatedUser,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('limit') limit = '100',
  ) {
    const data = await this.queryBus.execute(
      new GetVendorProductsQuery(user.id, {
        search,
        categoryId,
        limit: Number(limit) || 100,
      }),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün stoğunu güncelle' })
  @Patch('products/:id/stock')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() body: { change: number; reason: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const data = await this.commandBus.execute(
      new UpdateStockCommand(id, user.id, body.change, body.reason),
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Slug veya ID ile halka açık satıcı getir' })
  @ApiParam({ name: 'idOrSlug' })
  @Get('public/:idOrSlug')
  async getVendorPublic(@Param('idOrSlug') idOrSlug: string) {
    console.log('Fetching public vendor:', idOrSlug);
    const data = await this.queryBus.execute(new GetVendorBySlugQuery(idOrSlug));
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Slug ile satıcı getir (legacy)' })
  @ApiParam({ name: 'slug' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetVendorBySlugQuery(slug));
    return { success: true, data };
  }
}
