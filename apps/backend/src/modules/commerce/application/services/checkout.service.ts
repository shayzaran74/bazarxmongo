// apps/backend/src/modules/commerce/application/services/checkout.service.ts
// CheckoutService — Mongoose migration (ADR-005 Faz 2b)
// NOT: Phase 3 transaction pattern (session.withTransaction) BURADA KULLANILMADI.
//      Atomik checkout için ayrı bir checkout handler'da session kullanılabilir.

import { Injectable, Logger, Inject } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { DomainException } from '@barterborsa/shared-core';
import { RabbitMQService } from '@barterborsa/shared-messaging';
import { ICartRepository } from '../../domain/repositories/cart.repository.interface';
import { IListingRepository } from '../../../catalog/domain/repositories/listing.repository.interface';
import { FinancialGatewayService } from '../../../financial-gateway/financial-gateway.service';
import { PricingService } from './pricing.service';
import { OrderNumber } from '../../domain/value-objects/order-number.vo';
import { ShippingAddress } from '../../domain/value-objects/shipping-address.vo';
import { Order } from '../../domain/entities/order.entity';
import { OrderItem } from '../../domain/entities/order-item.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';
import { DeliveryType } from '../../domain/enums/delivery-type.enum';
import { ORDER_PAYMENT_EXPIRY_MS } from '@barterborsa/shared-core';
import { GenerateInvoiceCommand } from '../commands/generate-invoice.command';
import { MongoVendorRepository } from '../../../vendor/infrastructure/persistence/mongo-vendor.repository';
import { MongoOrderRepository } from '../../infrastructure/persistence/mongo-order.repository';
import * as mongoose from 'mongoose';

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IListingRepository') private readonly listingRepository: IListingRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly pricingService: PricingService,
    private readonly orderRepo: MongoOrderRepository,
    private readonly vendorRepo: MongoVendorRepository,
    private readonly rabbitMQ: RabbitMQService,
    private readonly commandBus: CommandBus,
  ) {}

  async checkout(
    userId: string,
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress,
    paymentMethod: string,
    couponCode?: string,
    useWallet: boolean = false,
    clientMutationId?: string,
  ): Promise<Order[]> {
    // Idempotency kontrolü
    if (clientMutationId) {
      const existingOrders = await this.orderRepo.findByIdempotencyKey(userId, clientMutationId);
      if (existingOrders.length > 0) {
        this.logger.log('Idempotent checkout isteği, mevcut siparişler döndürülüyor', { userId, clientMutationId });
        return existingOrders;
      }
    }

    // 1. Sepet doğrulama
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new DomainException('Sepet boş');
    }

    // 2. İlanları getir
    const itemsWithListings = await Promise.all(
      cart.items.map(async (item) => {
        const listing = await this.listingRepository.findById(item.getProps().listingId);
        if (!listing) throw new DomainException(`İlan bulunamadı: ${item.getProps().listingId}`);
        return { item, listing };
      })
    );

    // 3. Vendor grupları
    const vendorGroups = new Map<string, typeof itemsWithListings>();
    for (const entry of itemsWithListings) {
      const vendorId = entry.listing.getProps().vendorId;
      if (!vendorGroups.has(vendorId)) vendorGroups.set(vendorId, []);
      vendorGroups.get(vendorId)!.push(entry);
    }

    // Vendor tiplerini al
    const vendorTypeMap = new Map<string, string>();
    for (const vendorId of vendorGroups.keys()) {
      const vendor = await this.vendorRepo.findById(vendorId);
      if (vendor) {
        vendorTypeMap.set(vendorId, vendor.getProps().vendorType);
      }
    }

    const isWalletPayment = paymentMethod.toLowerCase() === 'wallet' || useWallet;
    const createdOrders: Order[] = [];

    // orderExpiresAt: cüzdan dışı ödemeler için 30 dakika
    const orderExpiresAt = isWalletPayment
      ? undefined
      : new Date(Date.now() + ORDER_PAYMENT_EXPIRY_MS);

    // FAZE 1: Stok rezervasyonu + sipariş oluşturma (sıralı, non-transactional)
    for (const [vendorId, group] of vendorGroups) {
      // Atomik stok rezervasyonu
      for (const g of group) {
        const quantity = g.item.getProps().quantity;
        const listingId = g.item.getProps().listingId;
        const reserved = await this.listingRepository.reserveStock(listingId, quantity);
        if (!reserved) {
          throw new DomainException(`Yetersiz stok: ${g.listing.getProps().title}`);
        }
      }

      // Fiyat hesaplama
      const pricingItems = group.map((g) => ({
        price: g.listing.getProps().price.amount,
        quantity: g.item.getProps().quantity,
      }));
      const totals = this.pricingService.calculateOrderTotal(pricingItems);

      // OrderItem oluştur
      const orderItems = await Promise.all(group.map(async (g) => {
        const lProps = g.listing.getProps();
        const catProductId = g.listing.catalogProductId;
        let images: string[] = [];
        try {
          const db = (mongoose.connection as any).db;
          if (db) {
            const mediaDocs = await db.collection('product_media').find({ productId: catProductId }).toArray();
            if (mediaDocs && mediaDocs.length > 0) {
              images = mediaDocs.map((m: any) => m.url).filter(Boolean);
            }
          }
        } catch (e) {
          // ignore
        }

        return OrderItem.create(
          g.item.getProps().listingId,
          g.item.getProps().quantity,
          lProps.price.amount,
          lProps.title,
          images,
          g.item.getProps().variantId,
        );
      }));

      // Teslim türü — RESTAURANT için LOCAL_COURIER
      const deliveryType = vendorTypeMap.get(vendorId) === 'RESTAURANT'
        ? DeliveryType.LOCAL_COURIER
        : DeliveryType.CARGO;

      // Order domain entity oluştur
      const order = Order.create(
        userId,
        vendorId,
        OrderNumber.generate(),
        orderItems,
        shippingAddress,
        billingAddress,
        isWalletPayment ? 'WALLET' : paymentMethod,
        totals,
        couponCode,
        orderExpiresAt,
        deliveryType,
      );

      // Order'ı kaydet (items embed olarak)
      await this.orderRepo.create(order, clientMutationId);

      createdOrders.push(order);
    }

    // FAZE 2: Sepeti temizle
    await this.cartRepository.clearItems(userId);

    // FAZE 3: Cüzdan ödemesi — Transaction DIŞINDA
    if (isWalletPayment) {
      const heldFunds: string[] = [];

      try {
        for (const order of createdOrders) {
          const idempotencyKey = `checkout-${userId}-${order.getProps().orderNumber.value}`;
          const holdResult = await this.financialGateway.holdFunds(
            userId,
            order.getProps().totalAmount.toString(),
            'ORDER_CHECKOUT',
            order.id,
            'ORDER',
            idempotencyKey,
            order.getProps().vendorId,
          );

          if (!holdResult?.holdId) {
            throw new DomainException(holdResult?.error || 'Cüzdan ile ödeme başarısız.');
          }

          heldFunds.push(holdResult.holdId);
          await this.orderRepo.updatePaid(order.id, holdResult.holdId);
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error(`Cüzdan ödemesi başarısız, telafi başlatılıyor`, { userId, error: errorMessage });

        // Fonları iade et
        for (const holdId of heldFunds) {
          try {
            await this.financialGateway.refundFunds(holdId, `refund-${holdId}-${Date.now()}`);
          } catch (refundError: unknown) {
            const msg = refundError instanceof Error ? refundError.message : 'Bilinmeyen hata';
            this.logger.error(`Hold iadesi başarısız`, { holdId, error: msg });
          }
        }

        // Stokları geri al ve siparişleri iptal et
        for (const order of createdOrders) {
          const items = order.getProps().items ?? [];
          for (const item of items) {
            await this.listingRepository.releaseStock(
              item.getProps().listingId,
              item.getProps().quantity,
            ).catch(() => undefined);
          }
          await this.orderRepo.updateStatus(order.id, 'CANCELLED').catch(() => undefined);
        }

        throw error;
      }
    }

    // FAZE 4: Outbox event publish (RabbitMQ)
    for (const order of createdOrders) {
      try {
        await this.rabbitMQ.publish('commerce.events', 'order.created', {
          orderId: order.id,
          id: order.id,
          orderNumber: order.getProps().orderNumber.value,
          userId,
          buyerId: userId,
          sellerId: order.getProps().vendorId,
          vendorId: order.getProps().vendorId,
          totalAmount: order.getProps().totalAmount.toString(),
          shippingAddress: order.getProps().shippingAddress.toJson(),
          billingAddress: order.getProps().billingAddress.toJson(),
          items: order.getProps().items?.map((item) => ({
            listingId: item.getProps().listingId,
            quantity: item.getProps().quantity,
            price: item.getProps().price.toString(),
          })),
          createdAt: new Date(),
        });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
        this.logger.warn(`Order event publish başarısız: ${order.id}`, { error: msg });
      }

      // Fatura oluştur
      try {
        await this.commandBus.execute(new GenerateInvoiceCommand(order.id, true));
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : 'Bilinmeyen hata';
        this.logger.warn(`Otomatik fatura oluşturma başarısız: ${order.id}`, { error: msg });
      }
    }

    return createdOrders;
  }
}