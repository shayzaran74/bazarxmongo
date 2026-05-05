// apps/backend/src/modules/commerce/domain/entities/order.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { Prisma } from '@prisma/client';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderNumber } from '../value-objects/order-number.vo';
import { ShippingAddress } from '../value-objects/shipping-address.vo';
import { OrderTotal } from '../value-objects/order-total.vo';
import { OrderItem } from './order-item.entity';

export interface OrderProps {
  userId: string;
  vendorId: string;
  status: OrderStatus;
  orderNumber: OrderNumber;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  totalAmount: Prisma.Decimal;
  paymentMethod: string; // From Enum if preferred
  paymentStatus: string;
  vendorStatus: string;
  buyerStatus: string;
  currency: string;
  discountAmount: Prisma.Decimal;
  shippingCost: Prisma.Decimal;
  paidWithXP: Prisma.Decimal;
  paidWithCash: Prisma.Decimal;
  paidAt?: Date;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: Date;
  escrowStatus?: string;
  escrowReleaseAt?: Date;
  payoutEligibleAt?: Date;
  escrowHoldId?: string;
  metadata?: Record<string, unknown>;
  couponCode?: string;
  expiresAt?: Date;
  items?: OrderItem[];
}

export class Order extends AggregateRoot<OrderProps> {
  protected constructor(props: OrderProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: OrderProps, id: string): Order {
    return new Order(props, id);
  }

  public static create(
    userId: string,
    vendorId: string,
    orderNumber: OrderNumber,
    items: OrderItem[],
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress,
    paymentMethod: string,
    totals: OrderTotal,
    couponCode?: string,
    expiresAt?: Date,
  ): Order {
    const order = new Order({
      userId,
      vendorId,
      status: OrderStatus.PENDING,
      orderNumber,
      items,
      shippingAddress,
      billingAddress,
      totalAmount: totals.total,
      paymentMethod,
      paymentStatus: 'PENDING',
      vendorStatus: 'PENDING',
      buyerStatus: 'PENDING',
      currency: 'TRY',
      discountAmount: totals.discountAmount,
      shippingCost: totals.shippingCost,
      paidWithXP: totals.paidWithXP,
      paidWithCash: totals.paidWithCash,
      couponCode,
      expiresAt,
    });

    // Add Domain Event: OrderCreatedEvent here later
    return order;
  }

  public pay(): void {
    if (this.props.status !== OrderStatus.PENDING) {
      throw new DomainException('Only PENDING orders can be paid');
    }
    this.props.status = OrderStatus.PAID;
    this.props.paymentStatus = 'COMPLETED';
    this.props.paidAt = new Date();
    this._updatedAt = new Date();
  }

  public confirm(): void {
    if (this.props.status !== OrderStatus.PAID) {
      throw new DomainException('Only PAID orders can be confirmed');
    }
    this.props.status = OrderStatus.CONFIRMED;
    this.props.vendorStatus = 'CONFIRMED';
    this._updatedAt = new Date();
  }

  public ship(trackingNumber: string, carrier: string): void {
    if (![OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.props.status)) {
       throw new DomainException('Order must be CONFIRMED or PROCESSING to be shipped');
    }
    this.props.status = OrderStatus.SHIPPED;
    this.props.trackingNumber = trackingNumber;
    this.props.shippingCarrier = carrier;
    this._updatedAt = new Date();
  }

  public deliver(): void {
    if (this.props.status !== OrderStatus.SHIPPED) {
      throw new DomainException('Only SHIPPED orders can be delivered');
    }
    this.props.status = OrderStatus.DELIVERED;
    this.props.buyerStatus = 'DELIVERED';
    // Dispute window usually starts here
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3); // 3 days dispute window
    this.props.escrowReleaseAt = releaseDate;
    this._updatedAt = new Date();
  }

  get orderNumber(): string { return this.props.orderNumber.value; }
  get status(): OrderStatus { return this.props.status; }
}
