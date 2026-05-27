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
import { Inject } from '@nestjs/common';
import { ICartRepository } from '../domain/repositories/cart.repository.interface';
import { ICouponRepository, IEscrowCouponRepository } from '../domain/repositories/coupon.repository.interface';

class ApplyEscrowCouponDto {
  @ApiProperty({ example: 'YENI10', description: 'Kupon kodu' })
  code!: string;
}

@ApiTags('Cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart/escrow-coupons')
export class CartEscrowCouponController {
  constructor(
    @Inject('ICartRepository') private readonly cartRepo: ICartRepository,
    @Inject('ICouponRepository') private readonly couponRepo: ICouponRepository,
    @Inject('IEscrowCouponRepository') private readonly escrowCouponRepo: IEscrowCouponRepository,
  ) {}

  @ApiOperation({ summary: 'Sepetteki escrow kuponları listele' })
  @Get()
  async getEscrowCoupons(@CurrentUser() user: AuthenticatedUser) {
    const cart = await this.cartRepo.findByUserId(user.id);
    if (!cart) return { success: true, data: [] };

    const props = cart.getProps();
    const coupons = await this.escrowCouponRepo.findByCartId(cart.id);
    return { success: true, data: coupons };
  }

  @ApiOperation({ summary: 'Sepete escrow kupon ekle' })
  @ApiBody({ type: ApplyEscrowCouponDto })
  @Post()
  async applyEscrowCoupon(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ApplyEscrowCouponDto,
  ) {
    let cart = await this.cartRepo.findByUserId(user.id);
    if (!cart) {
      cart = await this.cartRepo.findOrCreate(user.id);
    }

    const coupon = await this.couponRepo.findByCode(dto.code);
    if (!coupon) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş kupon kodu');
    }

    const cartProps = cart.getProps();

    const existing = await this.escrowCouponRepo.findByCartIdAndCode(cart.id, dto.code);
    if (existing) {
      throw new BadRequestException('Bu kupon zaten sepete eklenmiş');
    }

    const escrowCoupon = await this.escrowCouponRepo.create({
      cartId: cart.id,
      userId: user.id,
      code: dto.code,
      discount: coupon.discountAmount || 0,
      percentage: coupon.discountPercentage,
      minAmount: coupon.minOrderAmount,
      expiresAt: coupon.expiresAt,
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
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const coupon = await this.escrowCouponRepo.findById(id);

    if (!coupon || coupon.userId !== user.id) {
      throw new BadRequestException('Kupon bulunamadı');
    }

    await this.escrowCouponRepo.delete(id);

    return { success: true, message: 'Kupon sepetten kaldırıldı' };
  }
}
export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
