// apps/backend/src/modules/commerce/domain/value-objects/order-number.vo.ts

import { ValueObject } from '@barterborsa/shared-core';

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
    const randomPart = Math.floor(10000 + Math.random() * 90000).toString();
    return new OrderNumber({ value: `BB-${datePart}-${randomPart}` });
  }

  public static fromValue(value: string): OrderNumber {
    return new OrderNumber({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
