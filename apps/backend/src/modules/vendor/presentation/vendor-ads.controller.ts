// apps/backend/src/modules/vendor/presentation/vendor-ads.controller.ts

import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';

@ApiTags('Vendor Ads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('vendor-ads')
export class VendorAdsController {
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
