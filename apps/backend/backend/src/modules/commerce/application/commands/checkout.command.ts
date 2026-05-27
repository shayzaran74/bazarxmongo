// apps/backend/src/modules/commerce/application/commands/checkout.command.ts

import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo';

export class CheckoutCommand {
  constructor(
    public readonly userId: string,
    public readonly shippingAddress: ShippingAddress,
    public readonly billingAddress: ShippingAddress,
    public readonly paymentMethod: string,
    public readonly couponCode?: string,
    public readonly useWallet: boolean = false,
    public readonly clientMutationId?: string,
  ) {}
}
