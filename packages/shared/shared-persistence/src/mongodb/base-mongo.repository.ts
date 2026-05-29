import { Model } from 'mongoose';

/** Eşzamanlı yazım çakışması — OCC (Optimistic Concurrency Control) */
class ConcurrencyConflictException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictException';
  }
}


export abstract class BaseMongoRepository<
  TDomain extends { id: string },
  TPersistence
> {
  constructor(
    protected readonly model: Model<TPersistence>,
    protected readonly mapper: {
      toDomain(persistence: TPersistence): TDomain;
      toPersistence(domain: TDomain): Record<string, unknown>;
    }
  ) {}

  async findById(id: string): Promise<TDomain | null> {
    const doc = await this.model.findOne({ id } as Record<string, unknown>).exec();
    if (!doc) return null;
    return this.mapper.toDomain(doc as TPersistence);
  }

  async findAll(): Promise<TDomain[]> {
    const docs = await this.model.find().exec();
    return docs.map(doc => this.mapper.toDomain(doc as TPersistence));
  }

  async save(entity: TDomain): Promise<void> {
    const persistence = this.mapper.toPersistence(entity);
    const { _id, ...updateData } = persistence as any;
    const hasVersionField = !!this.model.schema.path('version');
    const existing = await this.model.findOne({ id: entity.id } as Record<string, unknown>).exec();

    if (existing) {
      if (hasVersionField && typeof (entity as any).version === 'number') {
        const currentVersion = (entity as any).version;
        const nextVersion = currentVersion + 1;
        updateData.version = nextVersion;

        const result = await this.model.findOneAndUpdate(
          { id: entity.id, version: currentVersion } as Record<string, unknown>,
          { $set: updateData },
          { new: true }
        ).exec();

        if (!result) {
          throw new ConcurrencyConflictException(`Concurrency conflict: Entity ${entity.id} version ${currentVersion} has changed in the database.`);
        }
        (entity as any)._version = nextVersion;
      } else {
        await this.model.findOneAndUpdate(
          { id: entity.id } as Record<string, unknown>,
          { $set: updateData }
        ).exec();
      }
    } else {
      if (hasVersionField) {
        persistence.version = 1;
      }
      const created = new this.model(persistence);
      await created.save();
    }
  }

  async delete(id: string): Promise<void> {
    await this.model.findOneAndDelete({ id } as Record<string, unknown>).exec();
  }
}