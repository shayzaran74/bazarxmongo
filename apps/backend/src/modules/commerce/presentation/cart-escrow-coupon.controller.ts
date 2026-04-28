// apps/backend/src/modules/commerce/presentation/cart-escrow-coupon.controller.ts
// POST /cart/escrow-coupons   → Sepete escrow kupon ekle
// DELETE /cart/escrow-coupons/:id → Sepetten escrow kupon kaldır
// GET /cart/escrow-coupons    → (cart.controller.ts'den buraya taşındı)

import {
  Controller, Post, Delete, Get, Body, Param, UseGuards, BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiParam, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';

class ApplyEscrowCouponDto {
  @ApiProperty({ example: 'YENI10', description: 'Kupon kodu' })
  code!: string;
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart/escrow-coupons')
export class CartEscrowCouponController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiOperation({ summary: 'Sepetteki escrow kuponları listele' })
  @Get()
  async getEscrowCoupons(@CurrentUser() user: any) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
    });
    if (!cart) return { success: true, data: [] };

    const coupons = await this.prisma.escrowCoupon.findMany({
      where: { cartId: cart.id, isActive: true },
      orderBy: { appliedAt: 'desc' },
    });
    return { success: true, data: coupons };
  }

  @ApiOperation({ summary: 'Sepete escrow kupon ekle' })
  @ApiBody({ type: ApplyEscrowCouponDto })
  @Post()
  async applyEscrowCoupon(
    @CurrentUser() user: any,
    @Body() dto: ApplyEscrowCouponDto,
  ) {
    // Sepeti bul veya oluştur
    let cart = await this.prisma.cart.findUnique({ where: { userId: user.id } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId: user.id } });
    }

    // Kupon kodunu doğrula (Coupon modeli mevcut ise)
    const coupon = await this.prisma.coupon.findFirst({
      where: {
        code: dto.code,
        isActive: true,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    }).catch(() => null); // Coupon modeli yoksa null dön

    if (!coupon) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş kupon kodu');
    }

    // Aynı kupon zaten eklenmiş mi?
    const existing = await this.prisma.escrowCoupon.findFirst({
      where: { cartId: cart.id, code: dto.code, isActive: true },
    });
    if (existing) {
      throw new BadRequestException('Bu kupon zaten sepete eklenmiş');
    }

    const escrowCoupon = await this.prisma.escrowCoupon.create({
      data: {
        cartId: cart.id,
        userId: user.id,
        code: dto.code,
        discount: coupon.discountAmount || 0,
        percentage: coupon.discountPercentage,
        minAmount: coupon.minOrderAmount,
        expiresAt: coupon.expiresAt,
      },
    });

    return {
      success: true,
      data: escrowCoupon,
      message: 'Kupon sepete eklendi',
    };
  }

  @ApiOperation({ summary: 'Sepetten escrow kupon kaldır' })
  @ApiParam({ name: 'id', description: 'EscrowCoupon ID' })
  @Delete(':id')
  async removeEscrowCoupon(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    const coupon = await this.prisma.escrowCoupon.findFirst({
      where: { id, userId: user.id },
    });

    if (!coupon) {
      throw new BadRequestException('Kupon bulunamadı');
    }

    await this.prisma.escrowCoupon.delete({ where: { id } });

    return { success: true, message: 'Kupon sepetten kaldırıldı' };
  }
}
