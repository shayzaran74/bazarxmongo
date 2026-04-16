// apps/backend/src/modules/commerce/application/services/pricing.service.ts

import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { OrderTotal } from '../../domain/value-objects/order-total.vo';

@Injectable()
export class PricingService {
  calculateOrderTotal(
    items: { price: Prisma.Decimal; quantity: number }[],
    discountAmount: Prisma.Decimal = new Prisma.Decimal(0),
    shippingCost: Prisma.Decimal = new Prisma.Decimal(0)
  ): OrderTotal {
    let subtotal = new Prisma.Decimal(0);
    for (const item of items) {
      subtotal = subtotal.plus(item.price.mul(item.quantity));
    }

    return OrderTotal.calculate(subtotal, discountAmount, shippingCost);
  }
}
