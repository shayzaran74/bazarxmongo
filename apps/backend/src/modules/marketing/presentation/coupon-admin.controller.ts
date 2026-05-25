import { Controller, Get, Post, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsPositive, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { Coupon } from '@barterborsa/shared-persistence/schemas/backend/coupon.schema';

class CreateCouponDto {
  @IsString() @MaxLength(50) code!: string;
  @IsString() type!: 'FIXED' | 'PERCENTAGE';
  @IsNumber() @IsPositive() value!: number;
  @IsOptional() @IsNumber() minAmount?: number;
  @IsOptional() @IsString() endDate?: string;
}

@ApiTags('Marketing Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/coupons')
export class CouponAdminController {
  @ApiOperation({ summary: 'List all coupons' })
  @Get()
  async listCoupons() {
    const items = await Coupon.find().sort({ createdAt: -1 }).lean();
    return { success: true, data: items };
  }

  @ApiOperation({ summary: 'Create new coupon' })
  @Post()
  async createCoupon(@Body() dto: CreateCouponDto) {
    const id = 'coupon-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const coupon = await Coupon.create({
      _id: id,
      id,
      code: dto.code.toUpperCase(),
      discountAmount: dto.type === 'FIXED' ? dto.value : null,
      discountPercentage: dto.type === 'PERCENTAGE' ? dto.value : null,
      minOrderAmount: dto.minAmount || 0,
      expiresAt: dto.endDate ? new Date(dto.endDate) : null,
      isActive: true,
    });
    return { success: true, data: coupon };
  }

  @ApiOperation({ summary: 'Delete coupon' })
  @Delete(':id')
  async deleteCoupon(@Param('id') id: string) {
    await Coupon.deleteOne({ id }).exec();
    return { success: true };
  }
}
