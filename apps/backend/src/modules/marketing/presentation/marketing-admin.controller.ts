// apps/backend/src/modules/marketing/presentation/marketing-admin.controller.ts
// Genel pazarlama yönetim paneli endpoint'leri

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/marketing')
export class MarketingAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Pazarlama genel istatistikleri' })
  @Get('stats')
  async getStats() {
    const [voucherCount, activeVouchers] = await Promise.all([
      this.prisma.giftVoucher.count(),
      this.prisma.giftVoucher.count({ where: { redeemedAt: null } }),
    ]);
    return { success: true, data: { voucherCount, activeVouchers } };
  }
}
