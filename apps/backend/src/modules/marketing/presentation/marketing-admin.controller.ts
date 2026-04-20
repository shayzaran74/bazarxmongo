import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Gift Card Admin')
@ApiBearerAuth()
@Roles('ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/gift-cards')
export class GiftCardAdminController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'List gift cards' })
  @Get()
  async listGiftCards() {
    return { success: true, data: [] };
  }
}

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN')
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
