// packages/shared/shared-persistence/src/mongodb/mongo-audit.plugin.ts
// Audit middleware — createdAt/updatedAt/updatedBy otomatik yönetimi

import { Schema } from 'mongoose';

// Audit alanları
export interface AuditFields {
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Schema'ya audit alanlarını ekler ve middleware'leri bağlar
export function AuditPlugin(schema: Schema, options: { createdByField?: string } = {}): void {
  const createdByField = options.createdByField ?? 'createdBy';

  // timestamps: true ile gelen updatedAt'i kullan, createdAt zaten var
  // Ek olarak createdBy ve updatedBy ekleyelim
  schema.add({
    createdBy: { type: String, default: null },
    updatedBy: { type: String, default: null },
  });

  // Pre-save: updatedAt her zaman güncellenir
  schema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
  });

  // Pre-updateOne / findOneAndUpdate
  schema.pre('findOneAndUpdate', function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  schema.pre('updateOne', function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  schema.pre('updateMany', function (next) {
    this.set({ updatedAt: new Date() });
    next();
  });

  // Statik: createdBy set et (user context'ten gelir)
  schema.methods.setCreatedBy = function (userId: string) {
    (this as any).createdBy = userId;
    (this as any).updatedBy = userId;
  };

  schema.methods.setUpdatedBy = function (userId: string) {
    (this as any).updatedBy = userId;
  };
}

// Audit query helper — bir dokümanın kim tarafından oluşturulduğunu bul
export function getAuditTrail(
  doc: Record<string, unknown>
): { createdAt: Date; createdBy: string | null; updatedAt: Date; updatedBy: string | null } {
  return {
    createdAt: doc.createdAt as Date,
    createdBy: doc.createdBy as string | null,
    updatedAt: doc.updatedAt as Date,
    updatedBy: doc.updatedBy as string | null,
  };
}