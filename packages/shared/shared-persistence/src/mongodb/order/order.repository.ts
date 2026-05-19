// packages/shared/shared-persistence/src/mongodb/order/order.repository.ts
// Order repository — MongoDB transaction ile checkout işlemi
// ADR-005 §3b — checkout.service.ts kritik dönüşüm örneği

import { Injectable, ConflictException } from '@nestjs/common';
import { Model, Connection } from 'mongoose';
import { Order, IOrder, OrderStatus, OrderStatusType } from '../../schemas/backend/order.schema';
import { OrderItemSchema } from '../../schemas/backend/order-item.schema';
import { MAX_ITEMS_PER_ORDER } from '../../schemas/backend/order.schema';
import { withTransactionSimple } from '../mongo-unit-of-work';
import { Types } from 'mongoose';

export interface CreateOrderInput {
  userId: string;
  vendorId: string;
  items: Array<{
    listingId: string;
    quantity: number;
    price: Types.Decimal128;
    totalAmount: Types.Decimal128;
    productName: string;
    productImages: string[];
    variantInfo?: Record<string, unknown>;
  }>;
  totalAmount: Types.Decimal128;
  subtotal: Types.Decimal128;
  taxAmount: Types.Decimal128;
  shippingFee: Types.Decimal128;
  discountAmount: Types.Decimal128;
  paymentMethod: string;
  currency?: string;
  shippingAddress: Record<string, unknown>;
  idempotencyKey?: string;
  expiresAt?: Date;
}

@Injectable()
export class OrderRepository {
  constructor(private readonly connection: Connection) {}

  private get model(): Model<IOrder> {
    return Order;
  }

  private get orderItemModel() {
    return OrderItemSchema;
  }

  /**
   * Checkout transaction — atomic stok düşümü + sipariş oluşturma
   * ADR-005 §3b: Transaction ZORUNLU (Listing + Order farklı collection)
   *
   * Akış:
   * 1. Listing.availableQuantity kontrolü + atomic düşüm
   * 2. Order oluşturma (OrderItem embed)
   * 3. Transaction commit veya rollback
   */
  async createOrderWithTransaction(input: CreateOrderInput): Promise<IOrder> {
    const session = await this.connection.startSession();
    try {
      return await session.withTransaction(async () => {
        // 1. Stok kontrolü + atomic düşüm (tek listing için)
        // NOT: Çoklu listing için her biri ayrı updateOne gerekir
        for (const item of input.items) {
          const listingModel = this.connection.models['Listing'];
          if (!listingModel) throw new Error('Listing model not found');

          const res = await listingModel.updateOne(
            {
              _id: item.listingId,
              availableQuantity: { $gte: item.quantity },
              status: 'ACTIVE',
            },
            {
              $inc: {
                availableQuantity: -item.quantity,
                reservedQuantity: item.quantity,
              },
            },
            { session }
          );

          if (res.modifiedCount === 0) {
            throw new ConflictException(
              `Stok yetersiz veya listing aktif değil: ${item.listingId}`
            );
          }
        }

        // 2. Order oluştur — OrderItem embed
        const orderDoc = {
          _id: new Types.ObjectId().toString(),
          userId: input.userId,
          vendorId: input.vendorId,
          status: 'PENDING',
          totalAmount: input.totalAmount,
          shippingAddress: input.shippingAddress,
          paymentMethod: input.paymentMethod,
          paymentStatus: 'PENDING',
          currency: input.currency ?? 'TRY',
          subtotal: input.subtotal,
          taxAmount: input.taxAmount,
          shippingFee: input.shippingFee,
          discountAmount: input.discountAmount,
          paidWithXP: Types.Decimal128.fromString('0'),
          paidWithCash: Types.Decimal128.fromString('0'),
          escrowStatus: 'NONE',
          deliveryType: 'CARGO',
          items: input.items.map(item => ({
            listingId: item.listingId,
            quantity: item.quantity,
            price: item.price,
            totalAmount: item.totalAmount,
            productName: item.productName,
            productImages: item.productImages,
            variantInfo: item.variantInfo,
          })),
          statusHistory: [{
            status: 'PENDING',
            changedAt: new Date(),
          }],
          expiresAt: input.expiresAt,
          idempotencyKey: input.idempotencyKey,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const created = new this.model(orderDoc);
        await created.save({ session });
        return created;
      });
    } finally {
      await session.endSession();
    }
  }

  /**
   * MAX_ITEMS_PER_ORDER guard — 16MB embed limit koruması
   */
  validateItemCount(items: Array<unknown>): void {
    if (items.length >= MAX_ITEMS_PER_ORDER) {
      throw new ConflictException(
        `Siparişte maksimum ${MAX_ITEMS_PER_ORDER} kalem olabilir. Mevcut: ${items.length}`
      );
    }
  }

  // Query methods
  async findByUser(userId: string, limit = 50): Promise<IOrder[]> {
    return this.model
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByVendor(vendorId: string, limit = 50): Promise<IOrder[]> {
    return this.model
      .find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findByStatus(status: OrderStatusType, limit = 100): Promise<IOrder[]> {
    return this.model
      .find({ status })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  async findById(id: string): Promise<IOrder | null> {
    return this.model.findById(id).exec();
  }

  async findByIdempotencyKey(key: string): Promise<IOrder | null> {
    return this.model.findOne({ idempotencyKey: key }).exec();
  }

  async updateStatus(orderId: string, status: OrderStatusType): Promise<IOrder | null> {
    return this.model.findByIdAndUpdate(
      orderId,
      {
        $set: { status, updatedAt: new Date() },
        $push: {
          statusHistory: {
            status,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();
  }

  async cancelOrder(orderId: string, reason: string): Promise<IOrder | null> {
    return this.model.findByIdAndUpdate(
      orderId,
      {
        $set: {
          status: 'CANCELLED',
          cancelReason: reason,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
        $push: {
          statusHistory: {
            status: 'CANCELLED',
            reason,
            changedAt: new Date(),
          },
        },
      },
      { new: true }
    ).exec();
  }
}