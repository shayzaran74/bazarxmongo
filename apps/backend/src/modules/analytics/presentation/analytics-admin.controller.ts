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

@ApiTags('Analytics Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/analytics')
export class AnalyticsAdminController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get root analytics (Admin)', description: 'Genel istatistikleri döner.' })
  @Get()
  async getRoot(@Query('period') period: any) { return this.queryBus.execute(new GetDashboardStatsQuery(period || 'DAILY')); }

  @ApiOperation({ summary: 'Get dashboard statistics (Admin)', description: 'Yönetim paneli için özet istatistikleri ve grafik verilerini döner.' })
  @ApiQuery({ name: 'period', required: false, enum: ['DAILY', 'WEEKLY', 'MONTHLY'], example: 'DAILY' })
  @ApiResponse({ status: 200, description: 'İstatistik verileri.' })
  @ApiResponse({ status: 403, description: 'Sadece admin yetkisi ile erişilebilir.' })
  @Get('dashboard')
  async getDashboard(@Query('period') period: any) { return this.queryBus.execute(new GetDashboardStatsQuery(period)); }

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
