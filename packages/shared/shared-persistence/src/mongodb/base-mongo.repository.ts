import { Model, Document } from 'mongoose';
import { AggregateRoot, IRepository } from '@barterborsa/shared-core';

export abstract class BaseMongoRepository<
  TDomain extends AggregateRoot<any>,
  TPersistence
> implements IRepository<TDomain> {
  constructor(
    protected readonly model: Model<TPersistence>,
    protected readonly mapper: {
      toDomain(persistence: TPersistence): TDomain;
      toPersistence(domain: TDomain): any;
    }
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findById(id).exec();
    if (!doc) return null;
    return this.mapper.toDomain(doc);
  }

  async findAll(): Promise<TDomain[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async save(entity: TDomain): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    const existing = await this.model.findById(entity.id).exec();

    if (existing) {
      await this.model.findByIdAndUpdate(entity.id, persistence).exec();
    } else {
      const created = new this.model(persistence);
      await created.save();
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}
