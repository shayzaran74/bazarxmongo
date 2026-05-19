// apps/financial-service/src/modules/escrow/infrastructure/persistence/mongo-escrow.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFinancialEscrow } from '@barterborsa/shared-persistence';
import { IEscrowRepository } from '../../domain/repositories/escrow.repository.interface';
import { Escrow } from '../../domain/entities/escrow.entity';
import { EscrowMapper } from './mappers/escrow.mapper';

@Injectable()
export class MongoEscrowRepository implements IEscrowRepository {
  constructor(
    @InjectModel('Escrow') private readonly escrowModel: Model<IFinancialEscrow>,
    private readonly mapper: EscrowMapper,
  ) {}

  async findByOrderId(orderId: string): Promise<Escrow | null> {
    const raw = await this.escrowModel.findOne({ orderId }).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findActiveByBuyerId(buyerId: string): Promise<Escrow[]> {
    const raws = await this.escrowModel
      .find({ buyerId, status: { $in: ['PENDING', 'FUNDED', 'DISPUTED'] } })
      .lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<Escrow | null> {
    const raw = await this.escrowModel.findById(id).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<Escrow[]> {
    const raws = await this.escrowModel.find().lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: Escrow): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    await this.escrowModel.findOneAndUpdate(
      { orderId: entity.orderId },
      { $set: { ...persistence, id: entity.id } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  async delete(id: string): Promise<void> {
    await this.escrowModel.deleteOne({ _id: id });
  }
}
