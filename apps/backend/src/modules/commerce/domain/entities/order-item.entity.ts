// apps/backend/src/modules/commerce/domain/entities/order-item.entity.ts

import { Entity } from '@barterborsa/shared-core';

export interface OrderItemProps {
  orderId: string;
  listingId: string;
  quantity: number;
  price: number;
  totalAmount: number;
  productName: string;
  productImages: string[];
  variantInfo?: any;
}

export class OrderItem extends Entity<OrderItemProps> {
  protected constructor(props: OrderItemProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: OrderItemProps, id: string): OrderItem {
    return new OrderItem(props, id);
  }

  public static create(
    listingId: string,
    quantity: number,
    price: number,
    productName: string,
    productImages: string[],
    variantInfo?: any
  ): OrderItem {
    return new OrderItem({
      orderId: '', // Set by aggregate root later
      listingId,
      quantity,
      price,
      totalAmount: price * quantity,
      productName,
      productImages,
      variantInfo,
    });
  }

  public setOrderId(orderId: string): void {
    this.props.orderId = orderId;
  }
}
