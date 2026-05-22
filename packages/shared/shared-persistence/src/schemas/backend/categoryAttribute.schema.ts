import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface ICategoryAttribute {
  _id?: string;
  id: string;
  name: string;
  label: string;
  type: string;
  options?: Schema.Types.Mixed;
  unit?: string;
  placeholder?: string;
  order: number;
  categoryId?: string;
  createdAt: Date;
  isActive: boolean;
  isFilterable: boolean;
  isRequired: boolean;
  isVariant: boolean;
  updatedAt: Date;
  surplusCategoryId?: string;
}

export const CategoryAttributeSchema = new Schema<ICategoryAttribute>({
  _id: { type: String },
  id: { type: String, required: true },
  name: { type: String },
  label: { type: String },
  type: { type: String },
  options: { type: Schema.Types.Mixed },
  unit: { type: String },
  placeholder: { type: String },
  order: { type: Number, default: 0 },
  categoryId: { type: String },
  createdAt: { type: Date },
  isActive: { type: Boolean, default: true },
  isFilterable: { type: Boolean, default: true },
  isRequired: { type: Boolean, default: false },
  isVariant: { type: Boolean, default: false },
  updatedAt: { type: Date },
  surplusCategoryId: { type: String },
}, {
  timestamps: true,
  collection: 'category_attributes',
});

CategoryAttributeSchema.index({ categoryId: 1 });
CategoryAttributeSchema.index({ surplusCategoryId: 1 });

export const CategoryAttribute = createModelProxy<ICategoryAttribute>('CategoryAttribute', CategoryAttributeSchema);