import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
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

  @ApiOperation({ summary: 'List all coupons' })
  @Get()
  async listCoupons() {
    const items = await this.prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Create new coupon' })
  @Post()
  async createCoupon(@Body() dto: any) {
    const coupon = await this.prisma.coupon.create({
      data: {
        code: dto.code.toUpperCase(),
        discountAmount: dto.type === 'FIXED' ? dto.value : null,
        discountPercentage: dto.type === 'PERCENTAGE' ? dto.value : null,
        minOrderAmount: dto.minAmount || 0,
        expiresAt: dto.endDate ? new Date(dto.endDate) : null,
        isActive: true,
      },
    });
    return { success: true, data: coupon };
  }

  @ApiOperation({ summary: 'Delete coupon' })
  @Delete(':id')
  async deleteCoupon(@Param('id') id: string) {
    await this.prisma.coupon.delete({
      where: { id },
    });
    return { success: true };
  }
}
