// apps/backend/src/modules/commerce/application/services/checkout.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
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
import { Decimal } from 'decimal.js';
import { Prisma } from '@prisma/client';
import { GenerateInvoiceCommand } from '../commands/generate-invoice.command';

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
    private readonly commandBus: CommandBus,
  ) {}

  private readonly logger = new Logger(CheckoutService.name);

  async checkout(userId: string, shippingAddress: ShippingAddress, billingAddress: ShippingAddress, paymentMethod: string, couponCode?: string, useWallet: boolean = false) {
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

    const heldFunds: string[] = [];
    try {
      await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        for (const [vendorId, group] of vendorGroups) {
          const pricingItems = group.map((g) => ({
            price: g.listing.getProps().price.amount,
            quantity: g.item.getProps().quantity,
          }));
          const totals = this.pricingService.calculateOrderTotal(pricingItems);

          const orderItems = group.map((g) => {
            const lProps = g.listing.getProps();
            return OrderItem.create(
              g.item.getProps().listingId,
              g.item.getProps().quantity,
              lProps.price.amount,
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
             // Persist stock change within transaction
             await tx.listing.update({
               where: { id: g.item.getProps().listingId },
               data: {
                 stock: g.listing.getProps().stock,
                 availableQuantity: g.listing.getProps().availableQuantity,
               },
             });
          }

          const idempotencyKey = `checkout-${userId}-${order.orderNumber}`;
          
          const isWalletPayment = paymentMethod.toLowerCase() === 'wallet' || useWallet;
          
          // ONLY hold funds if paymentMethod is wallet OR useWallet is true
          if (isWalletPayment) {
            const holdResult = await this.financialGateway.holdFunds(
              userId,
              totals.total.toString(),
              'ORDER_CHECKOUT',
              order.id,
              'ORDER',
              idempotencyKey,
              vendorId
            );
            if (holdResult?.holdId) {
              heldFunds.push(holdResult.holdId);
              order.pay(); // Update internal state to PAID and COMPLETED
            } else {
              throw new DomainException(holdResult?.error || 'Cüzdan ile ödeme başarısız.');
            }
          }

          await tx.order.create({
            data: {
              id: order.id,
              userId: order.getProps().userId,
              vendorId: order.getProps().vendorId,
              status: (isWalletPayment ? 'PAID' : order.getProps().status) as any,
              orderNumber: order.getProps().orderNumber.value,
              totalAmount: new Decimal(order.getProps().totalAmount),
              shippingAddress: order.getProps().shippingAddress.toJson(),
              billingAddress: order.getProps().billingAddress.toJson(),
              paymentMethod: (isWalletPayment ? 'WALLET' : order.getProps().paymentMethod) as any,
              paymentStatus: isWalletPayment ? 'COMPLETED' : order.getProps().paymentStatus as any,
              paidAt: isWalletPayment ? new Date() : order.getProps().paidAt,
              currency: order.getProps().currency,
              discountAmount: new Decimal(order.getProps().discountAmount),
              shippingFee: new Decimal(order.getProps().shippingCost),
              paidWithXP: new Decimal(order.getProps().paidWithXP),
              paidWithCash: new Decimal(order.getProps().paidWithCash),
              orderItems: {
                create: orderItems.map((oi) => ({
                  id: oi.id,
                  listingId: oi.getProps().listingId,
                  quantity: oi.getProps().quantity,
                  price: new Decimal(oi.getProps().price),
                  totalAmount: new Decimal(oi.getProps().totalAmount),
                  productName: oi.getProps().productName,
                  productImages: oi.getProps().productImages,
                })),
              },
            },
          });

          createdOrders.push(order);
        }
        await tx.cartItem.deleteMany({ where: { cart: { userId } } });
      });
    } catch (error: any) {
      this.logger.error(`Checkout failed, attempting to refund ${heldFunds.length} holds. Error: ${error.message}`);
      // Refund already held funds
      for (const holdId of heldFunds) {
        try {
          await this.financialGateway.refundFunds(holdId, `refund-${holdId}-${Date.now()}`);
        } catch (refundError: any) {
          this.logger.error(`Failed to refund hold ${holdId}: ${refundError.message}`);
        }
      }
      throw error;
    }
    
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

      // --- NEW: Generate Invoices ---
      try {
        await this.commandBus.execute(
          new GenerateInvoiceCommand(order.id, true)
        );
      } catch (e: any) {
        this.logger.warn(`Failed to auto-generate invoice for order ${order.id}: ${e.message}`);
      }
    }

    return createdOrders;
  }
}
