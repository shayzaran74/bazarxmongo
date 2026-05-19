// packages/shared/shared-persistence/src/mongodb/mongo-soft-delete.plugin.ts
// Soft delete middleware — deletedAt alanı ile silinenleri filtreler

import { Schema, Model } from 'mongoose';

// Query interceptor — soft deleted kayıtları otomatik filtreler
function addSoftDeleteQueryConditions(schema: Schema): void {
  // @ts-ignore — mongoose query extension noktası
  schema.query.withDeleted = function () {
    return this;
  };

  // Default: soft deleted kayıtları excluded et
  // @ts-ignore — mongoose query extension noktası
  schema.query.notDeleted = function () {
    // @ts-ignore
    return this.where({ isDeleted: { $ne: true } });
  };

  // findOne ve find için otomatik notDeleted override
  const originalFindOne = schema.statics.findOne;
  schema.statics.findOne = function (conditions?: any, projection?: any, options?: any) {
    const query = conditions?.withDeleted
      ? originalFindOne.call(this, conditions, projection, options)
      : originalFindOne.call(this, { ...conditions, isDeleted: { $ne: true } }, projection, options);
    return query;
  };

  const originalFind = schema.statics.find;
  schema.statics.find = function (conditions?: any, projection?: any, options?: any) {
    const query = conditions?.withDeleted
      ? originalFind.call(this, conditions, projection, options)
      : originalFind.call(this, { ...conditions, isDeleted: { $ne: true } }, projection, options);
    return query;
  };
}

// pre('deleteOne') middleware — hard delete yerine soft delete yapar
export function softDeleteMiddleware(schema: Schema): void {
  schema.pre('deleteOne', function () {
    const doc = this.getQuery();
    this.model.updateMany(
      { _id: doc._id },
      { $set: { deletedAt: new Date(), isDeleted: true } }
    );
  });
}

// Plugin fonksiyonu — schema'ya uygulanır
export function SoftDeletePlugin(schema: Schema): void {
  addSoftDeleteQueryConditions(schema);
  softDeleteMiddleware(schema);
}

// Model üzerinde statik yardımcılar ekler
export type SoftDeleteModel<T> = Model<T> & {
  restore(id: string): Promise<T | null>;
  hardDelete(id: string): Promise<void>;
  findAllWithDeleted(query?: any): Promise<T[]>;
};

export function extendModelWithSoftDelete<T>(
  model: Model<T>
): SoftDeleteModel<T> {
  const M = model as SoftDeleteModel<T>;

  M.restore = async function (id: string) {
    const updated = await this.findByIdAndUpdate(
      id,
      { $set: { deletedAt: null, isDeleted: false } },
      { new: true }
    );
    return updated;
  };

  M.hardDelete = async function (id: string) {
    await this.deleteOne({ _id: id });
  };

  M.findAllWithDeleted = async function (query = {}) {
    return this.find({ ...query }).setOptions({ withDeleted: true });
  };

  return M;
}