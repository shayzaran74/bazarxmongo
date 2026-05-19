import { Schema, model, Types } from 'mongoose';

// ProductType — generated from Prisma schema
// TODO: strict typing — codegen

export interface IProductType {
  _id?: string;
  id: string;
  name: string;
  slug: string;
  description?: string;
  schema?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductTypeSchema = new Schema<IProductType>({
  _id: { type: String },
  id: { type: String },
  name: { type: String },
  slug: { type: String },
  description: { type: String },
  schema: { type: Schema.Types.Mixed },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'product_types',
});

// Composite index
ProductTypeSchema.index({ slug: 1 });

export const ProductType = model<IProductType>('ProductType', ProductTypeSchema);
