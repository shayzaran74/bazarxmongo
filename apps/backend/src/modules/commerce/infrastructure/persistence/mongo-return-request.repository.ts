// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-return-request.repository.ts
// MongoReturnRequestRepository — MongoDB/Mongoose implementation for ReturnRequest (ADR-005 Faz 2a)

import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { ReturnRequest as ReturnRequestModel, IReturnRequest, IReturnItem } from '@barterborsa/shared-persistence';
import { ReturnStatus } from '../../domain/enums/return-status.enum';
import { ReturnRequest } from '../../domain/entities/return-request.entity';
import { IReturnRequestRepository } from '../../domain/repositories/return-request.repository.interface';
import { ReturnReasonType as ReturnReasonTypeEnum } from '../../domain/enums/return-reason-type.enum';

class ReturnRequestMapper {
  toDomain(doc: IReturnRequest & { _id?: string }): ReturnRequest {
    return ReturnRequest.fromPersistence(
      {
        orderId: doc.orderId,
        userId: doc.userId,
        status: doc.status as ReturnStatus,
        reason: doc.reason,
        reasonType: doc.reasonType as unknown as ReturnReasonTypeEnum,
        items: (doc.items ?? []).map((item: IReturnItem) => ({
          id: item.id,
          orderItemId: item.orderItemId,
          quantity: item.quantity,
          refundAmount: Number(item.refundAmount) || 0,
          reason: item.reason,
        })),
        totalRefund: Number(doc.totalRefund) || 0,
        sellerId: doc.sellerId,
        sellerDeadlineAt: doc.sellerDeadlineAt,
        autoApproveAt: doc.autoApproveAt,
        sellerRespondedAt: undefined,
        adminArbitration: false,
        createdAt: doc.createdAt ?? new Date(),
        updatedAt: doc.updatedAt ?? new Date(),
      },
      doc.id,
    );
  }

  toPersistence(entity: ReturnRequest): Record<string, unknown> {
    const props = entity.getProps();
    return {
      id: entity.id,
      orderId: props.orderId,
      userId: props.userId,
      status: props.status,
      reason: props.reason,
      reasonType: props.reasonType,
      items: props.items,
      totalRefund: props.totalRefund,
      sellerId: props.sellerId,
      sellerDeadlineAt: props.sellerDeadlineAt,
      autoApproveAt: props.autoApproveAt,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
    };
  }
}

@Injectable()
export class MongoReturnRequestRepository implements IReturnRequestRepository {
  private readonly logger = new Logger(MongoReturnRequestRepository.name);
  private readonly mapper = new ReturnRequestMapper();
  private readonly model: Model<IReturnRequest>;

  constructor() {
    this.model = ReturnRequestModel;
  }

  async findById(id: string): Promise<ReturnRequest | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async save(entity: ReturnRequest): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.model.findOneAndUpdate(
      { id: entity.id },
      { $set: persistence },
      { upsert: true },
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }

  async findAll(): Promise<ReturnRequest[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByOrderId(orderId: string): Promise<ReturnRequest | null> {
    const doc = await this.model.findOne({ orderId }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string, skip: number, take: number) {
    const filter = { userId };
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(d => this.mapper.toDomain(d)), total };
  }

  async findBySellerId(sellerId: string, skip: number, take: number) {
    const filter = { sellerId };
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(d => this.mapper.toDomain(d)), total };
  }

  async findByStatus(status: ReturnStatus, skip: number, take: number) {
    const [docs, total] = await Promise.all([
      this.model.find({ status }, {}, { skip, limit: take }).sort({ createdAt: -1 }).exec(),
      this.model.countDocuments({ status }),
    ]);
    return { items: docs.map(d => this.mapper.toDomain(d)), total };
  }

  async findByStatusAndSellerDeadlineBefore(
    status: ReturnStatus,
    deadline: Date,
    limit: number,
  ): Promise<ReturnRequest[]> {
    const docs = await this.model
      .find({
        status,
        sellerDeadlineAt: { $lte: deadline },
      })
      .limit(limit)
      .exec();
    return docs.map(d => this.mapper.toDomain(d));
  }

  async findPendingAutoApprove(deadline: Date, limit: number): Promise<ReturnRequest[]> {
    const docs = await this.model
      .find({
        status: ReturnStatus.PENDING,
        autoApproveAt: { $lte: deadline },
      })
      .limit(limit)
      .exec();
    return docs.map(d => this.mapper.toDomain(d));
  }
}