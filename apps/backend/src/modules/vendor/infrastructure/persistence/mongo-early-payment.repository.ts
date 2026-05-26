// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-early-payment.repository.ts
// MongoEarlyPaymentRepository — MongoDB/Mongoose implementation (ADR-005 Faz 2a)

import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EarlyPaymentRequest as EarlyPaymentModel, IEarlyPaymentRequest } from '@barterborsa/shared-persistence';
import { EarlyPaymentStatus } from '../../domain/enums/early-payment-status.enum';
import { EarlyPaymentRequest } from '../../domain/entities/early-payment-request.entity';
import { IEarlyPaymentRepository } from '../../domain/repositories/early-payment.repository.interface';

class EarlyPaymentMapper {
  toDomain(doc: IEarlyPaymentRequest & { _id?: string }): EarlyPaymentRequest {
    return EarlyPaymentRequest.fromPersistence(
      {
        vendorId: doc.vendorId,
        amount: Number(doc.amount) || 0,
        interestRate: Number(doc.interestRate) || 0,
        interestAmount: Number(doc.interestAmount) || 0,
        totalAmount: Number(doc.totalAmount) || 0,
        status: doc.status as EarlyPaymentStatus,
        payeeAccountId: doc.payeeAccountId,
        transactionId: doc.transactionId,
        requestedAt: doc.requestedAt ?? new Date(),
        processedAt: doc.processedAt,
        rejectionReason: doc.rejectionReason,
        idempotencyKey: doc.idempotencyKey,
        orderId: doc.orderId,
        earnedAmount: Number(doc.earnedAmount) || 0,
        availableAmount: Number(doc.availableAmount) || 0,
      },
      doc.id,
    );
  }

  toPersistence(entity: EarlyPaymentRequest): Record<string, unknown> {
    const props = entity.getProps();
    return {
      id: entity.id,
      vendorId: props.vendorId,
      amount: props.amount,
      interestRate: props.interestRate,
      interestAmount: props.interestAmount,
      totalAmount: props.totalAmount,
      status: props.status,
      payeeAccountId: props.payeeAccountId,
      transactionId: props.transactionId,
      requestedAt: props.requestedAt,
      processedAt: props.processedAt,
      rejectionReason: props.rejectionReason,
      idempotencyKey: props.idempotencyKey,
      orderId: props.orderId,
      earnedAmount: props.earnedAmount,
      availableAmount: props.availableAmount,
    };
  }
}

@Injectable()
export class MongoEarlyPaymentRepository implements IEarlyPaymentRepository {
  private readonly logger = new Logger(MongoEarlyPaymentRepository.name);
  private readonly mapper = new EarlyPaymentMapper();
  private readonly model: Model<IEarlyPaymentRequest>;

  constructor(@InjectModel('EarlyPaymentRequest') model: Model<IEarlyPaymentRequest>) {
    this.model = model;
  }

  async findById(id: string): Promise<EarlyPaymentRequest | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async save(entity: EarlyPaymentRequest): Promise<void> {
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

  async findAll(): Promise<EarlyPaymentRequest[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async findByVendorId(vendorId: string, skip: number, take: number) {
    const filter = { vendorId };
    const [docs, total] = await Promise.all([
      this.model.find(filter, {}, { skip, limit: take }).sort({ requestedAt: -1 }).exec(),
      this.model.countDocuments(filter),
    ]);
    return { items: docs.map(d => this.mapper.toDomain(d)), total };
  }

  async findByStatus(status: EarlyPaymentStatus, skip: number, take: number) {
    const [docs, total] = await Promise.all([
      this.model.find({ status }, {}, { skip, limit: take }).sort({ requestedAt: -1 }).exec(),
      this.model.countDocuments({ status }),
    ]);
    return { items: docs.map(d => this.mapper.toDomain(d)), total };
  }

  async findByVendorAndDateRange(vendorId: string, fromDate: Date, toDate: Date): Promise<EarlyPaymentRequest[]> {
    const docs = await this.model
      .find({
        vendorId,
        requestedAt: { $gte: fromDate, $lte: toDate },
      })
      .exec();
    return docs.map(d => this.mapper.toDomain(d));
  }
}