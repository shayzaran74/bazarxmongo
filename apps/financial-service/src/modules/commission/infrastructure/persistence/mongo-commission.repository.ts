// apps/financial-service/src/modules/commission/infrastructure/persistence/mongo-commission.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFinancialCommissionRecord } from '@barterborsa/shared-persistence';
import { ICommissionRepository } from '../../domain/repositories/commission.repository.interface';
import { CommissionRecord } from '../../domain/entities/commission-record.entity';
import { CommissionMapper } from './mappers/commission.mapper';

@Injectable()
export class MongoCommissionRepository implements ICommissionRepository {
  constructor(
    @InjectModel('CommissionRecord') private readonly commissionModel: Model<IFinancialCommissionRecord>,
    private readonly mapper: CommissionMapper,
  ) {}

  async findByOrderId(orderId: string): Promise<CommissionRecord | null> {
    const raw = await this.commissionModel.findOne({ orderId }).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findByVendorId(vendorId: string): Promise<CommissionRecord[]> {
    const raws = await this.commissionModel.find({ vendorId }).lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<CommissionRecord | null> {
    const raw = await this.commissionModel.findOne({ id }).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<CommissionRecord[]> {
    const raws = await this.commissionModel.find().lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: CommissionRecord): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.commissionModel.findOneAndUpdate(
      { id: entity.id },
      { $set: { ...persistence, id: entity.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.commissionModel.deleteOne({ id });
  }
}
