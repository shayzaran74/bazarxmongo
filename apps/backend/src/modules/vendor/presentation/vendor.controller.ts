import { Controller, Post, Body, Get, Param, Query, UseGuards } from '@nestjs/common';
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
import { RegisterVendorDto } from '../application/dtos/register-vendor.dto';
import { ListVendorsQuery } from '../application/queries/list-vendors.query';
import { GetVendorBySlugQuery } from '../application/queries/get-vendor-by-slug.query';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Public, JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get vendor orders', description: 'Satıcının kendi siparişlerini listeler.' })
  @Get('orders')
  @Roles('VENDOR', 'ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getVendorOrders(@CurrentUser() user: any, @Query() query: any) {
    // TODO: vendor scope'unda order query implementasyon
    return { success: true, data: [], total: 0 }
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply for vendor status', description: 'Kullanıcıyı sistemde satıcı (vendor) olarak kaydeder.' })
  @ApiBody({ type: RegisterVendorDto })
  @ApiResponse({ status: 201, description: 'Satıcı başvurusu başarıyla oluşturuldu.' })
  @Post('apply')
  async apply(@CurrentUser() user: any, @Body() dto: RegisterVendorDto) {
    return this.commandBus.execute(new RegisterVendorCommand(user.id, dto));
  }

  @Public()
  @ApiOperation({ summary: 'List vendors', description: 'Sistemdeki satıcıları listeler. Sayfalama ve filtreleme destekler.' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Satıcı listesi.' })
  @Get()
  async list(@Query() query: any) {
    return this.queryBus.execute(new ListVendorsQuery(query));
  }

  @Public()
  @ApiOperation({ summary: 'Get vendor by slug', description: 'URL slug bilgisi verilen satıcının detaylarını ve mağaza bilgilerini döner.' })
  @ApiParam({ name: 'slug', description: 'Vendor slug (örn: awesome-store)' })
  @ApiResponse({ status: 200, description: 'Satıcı detayları.' })
  @ApiResponse({ status: 404, description: 'Satıcı bulunamadı.' })
  @Get(':slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.queryBus.execute(new GetVendorBySlugQuery(slug));
  }
}
