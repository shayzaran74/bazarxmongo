// apps/backend/src/modules/commerce/domain/entities/order.entity.ts

import { AggregateRoot, DomainException } from '@barterborsa/shared-core';
import { OrderStatus } from '../enums/order-status.enum';
import { DeliveryType } from '../enums/delivery-type.enum';
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
  totalAmount: number;
  paymentMethod: string; // From Enum if preferred
  paymentStatus: string;
  vendorStatus: string;
  buyerStatus: string;
  currency: string;
  discountAmount: number;
  shippingCost: number;
  paidWithXP: number;
  paidWithCash: number;
  // BazarX Go — Teslim türü (CARGO/LOCAL_COURIER/PICKUP). Vendor tipine göre set edilir.
  deliveryType: DeliveryType;
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

// State geçiş haritası — hem COMMERCE (kargo) hem RESTAURANT (mutfak+kurye) akışlarını kapsar
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]:            [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]:               [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]:          [OrderStatus.PROCESSING, OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  // RESTAURANT akışı: PROCESSING → PREPARING → READY → AWAITING_PICKUP / OUT_FOR_DELIVERY → DELIVERED
  [OrderStatus.PROCESSING]:         [OrderStatus.PREPARING, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]:          [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]:              [OrderStatus.AWAITING_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.AWAITING_PICKUP]:    [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]:   [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  // COMMERCE akışı: SHIPPED → DELIVERED
  [OrderStatus.SHIPPED]:            [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]:          [OrderStatus.COMPLETED, OrderStatus.DISPUTED],
  [OrderStatus.COMPLETED]:          [],
  [OrderStatus.CANCELLED]:          [OrderStatus.REFUNDED, OrderStatus.PARTIALLY_REFUNDED],
  [OrderStatus.REFUNDED]:           [],
  [OrderStatus.PARTIALLY_REFUNDED]: [],
  [OrderStatus.DISPUTED]:           [OrderStatus.COMPLETED, OrderStatus.REFUNDED, OrderStatus.DELIVERED],
};

export class Order extends AggregateRoot<OrderProps> {
  protected constructor(props: OrderProps, id?: string) {
    super(props, id);
  }

  public static fromPersistence(props: OrderProps, id: string): Order {
    return new Order(props, id);
  }

  // Merkezi state geçiş metodu
  public transitionTo(newStatus: OrderStatus): void {
    const current = this.props.status;
    const allowed = VALID_TRANSITIONS[current] || [];

    if (!allowed.includes(newStatus)) {
      throw new DomainException(
        `Invalid state transition: ${current} → ${newStatus}`,
      );
    }

    this.props.status = newStatus;
    this._updatedAt = new Date();
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
    deliveryType: DeliveryType = DeliveryType.CARGO,
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
      deliveryType,
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
    this.transitionTo(OrderStatus.PAID);
    this.props.paymentStatus = 'COMPLETED';
    this.props.paidAt = new Date();
  }

  public confirm(): void {
    if (this.props.status !== OrderStatus.PAID) {
      throw new DomainException('Only PAID orders can be confirmed');
    }
    this.transitionTo(OrderStatus.CONFIRMED);
    this.props.vendorStatus = 'CONFIRMED';
  }

  public process(): void {
    if (this.props.status !== OrderStatus.CONFIRMED) {
      throw new DomainException('Only CONFIRMED orders can be processed');
    }
    this.transitionTo(OrderStatus.PROCESSING);
  }

  public ship(trackingNumber: string, carrier: string): void {
    if (![OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.props.status)) {
       throw new DomainException('Order must be CONFIRMED or PROCESSING to be shipped');
    }
    this.transitionTo(OrderStatus.SHIPPED);
    this.props.trackingNumber = trackingNumber;
    this.props.shippingCarrier = carrier;
  }

  // BazarX Go — RESTAURANT mutfak akışı

  public markPreparing(): void {
    if (![OrderStatus.CONFIRMED, OrderStatus.PROCESSING].includes(this.props.status)) {
      throw new DomainException('Sipariş ancak CONFIRMED veya PROCESSING durumdayken hazırlanmaya alınabilir.');
    }
    this.transitionTo(OrderStatus.PREPARING);
    this.props.vendorStatus = 'PREPARING';
  }

  public markReady(): void {
    if (this.props.status !== OrderStatus.PREPARING) {
      throw new DomainException('Sadece PREPARING durumdaki sipariş hazır olarak işaretlenebilir.');
    }
    this.transitionTo(OrderStatus.READY);
    this.props.vendorStatus = 'READY';
  }

  public awaitPickup(): void {
    this.transitionTo(OrderStatus.AWAITING_PICKUP);
  }

  public dispatchToCourier(): void {
    this.transitionTo(OrderStatus.OUT_FOR_DELIVERY);
  }

  public deliver(): void {
    // Restoran akışı: READY/AWAITING_PICKUP/OUT_FOR_DELIVERY üzerinden de teslim edilebilir
    const deliverableStatuses = [
      OrderStatus.SHIPPED,
      OrderStatus.READY,
      OrderStatus.AWAITING_PICKUP,
      OrderStatus.OUT_FOR_DELIVERY,
    ];
    if (!deliverableStatuses.includes(this.props.status)) {
      throw new DomainException('Sipariş bu durumdan DELIVERED konumuna geçemez.');
    }
    this.transitionTo(OrderStatus.DELIVERED);
    this.props.buyerStatus = 'DELIVERED';
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 3);
    this.props.escrowReleaseAt = releaseDate;
  }

  public dispute(): void {
    if (this.props.status !== OrderStatus.DELIVERED && this.props.status !== OrderStatus.SHIPPED) {
      throw new DomainException('Only DELIVERED or SHIPPED orders can be disputed');
    }
    this.transitionTo(OrderStatus.DISPUTED);
  }

  public resolveDispute(resolution: 'REFUND' | 'RELEASE' | 'REJECT'): void {
    if (this.props.status !== OrderStatus.DISPUTED) {
      throw new DomainException('Only DISPUTED orders can be resolved');
    }
    if (resolution === 'REFUND') {
      this.transitionTo(OrderStatus.REFUNDED);
    } else if (resolution === 'RELEASE') {
      this.transitionTo(OrderStatus.COMPLETED);
    } else {
      // REJECT — siparişi DELIVERED'a döndür (manual, state machine dışı)
      this.props.status = OrderStatus.DELIVERED;
      this._updatedAt = new Date();
    }
  }

  public complete(): void {
    this.transitionTo(OrderStatus.COMPLETED);
  }

  public cancel(): void {
    if (this.props.status === OrderStatus.COMPLETED || this.props.status === OrderStatus.DISPUTED) {
      throw new DomainException('Completed or disputed orders cannot be cancelled');
    }
    this.transitionTo(OrderStatus.CANCELLED);
  }

  get orderNumber(): string { return this.props.orderNumber.value; }
  get status(): OrderStatus { return this.props.status; }
  get deliveryType(): DeliveryType { return this.props.deliveryType; }
  get vendorId(): string { return this.props.vendorId; }
  get userId(): string { return this.props.userId; }
  get items(): OrderItem[] { return this.props.items ?? []; }
  get escrowHoldId(): string | undefined { return this.props.escrowHoldId; }
}
