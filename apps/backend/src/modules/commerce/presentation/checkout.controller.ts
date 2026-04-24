import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody 
} from '@nestjs/swagger';
import { CheckoutDto } from '../application/dtos/checkout.dto';
import { CheckoutCommand } from '../application/commands/checkout.command';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { ShippingAddress } from '../domain/value-objects/shipping-address.vo';
import { PrismaService } from '@barterborsa/shared-persistence';

@ApiTags('Checkout')
@ApiBearerAuth()
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Process checkout', description: 'Sepetteki ürünler için sipariş oluşturma sürecini başlatır.' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 201, description: 'Sipariş başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Geçersiz adres veya ödeme yöntemi.' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    let shippingAddress: ShippingAddress;
    let billingAddress: ShippingAddress;

    if (dto.addressId) {
      const address = await this.prisma.userAddress.findUnique({
        where: { id: dto.addressId, userId: user.id }
      });
      if (!address) {
        throw new BadRequestException('Seçilen adres bulunamadı.');
      }
      
      const addrData = {
        firstName: address.firstName || user.firstName || 'User',
        lastName: address.lastName || user.lastName || '',
        phone: address.phone || '',
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2 || '',
        city: address.city,
        district: address.district,
        postalCode: address.postalCode || '00000',
      };
      
      shippingAddress = ShippingAddress.create(addrData as any);
      billingAddress = ShippingAddress.create(addrData as any);
    } else if (dto.shippingAddress && dto.billingAddress) {
      shippingAddress = ShippingAddress.create(dto.shippingAddress as any);
      billingAddress = ShippingAddress.create(dto.billingAddress as any);
    } else {
      throw new BadRequestException('Teslimat adresi belirtilmelidir.');
    }

    // Map frontend payment method to Prisma PaymentMethod enum
    const paymentMethodMap: Record<string, string> = {
      'card': 'IYZICO',
      'iyzico': 'IYZICO',
      'wallet': 'WALLET',
      'bank_transfer': 'BANK_TRANSFER',
      'barter': 'BARTER',
      'gift_card': 'GIFT_CARD',
      'mixed': 'MIXED',
    };
    const mappedPaymentMethod = paymentMethodMap[dto.paymentMethod?.toLowerCase()] || 'BANK_TRANSFER';

    const orders = await this.commandBus.execute(
      new CheckoutCommand(
        user.id,
        shippingAddress,
        billingAddress,
        mappedPaymentMethod,
        dto.couponCode,
        dto.useWallet
      )
    );

    const orderArray = Array.isArray(orders) ? orders : [orders];
    const firstOrder = orderArray[0];
    return {
      success: true,
      data: orderArray,
      orderId: firstOrder?.id || null,
      orderNumber: firstOrder?.getProps?.()?.orderNumber?.value || null,
    };
  }
}
