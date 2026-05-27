import { Controller, Get, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Coupon } from '@barterborsa/shared-persistence/schemas/backend/coupon.schema';

@ApiTags('Marketing')
@Controller('coupons')
export class PublicCouponController {
  @ApiOperation({ summary: 'List public coupons' })
  @Get()
  async listPublicCoupons() {
    return { success: true, data: [] };
  }

  @ApiOperation({ summary: 'Validate coupon code' })
  @Post('validate')
  @UseGuards(JwtAuthGuard)
  async validateCoupon(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { code: string; totalAmount?: number }
  ) {
    const { code, totalAmount } = body;
    if (!code) {
      throw new BadRequestException('Kupon kodu girilmelidir');
    }

    const coupon = await Coupon.findOne({ code: { $regex: new RegExp(`^${code}$`, 'i') }, isActive: true }).exec();
    if (!coupon) {
      throw new BadRequestException('Geçersiz veya süresi dolmuş kupon');
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      throw new BadRequestException('Kuponun süresi dolmuş');
    }

    let userTotalAmount = totalAmount;
    if (!userTotalAmount && user) {
      // Fetch cart and items dynamically
      const Cart = (await import('@barterborsa/shared-persistence/schemas/backend/cart.schema')).Cart;
      const CartItem = (await import('@barterborsa/shared-persistence/schemas/backend/cartItem.schema')).CartItem;
      const Listing = (await import('@barterborsa/shared-persistence/schemas/backend/listing.schema')).Listing;

      const cart = await Cart.findOne({ userId: user.id }).exec();
      if (cart) {
        const items = await CartItem.find({ cartId: cart.id }).exec();
        const listingIds = items.map(i => i.listingId).filter(Boolean);
        const listings = listingIds.length > 0 
          ? await Listing.find({ id: { $in: listingIds } }).lean() 
          : [];

        let calculatedTotal = 0;
        for (const item of items) {
          const listing = listings.find(l => l.id === item.listingId);
          if (listing) {
            calculatedTotal += Number(listing.price) * item.quantity;
          }
        }
        userTotalAmount = calculatedTotal;
      }
    }

    if (userTotalAmount && coupon.minOrderAmount && userTotalAmount < coupon.minOrderAmount) {
      throw new BadRequestException(`Bu kupon en az ₺${coupon.minOrderAmount} değerindeki siparişlerde kullanılabilir`);
    }

    let discountAmount = 0;
    if (coupon.discountAmount) {
      discountAmount = coupon.discountAmount;
    } else if (coupon.discountPercentage && userTotalAmount) {
      discountAmount = (userTotalAmount * coupon.discountPercentage) / 100;
    }

    return {
      success: true,
      data: {
        code: coupon.code,
        discountAmount,
      },
    };
  }
}

export interface AuthenticatedUser { id: string; role: string; vendorId?: string; firstName?: string; lastName?: string; }
