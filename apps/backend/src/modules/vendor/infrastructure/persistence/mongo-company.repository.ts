// apps/backend/src/modules/vendor/infrastructure/persistence/mongo-company.repository.ts
// Company repository — Mongoose implementation (ADR-005 Faz 2a)

import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { BaseMongoRepository } from '../../../../../../../packages/shared/shared-persistence/src/mongodb/base-mongo.repository';
import { Company as CompanyModel, ICompany } from '../../../../../../../packages/shared/shared-persistence/src/schemas/backend/company.schema';
import { CompanyMapper, CompanyDocument } from './mappers/company.mapper';
import { ICompanyRepository } from '../../domain/repositories/company.repository.interface';
import { Company } from '../../domain/entities/company.entity';
import { TaxNumber } from '../../domain/value-objects/tax-number.vo';

@Injectable()
export class MongoCompanyRepository
  extends BaseMongoRepository<Company, ICompany>
  implements ICompanyRepository
{
  constructor() {
    super(CompanyModel as any, {
      toDomain: CompanyMapper.toDomain as any,
      toPersistence: CompanyMapper.toPersistence as any,
    });
  }

  async findByTaxNumber(taxNumber: TaxNumber): Promise<Company | null> {
    const doc = await this.model.findOne({ taxNumber: taxNumber.value }).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }

  async existsByTaxNumber(taxNumber: TaxNumber): Promise<boolean> {
    const count = await this.model.countDocuments({ taxNumber: taxNumber.value });
    return count > 0;
  }

  async findAll(): Promise<Company[]> {
    const docs = await this.model.find({ deletedAt: null }).exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async create(data: {
    name: string;
    taxNumber: string;
    status?: string;
    verifiedAt?: Date;
  }): Promise<Company> {
    const id = 'company-' + Date.now() + '-' + Math.random().toString(36).substring(7);
    const doc = new this.model({
      _id: id,
      id,
      name: data.name,
      taxNumber: data.taxNumber,
      status: data.status ?? 'PENDING',
      verifiedAt: data.verifiedAt,
      vatRate: Types.Decimal128.fromString('20'),
    });
    await doc.save();
    return this.mapper.toDomain(doc);
  }

  async update(id: string, data: Partial<{
    name: string;
    status: string;
    verifiedAt: Date;
  }>): Promise<Company | null> {
    const doc = await this.model.findOneAndUpdate(
      { id },
      { $set: data },
      { new: true }
    ).exec();
    return doc ? this.mapper.toDomain(doc) : null;
  }
}