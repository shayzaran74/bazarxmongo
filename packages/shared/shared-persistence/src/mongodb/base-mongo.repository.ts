import { Model } from 'mongoose';

export abstract class BaseMongoRepository<
  TDomain extends { id: string },
  TPersistence
> {
  constructor(
    protected readonly model: Model<TPersistence>,
    protected readonly mapper: {
      toDomain(persistence: TPersistence): TDomain;
      toPersistence(domain: TDomain): any;
    }
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findOne({ id } as any).exec();
    if (!doc) return null;
    return this.mapper.toDomain(doc);
  }

  async findAll(): Promise<TDomain[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.mapper.toDomain(doc));
  }

  async save(entity: TDomain): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    const existing = await this.model.findOne({ id: entity.id } as any).exec();

    if (existing) {
      await this.model.findOneAndUpdate({ id: entity.id } as any, persistence).exec();
    } else {
      const created = new this.model(persistence);
      await created.save();
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id } as any).exec();
  }
}