// apps/backend/src/modules/commerce/application/services/pricing.service.ts

import { Injectable } from '@nestjs/common';
import { OrderTotal } from '../../domain/value-objects/order-total.vo';

@Injectable()
export class PricingService {
  calculateOrderTotal(
    items: { price: number; quantity: number }[],
    discountAmount: number = 0,
    shippingCost: number = 0
  ): OrderTotal {
    let subtotal = 0;
    for (const item of items) {
      subtotal += item.price * item.quantity;
    }

    return OrderTotal.calculate(subtotal, discountAmount, shippingCost);
  }
}
