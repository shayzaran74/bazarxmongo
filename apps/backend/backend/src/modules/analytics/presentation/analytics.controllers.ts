import { Controller, Post, Body, Get, Query, UseGuards, ForbiddenException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery, 
  ApiBody 
} from '@nestjs/swagger';
import { Roles, CurrentUser } from '@barterborsa/shared-nest';
import { Public } from '@barterborsa/shared-security';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { 
  TrackEventCommand, 
  GetDashboardStatsQuery, 
  GetAdminStatsQuery,
  GetVendorStatsQuery 
} from '../application/commands-queries/analytics.bus';

@ApiTags('Analytics')
@Controller('analytics')
export class TrackingController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @ApiOperation({ summary: 'Track user interaction event', description: 'Kullanıcı etkileşimlerini (tıklama, sayfa görüntüleme, sepet işlemi) sisteme kaydeder.' })
  @ApiBody({ 
    schema: {
      type: 'object',
      properties: {
        eventType: { type: 'string', example: 'PAGE_VIEW' },
        metadata: { type: 'object', additionalProperties: true }
      },
      required: ['eventType']
    }
  })
  @ApiResponse({ status: 201, description: 'Olay kaydedildi.' })
  @Post('track')
  async track(@Body() dto: Record<string, any>) { return this.commandBus.execute(new TrackEventCommand(dto)); }
}

@ApiTags('Analytics Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics')
export class AnalyticsAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get root analytics (Admin)', description: 'Genel istatistikleri döner.' })
  @Get()
  async getRoot(@Query('period') period?: string) { return this.queryBus.execute(new GetDashboardStatsQuery((period as 'day' | 'week' | 'month') || 'day')); }

  @ApiOperation({ summary: 'Get dashboard statistics (Admin)', description: 'Yönetim paneli için özet istatistikleri ve grafik verilerini döner.' })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'DAILY' })
  @ApiResponse({ status: 200, description: 'İstatistik verileri.' })
  @ApiResponse({ status: 403, description: 'Sadece admin yetkisi ile erişilebilir.' })
  @Get('dashboard')
  async getDashboard(@Query('period') period?: string) { return this.queryBus.execute(new GetDashboardStatsQuery((period as 'day' | 'week' | 'month') || 'day')); }

  @ApiOperation({ summary: 'Get general admin statistics', description: 'Kullanıcı, ürün, vendor ve satış sayılarını kapsayan genel admin istatistiklerini döner.' })
  @ApiResponse({ status: 200, description: 'Genel istatistik verileri.' })
  @Get('stats')
  async getStats() { return this.queryBus.execute(new GetAdminStatsQuery()); }

  @ApiOperation({ summary: 'Get ledger analytics' })
  @Get('ledger')
  async getLedger(@Query('days') days: number = 30) {
    return { success: true, data: { items: [], total: 0 } };
  }

  @ApiOperation({ summary: 'Get anomaly analytics' })
  @Get('anomalies')
  async getAnomalies(@Query('window') window: number = 60) {
    return { success: true, data: { items: [], total: 0 } };
  }
}

@ApiTags('Analytics Vendor')
@ApiBearerAuth()
@Roles('VENDOR')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendor/analytics')
export class VendorAnalyticsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get general vendor statistics', description: 'Satıcının kendi ürün, satış ve müşteri verilerini döner.' })
  @ApiResponse({ status: 200, description: 'Satıcı istatistik verileri.' })
  @Get('stats')
  async getStats(@CurrentUser() user: AuthenticatedUser) {
    if (!user.vendorId) {
      throw new ForbiddenException('Bu işlem için bir satıcı profiline ihtiyacınız var.');
    }
    return this.queryBus.execute(new GetVendorStatsQuery(user.vendorId));
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
