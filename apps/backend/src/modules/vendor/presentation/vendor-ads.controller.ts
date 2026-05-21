import { Controller, Get, Post, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { QueryBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListVendorBannersQuery } from '../application/queries/list-vendor-banners.query';

@ApiTags('Vendor Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors/ads')
export class VendorAdsController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Get ads summary for dashboard' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('summary')
  async getSummary(@Query('days') days: string = '30') {
    return {
      success: true,
      data: {
        summary: {
          impressions: 0,
          clicks: 0,
          spend: 0,
          sales: 0,
          orders: 0,
          ctr: 0,
          roas: 0,
        },
        chartData: [],
      },
    };
  }

  @ApiOperation({ summary: 'List vendor banners' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('banners')
  async getBanners(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new ListVendorBannersQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'List ad campaigns' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('campaigns')
  async getCampaigns() {
    return { success: true, data: [] };
  }

  @Post('ad-swap')
  async adSwap() {
    return { success: true, data: { id: Date.now().toString(), status: 'PENDING' } };
  }

  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return { success: true, data: { id, status: 'ACTIVE' } };
  }

  @Get(':id/report')
  async report(@Param('id') id: string) {
    return { success: true, data: [] };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
