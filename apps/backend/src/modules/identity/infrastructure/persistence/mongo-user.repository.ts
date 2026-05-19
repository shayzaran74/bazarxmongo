// apps/backend/src/modules/identity/infrastructure/persistence/mongo-user.repository.ts
// User repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { User as UserModel } from '@barterborsa/shared-persistence';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  private readonly model: Model<any>;

  constructor() {
    this.model = UserModel;
  }

  private toUserDomain(doc: { toObject(): Record<string, unknown> }): Record<string, unknown> {
    const obj = doc.toObject();
    // MongoDB şeması 'password' kullanır; domain katmanı 'passwordHash' bekler
    if (obj['password'] && !obj['passwordHash']) {
      obj['passwordHash'] = obj['password'];
    }
    return obj;
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? this.toUserDomain(doc) : null;
  }

  async findByEmail(email: string): Promise<Record<string, unknown> | null> {
    const doc = await this.model.findOne({ email }).exec();
    return doc ? this.toUserDomain(doc) : null;
  }

  async findByReferralCode(code: string): Promise<any | null> {
    const doc = await this.model.findOne({ referralCode: code }).exec();
    return doc ? doc.toObject() : null;
  }

  async updateRole(userId: string, role: string): Promise<void> {
    await this.model.updateOne(
      { id: userId },
      { $set: { role, updatedAt: new Date() } },
    ).exec();
  }

  async updateReferralCode(userId: string, code: string): Promise<void> {
    await this.model.updateOne(
      { id: userId },
      { $set: { referralCode: code, updatedAt: new Date() } },
    ).exec();
  }

  async update(id: string, data: Record<string, unknown>): Promise<void> {
    await this.model.updateOne({ id }, { $set: { ...data, updatedAt: new Date() } }).exec();
  }
}