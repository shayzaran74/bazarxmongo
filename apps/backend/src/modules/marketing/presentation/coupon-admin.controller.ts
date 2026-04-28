import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/coupons')
export class CouponAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List coupons' })
  @Get()
  async listCoupons() {
    return { success: true, data: [] };
  }
}
