import { Controller, Get, Post, Param, UseGuards, Query, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { QueryBus, CommandBus } from '@nestjs/cqrs';
import { CurrentUser } from '@barterborsa/shared-nest';
import { ListVendorBannersQuery } from '../application/queries/list-vendor-banners.query';
import { CreateAdCampaignCommand } from '../../advertising/application/commands/create-ad-campaign.command';

@ApiTags('Vendor Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vendors/ads')
export class VendorAdsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

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
  async adSwap(@CurrentUser() user: AuthenticatedUser, @Body() body: any) {
    const dto = {
      name: body.name,
      platform: body.platform || 'BAZARX',
      budget: 0, // Paid with products
      adType: body.campaignType || 'BANNER',
      bidAmount: 0,
      pricingModel: 'CPC',
      startDate: new Date().toISOString().split('T')[0],
      endDate: undefined,
      targetCities: body.targetCities || [],
      targetDistricts: body.targetDistricts || [],
      targetSlots: body.targetSlots || [],
      targetKeywords: body.productIds || [], // Store productIds in targetKeywords
      negativeKeywords: [],
      mediaUrl: body.imageUrl,
    };

    const result = await this.commandBus.execute(
      new CreateAdCampaignCommand(user.vendorId ?? user.id, dto as any),
    );

    return { success: true, data: { id: result.id, status: 'PENDING' } };
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
