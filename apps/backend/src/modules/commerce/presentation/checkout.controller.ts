import { Controller, Post, Body, UseGuards } from '@nestjs/common';
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

@ApiTags('Checkout')
@ApiBearerAuth()
@Controller('checkout')
export class CheckoutController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiOperation({ summary: 'Process checkout', description: 'Sepetteki ürünler için sipariş oluşturma sürecini başlatır.' })
  @ApiBody({ type: CheckoutDto })
  @ApiResponse({ status: 201, description: 'Sipariş başarıyla oluşturuldu.' })
  @ApiResponse({ status: 400, description: 'Geçersiz adres veya ödeme yöntemi.' })
  @Post()
  @UseGuards(JwtAuthGuard)
  async checkout(@CurrentUser() user: any, @Body() dto: CheckoutDto) {
    const shippingAddress = ShippingAddress.create(dto.shippingAddress);
    const billingAddress = ShippingAddress.create(dto.billingAddress);

    return this.commandBus.execute(
      new CheckoutCommand(
        user.id,
        shippingAddress,
        billingAddress,
        dto.paymentMethod,
        dto.couponCode
      )
    );
  }
}
