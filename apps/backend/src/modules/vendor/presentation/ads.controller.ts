// apps/backend/src/modules/vendor/presentation/ads.controller.ts

import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';

@ApiTags('Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ads')
export class AdsController {
  @Get()
  async findAll() {
    return { success: true, data: [] };
  }

  @Get('dashboard/summary')
  async getSummary(@Query('period') period?: string) {
    return {
      success: true,
      data: {
        totalImpressions: 0,
        totalClicks: 0,
        totalSpend: 0,
        ctr: 0,
        chartData: [],
      },
    };
  }
}
