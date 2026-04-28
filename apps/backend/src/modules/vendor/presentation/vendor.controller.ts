// apps/backend/src/modules/vendor/presentation/vendor.controller.ts

import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth,
  ApiQuery, ApiParam, ApiBody,
} from '@nestjs/swagger';
import { RegisterVendorCommand } from '../application/commands/register-vendor.command';
import { UpdateStockCommand } from '../application/commands/update-stock.command';
import { RegisterVendorDto } from '../application/dtos/register-vendor.dto';
import { ListVendorsQuery } from '../application/queries/list-vendors.query';
import { GetVendorBySlugQuery } from '../application/queries/get-vendor-by-slug.query';
import { GetVendorProductsQuery } from '../application/queries/get-vendor-products.query';
import { GetVendorDashboardQuery } from '../application/queries/get-vendor-dashboard.query';
import { GetVendorProfileQuery } from '../application/queries/get-vendor-profile.query';
import { GetVendorOrdersQuery } from '../application/queries/get-vendor-orders.query';
import { GetVendorPendingOrderCountQuery } from '../application/queries/get-vendor-pending-order-count.query';
import { GetVendorTransfersQuery } from '../application/queries/get-vendor-transfers.query';
import { GetVendorInvoicesQuery } from '../application/queries/get-vendor-invoices.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';
import { VendorRegistrationService } from '../application/services/vendor-registration.service';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
    private readonly vendorRegistrationService: VendorRegistrationService,
  ) {}

  // ─── Siparişler ────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı siparişlerini listele' })
  @Get('orders')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.queryBus.execute(
      new GetVendorOrdersQuery(user.id, {
        status: query.status,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20,
      }),
    );
    return { success: true, data: data.items, total: data.total };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bekleyen sipariş sayısı' })
  @Get('orders/pending-count')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingOrderCount(@CurrentUser() user: any) {
    const count = await this.queryBus.execute(
      new GetVendorPendingOrderCountQuery(user.id),
    );
    return { success: true, data: count };
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı dashboard istatistikleri' })
  @Get('me/dashboard')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDashboard(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(new GetVendorDashboardQuery(user.id));
    return { success: true, data };
  }

  // ─── Analytics ─────────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı analytics dashboard' })
  @Get('analytics/dashboard')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getAnalyticsDashboard(@CurrentUser() user: any, @Query('period') period = '30d') {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: true, data: null };

    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orderStats, topProducts, revenueByDay] = await Promise.all([
      this.prisma.order.aggregate({
        where: {
          vendorId:  vendor.id,
          createdAt: { gte: since },
          status:    { in: ['COMPLETED', 'DELIVERED', 'PENDING'] },
        },
        _count: { id: true },
        _sum:   { totalAmount: true },
      }),

      this.prisma.orderItem.groupBy({
        by: ['productName'],
        where: { order: { vendorId: vendor.id, createdAt: { gte: since } } },
        _sum:   { quantity: true, totalAmount: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: 5,
      }),

      this.prisma.order.groupBy({
        by: ['createdAt'],
        where: {
          vendorId:  vendor.id,
          createdAt: { gte: since },
          status:    { in: ['COMPLETED', 'DELIVERED'] },
        },
        _sum: { totalAmount: true },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return {
      success: true,
      data: {
        period,
        totalOrders:   orderStats._count.id,
        totalRevenue:  Number(orderStats._sum.totalAmount ?? 0),
        topProducts:   topProducts.map(p => ({
          name:     p.productName,
          quantity: p._sum.quantity,
          revenue:  Number(p._sum.totalAmount ?? 0),
        })),
        revenueByDay: revenueByDay.map(r => ({
          date:    r.createdAt,
          revenue: Number(r._sum.totalAmount ?? 0),
        })),
      },
    };
  }

  // ─── Kullanıcılar ──────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı şirket kullanıcıları' })
  @Get('users')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorUsers(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      include: { company: { include: { users: { include: { company: false } } } } },
    });
    if (!vendor?.company) return { success: true, data: [] };

    const userIds = vendor.company.users.map((u: any) => u.userId);
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id:      true,
        email:   true,
        role:    true,
        profile: { select: { firstName: true, lastName: true, phone: true } },
      },
    });

    const data = users.map(u => ({
      ...u,
      companyRole: vendor.company.users.find((cu: any) => cu.userId === u.id)?.role,
    }));

    return { success: true, data };
  }

  // ─── Inventory stats ──────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Stok istatistikleri' })
  @Get('inventory/stats')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInventoryStats(@CurrentUser() user: any) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: true, data: null };

    const [totalListings, lowStock, outOfStock, warehouses] = await Promise.all([
      this.prisma.listing.count({
        where: { vendorId: vendor.id, status: 'ACTIVE' },
      }),

      this.prisma.listing.count({
        where: { vendorId: vendor.id, status: 'ACTIVE', stock: { gt: 0, lte: 5 } },
      }),

      this.prisma.listing.count({
        where: { vendorId: vendor.id, stock: 0 },
      }),

      this.prisma.warehouse.findMany({
        where: { vendorId: vendor.id, isActive: true },
        include: {
          stocks: {
            select: { quantity: true, reservedQuantity: true },
          },
        },
      }),
    ]);

    const warehouseStats = warehouses.map((w: any) => ({
      id:        w.id,
      name:      w.name,
      city:      w.city,
      isDefault: w.isDefault,
      totalQty:  w.stocks.reduce((s: number, st: any) => s + st.quantity, 0),
      reservedQty: w.stocks.reduce((s: number, st: any) => s + st.reservedQuantity, 0),
    }));

    return {
      success: true,
      data: {
        totalListings,
        lowStockCount:    lowStock,
        outOfStockCount:  outOfStock,
        healthyStockCount: totalListings - lowStock - outOfStock,
        warehouses: warehouseStats,
      },
    };
  }

  // ─── Profil / kayıt ────────────────────────────────────────────────────────

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı başvurusu yap' })
  @ApiBody({ type: RegisterVendorDto })
  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Şirket + satıcı kaydını tek adımda tamamla' })
  @UseGuards(JwtAuthGuard)
  @Post('apply-atomic')
  async register(@CurrentUser() user: any, @Body() body: any) {
    return this.vendorRegistrationService.registerAtomic(user?.id, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Satıcı profili' })
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(new GetVendorProfileQuery(user.id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Transfer listesi' })
  @Get('transfers')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransfers(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(new GetVendorTransfersQuery(user.id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Fatura listesi' })
  @Get('invoices')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInvoices(
    @CurrentUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.queryBus.execute(
      new GetVendorInvoicesQuery(user.id, {
        page: parseInt(page, 10) || 1,
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
  async list(@Query() query: any) {
    const data = await this.queryBus.execute(new ListVendorsQuery(query));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ürün listesi' })
  @Get('products')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProducts(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.queryBus.execute(
      new GetVendorProductsQuery(user.id, {
        search:     query.search,
        categoryId: query.categoryId,
        limit:      query.limit ? Number(query.limit) : 100,
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
    @CurrentUser() user: any,
  ) {
    const data = await this.commandBus.execute(
      new UpdateStockCommand(id, user.id, body.change, body.reason),
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Slug ile satıcı getir' })
  @ApiParam({ name: 'slug' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetVendorBySlugQuery(slug));
    return { success: true, data };
  }
}
