// packages/domain-identity/src/infrastructure/persistence/mongo-user.repository.ts
// User repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable, Logger } from '@nestjs/common';
import { Model } from 'mongoose';
import { User as UserModel, IUser, UserProfile } from '@barterborsa/shared-persistence';
import { User as UserEntity } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { MongoUserMapper } from './mappers/mongo-user.mapper';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  private readonly logger = new Logger(MongoUserRepository.name);
  private readonly model: Model<IUser>;

  constructor() {
    this.model = UserModel;
  }

  private toDomain(doc: any): UserEntity {
    return MongoUserMapper.toDomain(doc);
  }

  // Saf kullanıcı döner — Vendor/Company join YAPILMAZ (Bölüm 11 düzeltmesi).
  // Vendor verisine ihtiyaç varsa UserProjectionService.getFullProfile() kullanılmalı.
  async findById(id: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ id, deletedAt: null }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ email, deletedAt: null }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByGoogleId(googleId: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ googleId, deletedAt: null }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async findByPhoneNumber(phoneNumber: string): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ phoneNumber, deletedAt: null }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async exists(email: string): Promise<boolean> {
    const count = await this.model.countDocuments({ email, deletedAt: null }).exec();
    return count > 0;
  }

  async save(user: UserEntity): Promise<void> {
    try {
      const data = MongoUserMapper.toPersistence(user);
      const { _id, ...updateData } = data; // Prevent immutable _id error

      await this.model.findOneAndUpdate(
        { id: user.id },
        { $set: updateData, $setOnInsert: { _id: user.id } },
        { upsert: true, new: true }
      ).exec();

      const props = user.getProps();
      if (props.firstName || props.lastName) {
        await UserProfile.findOneAndUpdate(
          { userId: user.id },
          {
            $set: {
              userId: user.id,
              firstName: props.firstName,
              lastName: props.lastName
            },
            $setOnInsert: {
              _id: user.id,
              id: user.id
            }
          },
          { upsert: true, new: true }
        ).exec();
      }

      this.logger.debug(`User saved: ${user.email}`);
    } catch (err: any) {
      this.logger.error(`Failed to save user ${user.email}: ${err.message}`, err.stack);
      throw err;
    }
  }

  async update(user: UserEntity): Promise<void> {
    await this.save(user);
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndUpdate(
      { id },
      { deletedAt: new Date() }
    ).exec();
  }

  async findMany(pagination: any = {}, filters?: any): Promise<UserEntity[]> {
    const page = pagination.page || 1;
    const limit = pagination.limit || 10;
    const skip = (page - 1) * limit;

    const where: Record<string, any> = { deletedAt: null };
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const docs = await this.model.find(where)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .exec();

    return docs.map(doc => this.toDomain(doc));
  }

  async findFirstByRole(roles: string[]): Promise<UserEntity | null> {
    const doc = await this.model.findOne({ role: { $in: roles }, deletedAt: null }).exec();
    return doc ? this.toDomain(doc) : null;
  }

  async count(filters?: any): Promise<number> {
    const where: Record<string, any> = { deletedAt: null };
    if (filters?.role) where.role = filters.role;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.$or = [
        { email: { $regex: filters.search, $options: 'i' } },
        { phoneNumber: { $regex: filters.search, $options: 'i' } }
      ];
    }
    return this.model.countDocuments(where).exec();
  }
}