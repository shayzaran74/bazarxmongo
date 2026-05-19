// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-order.repository.ts
// Order repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { BaseMongoRepository } from '@barterborsa/shared-persistence/mongodb/base-mongo.repository';
import { Order as OrderModel, IOrder } from '@barterborsa/shared-persistence/schemas/backend/order.schema';
import { OrderMapper, OrderDocument } from './mappers/order.mapper';
import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { Order } from '../../domain/entities/order.entity';
import { OrderStatus } from '../../domain/enums/order-status.enum';

@Injectable()
export class MongoOrderRepository implements IOrderRepository {
  private readonly model: Model<OrderDocument>;

  constructor() {
    this.model = OrderModel;
  }

  private toDomain(doc: OrderDocument): Order {
    return OrderMapper.toDomain(doc);
  }

  async findById(id: string): Promise<Order | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const doc = await this.model.findOne({ orderNumber }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByUserId(
    userId: string,
    pagination: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const { page = 1, limit = 20, status } = pagination;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { userId };
    if (status) filter.status = status;

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit, sort: { createdAt: -1 } }),
      this.model.countDocuments(filter),
    ]);

    return { items: docs.map(doc => this.toDomain(doc)), total };
  }

  async findByVendorId(
    vendorId: string,
    pagination: { page?: number; limit?: number; status?: string } = {}
  ): Promise<{ items: Order[]; total: number }> {
    const { page = 1, limit = 20, status } = pagination;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { vendorId };
    if (status) filter.status = status;

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit, sort: { createdAt: -1 } }),
      this.model.countDocuments(filter),
    ]);

    return { items: docs.map(doc => this.toDomain(doc)), total };
  }

  async save(order: Order): Promise<void> {
    const props = order.getProps();
    const doc = OrderMapper.toPersistence(order);
    await this.model.findOneAndUpdate(
      { id: order.id },
      doc,
      { upsert: true, new: true }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async updateCancel(id: string, reason: string): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { cancelReason: reason, cancelledAt: new Date() } }
    ).exec();
  }

  async updateShipping(id: string, trackingNumber: string, carrier: string): Promise<void> {
    await this.model.updateOne(
      { id },
      { $set: { trackingNumber, shippingCarrier: carrier, status: 'SHIPPED' } }
    ).exec();
  }

  async findAll(): Promise<Order[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async findAllFiltered(params: {
    status?: string;
    vendorId?: string;
    skip?: number;
    limit?: number;
  }): Promise<{ items: Order[]; total: number }> {
    const filter: Record<string, unknown> = {};
    if (params.status) filter.status = params.status;
    if (params.vendorId) filter.vendorId = params.vendorId;

    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip: params.skip ?? 0, limit: params.limit ?? 20, sort: { createdAt: -1 } }),
      this.model.countDocuments(filter),
    ]);

    return { items: docs.map(doc => this.toDomain(doc)), total };
  }

  async findByIdempotencyKey(userId: string, key: string): Promise<Order[]> {
    const docs = await this.model.find({ userId, idempotencyKey: key }).exec();
    return docs.map(doc => this.toDomain(doc));
  }

  async create(order: Order, idempotencyKey?: string): Promise<void> {
    const doc = OrderMapper.toPersistence(order);
    if (idempotencyKey) {
      (doc as any).idempotencyKey = idempotencyKey;
    }
    await this.model.create(doc);
  }

  async updateStatus(orderId: string, status: string): Promise<void> {
    await this.model.updateOne(
      { id: orderId },
      { $set: { status, updatedAt: new Date() } }
    ).exec();
  }

  async updatePaid(orderId: string, escrowHoldId: string): Promise<void> {
    await this.model.updateOne(
      { id: orderId },
      {
        $set: {
          status: 'PAID',
          paymentStatus: 'COMPLETED',
          paidAt: new Date(),
          escrowHoldId,
          escrowStatus: 'HELD',
          updatedAt: new Date(),
        }
      }
    ).exec();
  }

  async updateOne(orderId: string, data: Record<string, unknown>): Promise<void> {
    await this.model.updateOne(
      { id: orderId },
      { $set: { ...data, updatedAt: new Date() } }
    ).exec();
  }

  async decrementStock(listingId: string, quantity: number): Promise<boolean> {
    // MongoDB: atomik check-and-decrement
    const result = await this.model.db.collection('listings').updateOne(
      { id: listingId, stock: { $gte: quantity }, status: 'ACTIVE' },
      {
        $inc: { stock: -quantity, reservedQuantity: quantity },
        $set: { updatedAt: new Date() },
      }
    );
    return result.modifiedCount > 0;
  }

  async incrementStock(listingId: string, quantity: number): Promise<void> {
    await this.model.db.collection('listings').updateOne(
      { id: listingId },
      {
        $inc: { stock: quantity, reservedQuantity: -quantity },
        $set: { updatedAt: new Date() },
      }
    );
  }

  async findExpiredPending(now: Date): Promise<Order[]> {
    const docs = await this.model.find({
      status: 'PENDING',
      expiresAt: { $lte: now, $ne: null },
    }).exec();
    return docs.map(doc => this.toDomain(doc));
  }
}