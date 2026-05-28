// packages/domain-identity/src/infrastructure/persistence/mongo-user-address.repository.ts
// UserAddress repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserAddress as UserAddressModel, IUserAddress } from '@barterborsa/shared-persistence';
import { IUserAddressRepository } from '../../domain/repositories/user-address.repository.interface';
import { UserAddress } from '../../domain/entities/user-address.entity';
import { MongoUserAddressMapper } from './mappers/mongo-user-address.mapper';

@Injectable()
export class MongoUserAddressRepository implements IUserAddressRepository {
  private readonly model: Model<IUserAddress>;

  constructor() {
    this.model = UserAddressModel;
  }

  async findById(id: string): Promise<UserAddress | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? MongoUserAddressMapper.toDomain(doc) : null;
  }

  async findByUserId(userId: string): Promise<UserAddress[]> {
    const docs = await this.model.find({ userId }).exec();
    return docs.map(doc => MongoUserAddressMapper.toDomain(doc));
  }

  async save(address: UserAddress): Promise<void> {
    const data = MongoUserAddressMapper.toPersistence(address);
    const { _id, ...updateData } = data;
    await this.model.findOneAndUpdate(
      { id: address.id },
      { $set: updateData, $setOnInsert: { _id: address.id } },
      { upsert: true, new: true }
    ).exec();
  }

  async update(address: UserAddress): Promise<void> {
    const data = MongoUserAddressMapper.toPersistence(address);
    const { _id, ...updateData } = data;
    await this.model.findOneAndUpdate(
      { id: address.id },
      { $set: updateData }
    ).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { id },
      { deletedAt: new Date() }
    ).exec();
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.model.deleteMany({ userId }).exec();
  }

  async setDefault(id: string, userId: string): Promise<void> {
    await this.model.bulkWrite([
      { updateMany: { filter: { userId }, update: { $set: { isDefault: false } } } },
      { updateOne: { filter: { id }, update: { $set: { isDefault: true } } } },
    ]);
  }
}