// apps/backend/src/modules/commerce/infrastructure/persistence/mongo-user-address.repository.ts
// UserAddress repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserAddress as UserAddressModel } from '@barterborsa/shared-persistence';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';

@Injectable()
export class MongoUserAddressRepository implements IUserAddressRepository {
  private readonly model: Model<any>;

  constructor() {
    this.model = UserAddressModel;
  }

  async findById(id: string): Promise<any | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? doc.toObject() : null;
  }

  async findByUserId(userId: string): Promise<any[]> {
    const docs = await this.model.find({ userId, deletedAt: null }).exec();
    return docs.map(doc => doc.toObject());
  }
}