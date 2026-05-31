// apps/backend/src/modules/bazarxgo/domain/entities/go-order.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { GoOrderStatus, DELIVERY_TRANSITIONS, GELAL_TRANSITIONS } from '../enums/go-order-status.enum';
import { GoOrderMode } from '../enums/go-order-mode.enum';

export interface GoOrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

export interface GoOrderProps {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: GoOrderItem[];
  mode: GoOrderMode;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: GoOrderStatus;
  holdId?: string;
  estimatedMinutes: number;
  addressLine?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class GoOrder extends AggregateRoot<GoOrderProps> {
  private constructor(props: GoOrderProps, id?: string) {
    super(props, id);
  }

  public static create(
    userId: string,
    restaurantId: string,
    restaurantName: string,
    items: GoOrderItem[],
    mode: GoOrderMode,
    subtotal: number,
    deliveryFee: number,
    discount: number,
    total: number,
    estimatedMinutes: number,
    addressLine?: string,
    couponCode?: string,
  ): GoOrder {
    if (items.length === 0) {
      throw new DomainException('Sipariş en az bir ürün içermelidir');
    }
    if (total < 0) {
      throw new DomainException('Sipariş tutarı negatif olamaz');
    }
    const now = new Date();
    return new GoOrder({
      userId,
      restaurantId,
      restaurantName,
      items,
      mode,
      subtotal,
      deliveryFee,
      discount,
      total,
      couponCode,
      status: GoOrderStatus.RECEIVED,
      estimatedMinutes,
      addressLine,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static createFrom(props: GoOrderProps, id: string): GoOrder {
    return new GoOrder(props, id);
  }

  public advance(): void {
    const map = this.props.mode === GoOrderMode.GELAL
      ? GELAL_TRANSITIONS
      : DELIVERY_TRANSITIONS;

    const allowed = map[this.props.status] ?? [];
    if (allowed.length === 0) {
      throw new DomainException(`${this.props.status} durumundan ilerlenemez`);
    }
    // Bir sonraki adıma geç (ilk geçerli)
    this.props.status = allowed[0];
    this.props.updatedAt = new Date();
  }

  public cancel(): void {
    const map = this.props.mode === GoOrderMode.GELAL
      ? GELAL_TRANSITIONS
      : DELIVERY_TRANSITIONS;

    const allowed = map[this.props.status] ?? [];
    if (!allowed.includes(GoOrderStatus.CANCELLED)) {
      throw new DomainException(`${this.props.status} durumundaki sipariş iptal edilemez`);
    }
    this.props.status = GoOrderStatus.CANCELLED;
    this.props.updatedAt = new Date();
  }

  public assignHold(holdId: string): void {
    this.props.holdId = holdId;
    this.props.updatedAt = new Date();
  }
}
