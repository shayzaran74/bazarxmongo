// apps/backend/src/modules/commerce/domain/entities/order-item.entity.ts

import { Entity } from '@barterborsa/shared-core';

export interface OrderItemVariantInfo {
  variantId?: string;
  sku?: string;
  attributes?: Record<string, string | number>;
  [key: string]: unknown;
}

export interface OrderItemProps {
  orderId: string;
  listingId: string;
  quantity: number;
  price: number;
  totalAmount: number;
  productName: string;
  productImages: string[];
  variantInfo?: OrderItemVariantInfo;
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
    variantInfo?: OrderItemVariantInfo
  ): OrderItem {
    return new OrderItem({
      orderId: '',
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

  get id(): string { return this._id; }
  get orderId(): string { return this.props.orderId; }
  get listingId(): string { return this.props.listingId; }
  get quantity(): number { return this.props.quantity; }
  get price(): number { return this.props.price; }
  get totalAmount(): number { return this.props.totalAmount; }
  get productName(): string { return this.props.productName; }
  get productImages(): string[] { return this.props.productImages; }
  get variantInfo(): OrderItemVariantInfo | undefined { return this.props.variantInfo; }
}
