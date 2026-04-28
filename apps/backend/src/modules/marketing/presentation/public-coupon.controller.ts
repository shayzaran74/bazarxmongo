import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Marketing')
@Controller('coupons')
export class PublicCouponController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List public coupons' })
  @Get()
  async listPublicCoupons() {
    return { success: true, data: [] };
  }
}
