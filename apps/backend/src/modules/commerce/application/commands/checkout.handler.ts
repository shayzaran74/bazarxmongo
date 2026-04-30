// apps/backend/src/modules/commerce/application/commands/checkout.handler.ts

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CheckoutCommand } from './checkout.command';
import { CheckoutService } from '../services/checkout.service';

@CommandHandler(CheckoutCommand)
export class CheckoutHandler implements ICommandHandler<CheckoutCommand> {
  constructor(private readonly checkoutService: CheckoutService) {}

  async execute(command: CheckoutCommand) {
    const { userId, shippingAddress, billingAddress, paymentMethod, couponCode, useWallet, clientMutationId } = command;
    return this.checkoutService.checkout(userId, shippingAddress, billingAddress, paymentMethod, couponCode, useWallet, clientMutationId);
  }
}
