// apps/backend/src/modules/commerce/domain/value-objects/order-number.vo.ts

import { ValueObject, ORDER_NUMBER_MIN, ORDER_NUMBER_MAX } from '@barterborsa/shared-core';

interface OrderNumberProps {
  value: string;
}

export class OrderNumber extends ValueObject<OrderNumberProps> {
  private constructor(props: OrderNumberProps) {
    super(props);
  }

  public static create(value: string): OrderNumber {
    if (!value || value.length < 5) {
      throw new Error('Invalid order number');
    }
    return new OrderNumber({ value });
  }

  public static generate(): OrderNumber {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(ORDER_NUMBER_MIN + Math.random() * (ORDER_NUMBER_MAX - ORDER_NUMBER_MIN)).toString();
    return new OrderNumber({ value: `BB-${datePart}-${randomPart}` });
  }

  public static fromValue(value: string): OrderNumber {
    return new OrderNumber({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
