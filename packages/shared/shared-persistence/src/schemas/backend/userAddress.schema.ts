import { Schema, model, Types } from 'mongoose';

// UserAddress — generated from Prisma schema
// TODO: strict typing — codegen

export interface IUserAddress {
  _id?: string;
  id: string;
  userId: string;
  title: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  neighborhood?: string;
  postalCode?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export const UserAddressSchema = new Schema<IUserAddress>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  title: { type: String },
  firstName: { type: String, alias: 'first_name' },
  lastName: { type: String, alias: 'last_name' },
  email: { type: String },
  phone: { type: String },
  addressLine1: { type: String, alias: 'address_line1' },
  addressLine2: { type: String, alias: 'address_line2' },
  city: { type: String },
  district: { type: String },
  neighborhood: { type: String },
  postalCode: { type: String, alias: 'postal_code' },
  isDefault: { type: Boolean, default: false, alias: 'is_default' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
  deletedAt: { type: Date, alias: 'deleted_at' },
}, {
  timestamps: true,
  collection: 'user_addresses',
});

// Composite index
UserAddressSchema.index({ userId: 1 });

export const UserAddress = model<IUserAddress>('UserAddress', UserAddressSchema);
