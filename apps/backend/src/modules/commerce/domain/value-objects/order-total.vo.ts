// apps/backend/src/modules/commerce/domain/value-objects/order-total.vo.ts

import { ValueObject } from '@barterborsa/shared-core';

export interface OrderTotalProps {
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  paidWithCash: number;
  paidWithXP: number;
}

export class OrderTotal extends ValueObject<OrderTotalProps> {
  private constructor(props: OrderTotalProps) {
    super(props);
  }

  public static create(props: OrderTotalProps): OrderTotal {
    return new OrderTotal(props);
  }

  public static calculate(
    subtotal: number,
    discountAmount: number = 0,
    shippingCost: number = 0
  ): OrderTotal {
    const total = subtotal - discountAmount + shippingCost;
    return new OrderTotal({
      subtotal,
      discountAmount,
      shippingCost,
      total,
      paidWithCash: total, // Default to cash payment if not split
      paidWithXP: 0,
    });
  }

  get total(): number { return this.props.total; }
  get subtotal(): number { return this.props.subtotal; }
  get discountAmount(): number { return this.props.discountAmount; }
  get shippingCost(): number { return this.props.shippingCost; }
  get paidWithCash(): number { return this.props.paidWithCash; }
  get paidWithXP(): number { return this.props.paidWithXP; }
}
