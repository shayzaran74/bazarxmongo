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

export interface AuthenticatedUser { id: string; role: string; }
