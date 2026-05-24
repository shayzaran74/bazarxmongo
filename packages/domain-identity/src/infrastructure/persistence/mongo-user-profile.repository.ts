// packages/domain-identity/src/infrastructure/persistence/mongo-user-profile.repository.ts
// UserProfile repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserProfile as UserProfileModel, IUserProfile } from '@barterborsa/shared-persistence';
import { IUserProfileRepository } from '../../domain/repositories/user-profile.repository.interface';
import { UserProfile } from '../../domain/entities/user-profile.entity';
import { MongoUserProfileMapper } from './mappers/mongo-user-profile.mapper';

@Injectable()
export class MongoUserProfileRepository implements IUserProfileRepository {
  private readonly model: Model<IUserProfile>;

  constructor() {
    this.model = UserProfileModel;
  }

  async findByUserId(userId: string): Promise<UserProfile | null> {
    const doc = await this.model.findOne({ userId }).exec();
    return doc ? MongoUserProfileMapper.toDomain(doc) : null;
  }

  async save(profile: UserProfile): Promise<void> {
    const data = MongoUserProfileMapper.toPersistence(profile);
    await this.model.findOneAndUpdate(
      { userId: profile.userId },
      { $set: data },
      { upsert: true, new: true }
    ).exec();
  }

  async update(profile: UserProfile): Promise<void> {
    const data = MongoUserProfileMapper.toPersistence(profile);
    await this.model.findOneAndUpdate(
      { userId: profile.userId },
      { $set: data }
    ).exec();
  }
}