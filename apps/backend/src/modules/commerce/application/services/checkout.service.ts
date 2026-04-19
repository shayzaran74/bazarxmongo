// apps/backend/src/modules/commerce/application/services/checkout.service.ts

import { Injectable, Inject } from '@nestjs/common';
import { DomainException } from '@barterborsa/shared-core';
import { RabbitMQService } from '@barterborsa/shared-messaging';
import { ICartRepository } from '../../domain/repositories/cart.repository.interface';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { PricingService } from './pricing.service';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { PrismaService } from '@barterborsa/shared-persistence';

@Injectable()
export class CheckoutService {
  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IOrderRepository') private readonly orderRepository: IOrderRepository,
    @Inject('IListingRepository') private readonly listingRepository: IListingRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
  ) {}

  async checkout(userId: string, shippingAddress: ShippingAddress, billingAddress: ShippingAddress, paymentMethod: string) {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new DomainException('Cart is empty');
    }

    const itemsWithListings = await Promise.all(
      cart.items.map(async (item) => {
        const listing = await this.listingRepository.findById(item.getProps().listingId);
        if (!listing) throw new DomainException(`Listing ${item.getProps().listingId} not found`);
        return { item, listing };
      })
    );

    const vendorGroups = new Map<string, typeof itemsWithListings>();
    for (const entry of itemsWithListings) {
      const vendorId = entry.listing.getProps().vendorId;
      if (!vendorGroups.has(vendorId)) vendorGroups.set(vendorId, []);
      vendorGroups.get(vendorId)!.push(entry);
    }

    const createdOrders: Order[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const [vendorId, group] of vendorGroups) {
        const pricingItems = group.map((g) => ({
          price: g.listing.getProps().price.amount, // Fix: use .amount
          quantity: g.item.getProps().quantity,
        }));
        const totals = this.pricingService.calculateOrderTotal(pricingItems);

        const orderItems = group.map((g) => {
          const lProps = g.listing.getProps();
          return OrderItem.create(
            g.item.getProps().listingId,
            g.item.getProps().quantity,
            lProps.price.amount, // Fix: use .amount
            lProps.title,
            [],
            g.item.getProps().variantId
          );
        });

        const order = Order.create(
          userId,
          vendorId,
          OrderNumber.generate(),
          orderItems,
          shippingAddress,
          billingAddress,
          paymentMethod,
          totals
        );

        for (const g of group) {
           const success = g.listing.reserveStock(g.item.getProps().quantity);
           if (!success) throw new DomainException(`Insufficient stock for ${g.listing.getProps().title}`);
        }

        const idempotencyKey = `checkout-${userId}-${order.orderNumber}`;
        await this.financialGateway.holdFunds(
          userId,
          totals.total.toString(),
          'ORDER_CHECKOUT',
          order.id,
          'ORDER',
          idempotencyKey
        );

        const orderData: any = {
           id: order.id,
           userId: order.getProps().userId,
           vendorId: order.getProps().vendorId,
           status: order.getProps().status,
           orderNumber: order.getProps().orderNumber.value,
           totalAmount: order.getProps().totalAmount,
           shippingAddress: order.getProps().shippingAddress.toJson(),
           billingAddress: order.getProps().billingAddress.toJson(),
           paymentMethod: order.getProps().paymentMethod,
           paymentStatus: order.getProps().paymentStatus,
           currency: order.getProps().currency,
           discountAmount: order.getProps().discountAmount,
           shippingCost: order.getProps().shippingCost,
           paidWithXP: order.getProps().paidWithXP,
           paidWithCash: order.getProps().paidWithCash,
        };

        await (tx as any).order.create({
          data: {
            ...orderData,
            orderItems: {
              create: orderItems.map((oi) => ({
                id: oi.id,
                listingId: oi.getProps().listingId,
                quantity: oi.getProps().quantity,
                price: oi.getProps().price,
                totalAmount: oi.getProps().totalAmount,
                productName: oi.getProps().productName,
                productImages: oi.getProps().productImages,
              })),
            },
          },
        });

        createdOrders.push(order);
      }
      await (tx as any).cartItem.deleteMany({ where: { cart: { userId } } });
    });
    
    // Publish Events
    for (const order of createdOrders) {
      await this.rabbitMQ.publish('commerce.events', 'order.created', {
        orderId: order.id,
        id: order.id,
        orderNumber: order.getProps().orderNumber.value,
        userId: userId,
        buyerId: userId,
        sellerId: order.getProps().vendorId,
        vendorId: order.getProps().vendorId,
        totalAmount: order.getProps().totalAmount.toString(),
        shippingAddress: order.getProps().shippingAddress.toJson(),
        billingAddress: order.getProps().billingAddress.toJson(),
        items: order.getProps().items?.map(item => ({
          listingId: item.getProps().listingId,
          quantity: item.getProps().quantity,
          price: item.getProps().price.toString(),
        })),
        createdAt: new Date(),
      });
    }

    return createdOrders;
  }
}
