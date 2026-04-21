import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';

@ApiTags('Ads')
@Controller('ads')
export class AdsController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    return { success: true, data: [] };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('dashboard/summary')
  async getSummary(@Query('period') period?: string) {
    return {
      success: true,
      data: {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        ctr: 0,
        chartData: []
      }
    };
  }
}

@ApiTags('Vendor Ads')
@Controller('vendor-ads')
export class VendorAdsController {
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('ad-swap')
  async adSwap() {
    return { success: true, data: { id: Date.now().toString(), status: 'PENDING' } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post(':id/activate')
  async activate(@Param('id') id: string) {
    return { success: true, data: { id, status: 'ACTIVE' } };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(':id/report')
  async report(@Param('id') id: string) {
    return { success: true, data: [] };
  }
}
