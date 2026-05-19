// apps/backend/src/modules/delivery/infrastructure/persistence/mongo-delivery-dispatch.repository.ts
// DeliveryDispatch repository — Mongoose implementation (ADR-005 Faz 2b)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { DeliveryDispatch as DeliveryDispatchModel, IDeliveryDispatch } from '@barterborsa/shared-persistence/schemas/backend/deliveryDispatch.schema';
import { IDeliveryDispatchRepository } from '../../domain/repositories/delivery-dispatch.repository.interface';
import { DeliveryDispatch } from '../../domain/entities/delivery-dispatch.entity';
import { DeliveryDispatchMapper } from './mappers/delivery-dispatch.mapper';

@Injectable()
export class MongoDeliveryDispatchRepository implements IDeliveryDispatchRepository {
  private readonly model: Model<IDeliveryDispatch>;

  constructor() {
    this.model = DeliveryDispatchModel;
  }

  private toDomain(doc: any): DeliveryDispatch {
    return DeliveryDispatchMapper.toDomain(doc);
  }

  async findById(id: string): Promise<DeliveryDispatch | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByOrderId(orderId: string): Promise<DeliveryDispatch | null> {
    const doc = await this.model.findOne({ orderId }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async save(dispatch: DeliveryDispatch): Promise<void> {
    const data = DeliveryDispatchMapper.toPersistence(dispatch);
    await this.model.findOneAndUpdate(
      { id: dispatch.id.toString() },
      data,
      { upsert: true, new: true }
    ).exec();
  }
}