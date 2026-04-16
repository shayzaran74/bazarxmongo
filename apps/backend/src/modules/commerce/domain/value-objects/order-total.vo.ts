// apps/backend/src/modules/commerce/domain/value-objects/order-total.vo.ts

import { ValueObject } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';

export interface OrderTotalProps {
  subtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  total: Prisma.Decimal;
  paidWithCash: Prisma.Decimal;
  paidWithXP: Prisma.Decimal;
}

export class OrderTotal extends ValueObject<OrderTotalProps> {
  private constructor(props: OrderTotalProps) {
    super(props);
  }

  public static create(props: OrderTotalProps): OrderTotal {
    return new OrderTotal(props);
  }

  public static calculate(
    subtotal: Prisma.Decimal,
    discountAmount: Prisma.Decimal = new Prisma.Decimal(0),
    shippingCost: Prisma.Decimal = new Prisma.Decimal(0)
  ): OrderTotal {
    const total = subtotal.minus(discountAmount).plus(shippingCost);
    return new OrderTotal({
      subtotal,
      discountAmount,
      shippingCost,
      total,
      paidWithCash: total, // Default to cash payment if not split
      paidWithXP: new Prisma.Decimal(0),
    });
  }

  get total(): Prisma.Decimal { return this.props.total; }
  get subtotal(): Prisma.Decimal { return this.props.subtotal; }
  get discountAmount(): Prisma.Decimal { return this.props.discountAmount; }
  get shippingCost(): Prisma.Decimal { return this.props.shippingCost; }
  get paidWithCash(): Prisma.Decimal { return this.props.paidWithCash; }
  get paidWithXP(): Prisma.Decimal { return this.props.paidWithXP; }
}
