import { Controller, Post, Body, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiParam, 
  ApiBody 
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
import { GetInvoiceDownloadUrlQuery } from '../application/queries/get-invoice-download-url.query';
import { GenerateInvoiceCommand } from '../../commerce/application/commands/generate-invoice.command';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { VendorRegistrationService } from '../application/services/vendor-registration.service';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly vendorRegistrationService: VendorRegistrationService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor orders', description: 'Satıcının kendi siparişlerini listeler.' })
  @Get('orders')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.queryBus.execute(
      new GetVendorOrdersQuery(user.id, {
        status: query.status,
        page: Number(query.page) || 1,
        limit: Number(query.limit) || 20
      })
    );
    return { success: true, data: data.items, total: data.total };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor pending orders count', description: 'Satıcının bekleyen sipariş sayısını döner.' })
  @Get('orders/pending-count')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getPendingOrderCount(@CurrentUser() user: any) {
    const count = await this.queryBus.execute(
      new GetVendorPendingOrderCountQuery(user.id)
    );
    return { success: true, data: count };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor dashboard stats' })
  @Get('me/dashboard')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getDashboard(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(
      new GetVendorDashboardQuery(user.id)
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for vendor status', description: 'Kullanıcıyı sistemde satıcı (vendor) olarak kaydeder.' })
  @ApiBody({ type: RegisterVendorDto })
  @ApiResponse({ status: 201, description: 'Satıcı başvurusu başarıyla oluşturuldu.' })
  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Complete vendor application', description: 'Şirket ve satıcı kaydını tek adımda yapar.' })
  @UseGuards(JwtAuthGuard)
  @Post('apply-atomic')
  async register(@CurrentUser() user: any, @Body() body: any) {
    return this.vendorRegistrationService.registerAtomic(user?.id, body);
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own vendor profile' })
  @Get('profile/me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    /**
     * @WARNING: Frontend compatibility check required.
     * Change endpoint from /vendors/profile/${userId} to /vendors/profile/me
     */
    const data = await this.queryBus.execute(new GetVendorProfileQuery(user.id));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor transfers' })
  @Get('transfers')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getTransfers(@CurrentUser() user: any) {
    const data = await this.queryBus.execute(
      new GetVendorTransfersQuery(user.id)
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor invoices' })
  @Get('invoices')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getInvoices(
    @CurrentUser() user: any,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20'
  ) {
    const data = await this.queryBus.execute(
      new GetVendorInvoicesQuery(user.id, {
        page: parseInt(page, 10) || 1,
        limit: parseInt(limit, 10) || 20
      })
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'List vendors', description: 'Sistemdeki satıcıları listeler. Sayfalama ve filtreleme destekler.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Satıcı listesi.' })
  @Get()
  async list(@Query() query: any) {
    const data = await this.queryBus.execute(new ListVendorsQuery(query));
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor products list' })
  @Get('products')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getProducts(@CurrentUser() user: any, @Query() query: any) {
    const data = await this.queryBus.execute(
      new GetVendorProductsQuery(user.id, {
        search: query.search,
        categoryId: query.categoryId,
        limit: query.limit ? Number(query.limit) : 100
      })
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update product stock' })
  @Patch('products/:id/stock')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateStock(
    @Param('id') id: string,
    @Body() body: { change: number; reason: string },
    @CurrentUser() user: any
  ) {
    const data = await this.commandBus.execute(
      new UpdateStockCommand(id, user.id, body.change, body.reason)
    );
    return { success: true, data };
  }

  @Public()
  @ApiOperation({ summary: 'Get vendor by slug', description: 'URL slug bilgisi verilen satıcının detaylarını ve mağaza bilgilerini döner.' })
  @ApiParam({ name: 'slug', description: 'Vendor slug (örn: awesome-store)' })
  @ApiResponse({ status: 200, description: 'Satıcı detayları.' })
  @ApiResponse({ status: 404, description: 'Satıcı bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    const data = await this.queryBus.execute(new GetVendorBySlugQuery(slug));
    return { success: true, data };
  }
}
