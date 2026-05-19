// apps/backend/src/modules/communication/infrastructure/persistence/mongo-user-complaint.repository.ts
// UserComplaint repository — Mongoose implementation (ADR-005 Faz 2c)

import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { UserComplaint as UserComplaintModel, IUserComplaint } from '@barterborsa/shared-persistence/schemas/backend/userComplaint.schema';
import { IUserComplaintRepository } from '../../domain/repositories/user-complaint.repository.interface';
import { UserComplaint } from '../../domain/entities/user-complaint.entity';
import { UserComplaintMapper } from './mappers/user-complaint.mapper';

export interface UserComplaintDocument extends IUserComplaint {
  _id?: string;
}

@Injectable()
export class MongoUserComplaintRepository implements IUserComplaintRepository {
  private readonly model: Model<UserComplaintDocument>;

  constructor() {
    this.model = UserComplaintModel as Model<UserComplaintDocument>;
  }

  async findById(id: string): Promise<UserComplaint | null> {
    const doc = await this.model.findOne({ id }).exec();
    return doc ? UserComplaintMapper.toDomain(doc) : null;
  }

  async findAll(options?: { status?: string }): Promise<UserComplaint[]> {
    const filter: Record<string, unknown> = {};
    if (options?.status) filter.status = options.status;
    const docs = await this.model.find(filter, {}, { sort: { createdAt: -1 } }).exec();
    return docs.map(doc => UserComplaintMapper.toDomain(doc));
  }

  async findByReporterId(userId: string): Promise<UserComplaint[]> {
    const docs = await this.model.find({ reporterId: userId }, {}, { sort: { createdAt: -1 } }).exec();
    return docs.map(doc => UserComplaintMapper.toDomain(doc));
  }

  async save(complaint: UserComplaint): Promise<void> {
    const data = UserComplaintMapper.toPersistence(complaint);
    await this.model.updateOne({ id: complaint.id }, { $set: data }, { upsert: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.deleteOne({ id }).exec();
  }
}