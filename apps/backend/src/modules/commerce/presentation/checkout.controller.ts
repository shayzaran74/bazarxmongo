// apps/backend/src/modules/commerce/presentation/checkout.controller.ts

import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CheckoutDto } from '../application/dtos/checkout.dto';
import { CheckoutCommand } from '../application/commands/checkout.command';
import { CurrentUser } from '@barterborsa/shared-nest';
import { JwtAuthGuard, Roles } from '@barterborsa/shared-security';
import { ShippingAddress } from '../domain/value-objects/shipping-address.vo';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly commandBus: CommandBus) {}

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
