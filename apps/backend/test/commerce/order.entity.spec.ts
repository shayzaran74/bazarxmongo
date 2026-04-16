// apps/backend/test/commerce/order.entity.spec.ts

import { Order } from '../../src/modules/commerce/domain/entities/order.entity';
import { OrderStatus } from '../../src/modules/commerce/domain/enums/order-status.enum';
import { OrderNumber } from '../../src/modules/commerce/domain/value-objects/order-number.vo';
import { ShippingAddress } from '../../src/modules/commerce/domain/value-objects/shipping-address.vo';
import { OrderTotal } from '../../src/modules/commerce/domain/value-objects/order-total.vo';
import { OrderItem } from '../../src/modules/commerce/domain/entities/order-item.entity';
import { Prisma } from '@prisma/client';

describe('Order Entity', () => {
  const mockAddress = ShippingAddress.create({
    firstName: 'John',
    lastName: 'Doe',
    phone: '5551234567',
    addressLine1: 'Test St 1',
    city: 'Istanbul',
    district: 'Kadikoy',
    postalCode: '34000',
  });

  const mockTotal = OrderTotal.calculate(new Prisma.Decimal(100));
  const mockItems = [
    OrderItem.create('listing-1', 1, new Prisma.Decimal(100), 'Test Product', []),
  ];

  it('should create a new order in PENDING status', () => {
    const order = Order.create(
      'user-1',
      'vendor-1',
      OrderNumber.generate(),
      mockItems,
      mockAddress,
      mockAddress,
      'WALLET',
      mockTotal
    );

    expect(order.status).toBe(OrderStatus.PENDING);
    expect(order.getProps().totalAmount.toNumber()).toBe(100);
  });

  it('should transition from PENDING to PAID', () => {
    const order = Order.create(
      'user-1',
      'vendor-1',
      OrderNumber.generate(),
      mockItems,
      mockAddress,
      mockAddress,
      'WALLET',
      mockTotal
    );

    order.pay();
    expect(order.status).toBe(OrderStatus.PAID);
    expect(order.getProps().paymentStatus).toBe('COMPLETED');
    expect(order.getProps().paidAt).toBeInstanceOf(Date);
  });

  it('should transition from PAID to CONFIRMED', () => {
    const order = Order.create(
      'user-1',
      'vendor-1',
      OrderNumber.generate(),
      mockItems,
      mockAddress,
      mockAddress,
      'WALLET',
      mockTotal
    );

    order.pay();
    order.confirm();
    expect(order.status).toBe(OrderStatus.CONFIRMED);
    expect(order.getProps().vendorStatus).toBe('CONFIRMED');
  });

  it('should throw error when confirming a PENDING order', () => {
    const order = Order.create(
      'user-1',
      'vendor-1',
      OrderNumber.generate(),
      mockItems,
      mockAddress,
      mockAddress,
      'WALLET',
      mockTotal
    );

    expect(() => order.confirm()).toThrow('Only PAID orders can be confirmed');
  });

  it('should transition to SHIPPED and set tracking info', () => {
    const order = Order.create(
      'user-1',
      'vendor-1',
      OrderNumber.generate(),
      mockItems,
      mockAddress,
      mockAddress,
      'WALLET',
      mockTotal
    );

    order.pay();
    order.confirm();
    order.ship('TRK123', 'Aras Kargo');

    expect(order.status).toBe(OrderStatus.SHIPPED);
    expect(order.getProps().trackingNumber).toBe('TRK123');
    expect(order.getProps().shippingCarrier).toBe('Aras Kargo');
  });
});
