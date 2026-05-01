// apps/backend/src/modules/commerce/application/services/checkout.service.ts

import { Injectable, Inject, Logger } from '@nestjs/common';
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
import { PrismaService } from '@barterborsa/shared-persistence';
import { Decimal } from 'decimal.js';
import { Prisma, OrderStatus as PrismaOrderStatus, PaymentMethod as PrismaPaymentMethod, PaymentStatus as PrismaPaymentStatus } from '@prisma/client';
import { GenerateInvoiceCommand } from '../commands/generate-invoice.command';

// Prisma'nın orderItems ilişkisiyle ürettiği Order tipi
type PrismaOrderWithItems = Prisma.OrderGetPayload<{ include: { orderItems: true } }>;

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    @Inject('ICartRepository') private readonly cartRepository: ICartRepository,
    @Inject('IListingRepository') private readonly listingRepository: IListingRepository,
    private readonly financialGateway: FinancialGatewayService,
    private readonly pricingService: PricingService,
    private readonly prisma: PrismaService,
    private readonly rabbitMQ: RabbitMQService,
    private readonly commandBus: CommandBus,
  ) {}

  // Prisma kaydını domain entity'sine dönüştürür (idempotency yanıtı için)
  private mapToOrderDomain(record: PrismaOrderWithItems): Order {
    const items = record.orderItems.map((oi) =>
      OrderItem.fromPersistence(
        {
          orderId: record.id,
          listingId: oi.listingId,
          quantity: oi.quantity,
          price: oi.price,
          totalAmount: oi.totalAmount,
          productName: oi.productName,
          productImages: oi.productImages ?? [],
          variantInfo: undefined,
        },
        oi.id,
      ),
    );

    return Order.fromPersistence(
      {
        userId: record.userId,
        vendorId: record.vendorId,
        status: record.status as OrderStatus,
        orderNumber: OrderNumber.fromValue(record.orderNumber ?? ''),
        shippingAddress: ShippingAddress.fromJson(record.shippingAddress as Record<string, string>),
        billingAddress: record.billingAddress
          ? ShippingAddress.fromJson(record.billingAddress as Record<string, string>)
          : ShippingAddress.fromJson(record.shippingAddress as Record<string, string>),
        totalAmount: record.totalAmount,
        paymentMethod: record.paymentMethod,
        paymentStatus: record.paymentStatus,
        vendorStatus: 'PENDING',
        buyerStatus: 'PENDING',
        currency: record.currency ?? 'TRY',
        discountAmount: record.discountAmount,
        shippingCost: record.shippingCost,
        paidWithXP: record.paidWithXP,
        paidWithCash: record.paidWithCash,
        paidAt: record.paidAt ?? undefined,
        expiresAt: record.expiresAt ?? undefined,
        items,
      },
      record.id,
    );
  }

  async checkout(
    userId: string,
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress,
    paymentMethod: string,
    couponCode?: string,
    useWallet: boolean = false,
    clientMutationId?: string,
  ): Promise<Order[]> {
    // Idempotency kontrolü — aynı clientMutationId ile gelen retry isteği mevcut siparişleri döndürür
    if (clientMutationId) {
      const existingOrders = await this.prisma.order.findMany({
        where: { userId, idempotencyKey: clientMutationId },
        include: { orderItems: true },
      });
      if (existingOrders.length > 0) {
        this.logger.log('Idempotent checkout isteği, mevcut siparişler döndürülüyor', {
          userId,
          clientMutationId,
          orderCount: existingOrders.length,
        });
        return existingOrders.map((r) => this.mapToOrderDomain(r));
      }
    }

    // 1. Sepet doğrulama
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart || cart.items.length === 0) {
      throw new DomainException('Sepet boş');
    }

    // 2. İlanları getir - yalnızca fiyat ve başlık için (stok kontrolü atomik yapılacak)
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
      const vendorId = entry.listing!.getProps().vendorId;
      if (!vendorGroups.has(vendorId)) vendorGroups.set(vendorId, []);
      vendorGroups.get(vendorId)!.push(entry);
    }

    const isWalletPayment = paymentMethod.toLowerCase() === 'wallet' || useWallet;
    const createdOrders: Order[] = [];

    // Cüzdan dışı ödemeler için 30 dakika ödeme süresi tanı; süre geçince stok serbest bırakılır
    const orderExpiresAt = isWalletPayment
      ? undefined
      : new Date(Date.now() + 30 * 60 * 1000);

    // FAZE 1: Atomik DB işlemi - stok rezervasyon + sipariş oluşturma + sepet temizleme
    // holdFunds BURADA DEĞİL - bağlantı havuzunu tıkamaması için transaction dışında yapılacak
    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      for (const [vendorId, group] of vendorGroups) {
        // Atomik stok rezervasyonu - race condition'a karşı korumalı
        // updateMany koşullu güncelleme yaparak tek SQL'de check+update sağlar
        for (const g of group) {
          const quantity = g.item.getProps().quantity;
          const listingId = g.item.getProps().listingId;
          const reserveResult = await tx.listing.updateMany({
            where: {
              id: listingId,
              availableQuantity: { gte: quantity },
              status: 'ACTIVE',
            },
            data: {
              availableQuantity: { decrement: quantity },
              reservedQuantity: { increment: quantity },
            },
          });
          if (reserveResult.count === 0) {
            // Güncel stok bilgisini kullanıcıya göster
            throw new DomainException(`Yetersiz stok: ${g.listing!.getProps().title}`);
          }

          // Group Buy (Birlikte Al) kampanyası varsa ilerlemeyi (katılım adedini) artır
          const prismaListing = await tx.listing.findUnique({ where: { id: listingId } });
          if (prismaListing && prismaListing.catalogProductId) {
            const groupBuyUpdateQuery: any = {
              where: {
                status: 'ACTIVE',
                productId: prismaListing.catalogProductId
              },
              data: {
                currentQuantity: { increment: quantity }
              }
            };
            await tx.groupBuy.updateMany(groupBuyUpdateQuery);
          }
        }

        // Fiyatı DB'den çekilen listing'den hesapla (frontend manipülasyonuna karşı)
        const pricingItems = group.map((g) => ({
          price: g.listing!.getProps().price.amount,
          quantity: g.item.getProps().quantity,
        }));
        const totals = this.pricingService.calculateOrderTotal(pricingItems);

        const orderItems = group.map((g) => {
          const lProps = g.listing!.getProps();
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
          isWalletPayment ? 'WALLET' : paymentMethod,
          totals,
          couponCode,
          orderExpiresAt,
        );

        await tx.order.create({
          data: {
            id: order.id,
            userId: order.getProps().userId,
            vendorId: order.getProps().vendorId,
            status: order.getProps().status as unknown as PrismaOrderStatus,
            orderNumber: order.getProps().orderNumber.value,
            totalAmount: new Decimal(order.getProps().totalAmount),
            shippingAddress: order.getProps().shippingAddress.toJson(),
            billingAddress: order.getProps().billingAddress.toJson(),
            paymentMethod: (isWalletPayment ? 'WALLET' : order.getProps().paymentMethod) as PrismaPaymentMethod,
            paymentStatus: order.getProps().paymentStatus as unknown as PrismaPaymentStatus,
            paidAt: null,
            currency: order.getProps().currency,
            discountAmount: new Decimal(order.getProps().discountAmount),
            shippingFee: new Decimal(order.getProps().shippingCost),
            paidWithXP: new Decimal(order.getProps().paidWithXP),
            paidWithCash: new Decimal(order.getProps().paidWithCash),
            expiresAt: order.getProps().expiresAt ?? null,
            idempotencyKey: clientMutationId ?? null,
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

    // FAZE 2: Cüzdan ödemesi - Transaction DIŞINDA
    // Dış servis çağrıları Prisma transaction bağlamı içinde yapılmamalı;
    // aksi hâlde dış servis beklerken DB bağlantısı bloke olur.
    if (isWalletPayment) {
      const heldFunds: string[] = [];

      try {
        for (const order of createdOrders) {
          const idempotencyKey = `checkout-${userId}-${order.orderNumber}`;
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

          // Siparişi ödendi olarak işaretle
          await this.prisma.order.update({
            where: { id: order.id },
            data: {
              status: PrismaOrderStatus.PAID,
              paymentStatus: PrismaPaymentStatus.COMPLETED,
              paidAt: new Date(),
            },
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        this.logger.error(`Cüzdan ödemesi başarısız, telafi başlatılıyor`, {
          userId,
          heldFundsCount: heldFunds.length,
          error: errorMessage,
        });

        // Tutulan fonları iade et
        for (const holdId of heldFunds) {
          try {
            await this.financialGateway.refundFunds(holdId, `refund-${holdId}-${Date.now()}`);
          } catch (refundError: unknown) {
            const msg = refundError instanceof Error ? refundError.message : 'Bilinmeyen hata';
            this.logger.error(`Hold iadesi başarısız, manuel müdahale gerekebilir`, { holdId, error: msg });
          }
        }

        // Rezerve edilen stokları serbest bırak ve siparişleri iptal et
        for (const order of createdOrders) {
          const items = order.getProps().items ?? [];
          for (const item of items) {
            await this.prisma.listing
              .update({
                where: { id: item.getProps().listingId },
                data: {
                  availableQuantity: { increment: item.getProps().quantity },
                  reservedQuantity: { decrement: item.getProps().quantity },
                },
              })
              .catch((releaseError: unknown) => {
                const msg = releaseError instanceof Error ? releaseError.message : 'Bilinmeyen hata';
                this.logger.error(`Stok serbest bırakma başarısız`, { listingId: item.getProps().listingId, error: msg });
              });

            // Rolllback GroupBuy (Birlikte Al) quantity
            this.prisma.listing.findUnique({ where: { id: item.getProps().listingId } })
              .then(prismaListing => {
                if (prismaListing && prismaListing.catalogProductId) {
                  const groupBuyRollbackQuery: any = {
                    where: { status: 'ACTIVE', productId: prismaListing.catalogProductId },
                    data: { currentQuantity: { decrement: item.getProps().quantity } }
                  };
                  return this.prisma.groupBuy.updateMany(groupBuyRollbackQuery);
                }
              })
              .catch((err) => {
                 this.logger.error(`GroupBuy rollback başarısız`, { error: err.message });
              });
          }

          await this.prisma.order
            .update({ where: { id: order.id }, data: { status: PrismaOrderStatus.CANCELLED } })
            .catch(() => undefined);
        }

        throw error;
      }
    }

    // FAZE 3: Event yayını ve fatura oluşturma (transaction sonrası)
    for (const order of createdOrders) {
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
