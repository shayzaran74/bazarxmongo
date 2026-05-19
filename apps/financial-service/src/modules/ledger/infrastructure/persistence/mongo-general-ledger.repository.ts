// apps/financial-service/src/modules/ledger/infrastructure/persistence/mongo-general-ledger.repository.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IFinancialGeneralLedger } from '@barterborsa/shared-persistence';
import { IGeneralLedgerRepository } from '../../domain/repositories/general-ledger.repository.interface';
import { GeneralLedgerEntry } from '../../domain/entities/general-ledger-entry.entity';
import { LedgerMapper } from './mappers/ledger.mapper';

@Injectable()
export class MongoGeneralLedgerRepository implements IGeneralLedgerRepository {
  constructor(
    @InjectModel('GeneralLedger') private readonly ledgerModel: Model<IFinancialGeneralLedger>,
    private readonly mapper: LedgerMapper,
  ) {}

  async findByReferenceId(referenceId: string): Promise<GeneralLedgerEntry[]> {
    const raws = await this.ledgerModel.find({ referenceId }).lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async findById(id: string): Promise<GeneralLedgerEntry | null> {
    const raw = await this.ledgerModel.findOne({ id }).lean();
    return raw ? this.mapper.toDomain(raw) : null;
  }

  async findAll(): Promise<GeneralLedgerEntry[]> {
    const raws = await this.ledgerModel.find().lean();
    return raws.map(raw => this.mapper.toDomain(raw));
  }

  async save(entity: GeneralLedgerEntry): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    // Ledger kayıtları immutable — sadece insert
    await this.ledgerModel.create([{ _id: entity.id, id: entity.id, ...persistence }]);
  }

  async delete(_id: string): Promise<void> {
    // Ledger kayıtları üretimde silinemez — sadece audit amaçlı stub
  }
}
