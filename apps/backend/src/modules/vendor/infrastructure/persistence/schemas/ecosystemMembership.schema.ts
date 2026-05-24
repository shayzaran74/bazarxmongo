// apps/backend/src/modules/vendor/infrastructure/persistence/schemas/ecosystemMembership.schema.ts

import { createModelProxy } from '@barterborsa/shared-persistence/mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export interface IEcosystemMembership {
  _id?: string;
  dealerId: Types.ObjectId;
  ecosystemId: Types.ObjectId;
  status: 'ACTIVE' | 'SUSPENDED' | 'REMOVED';
  joinedAt: Date;
  suspendedAt?: Date;
  removedAt?: Date;
  addedByUserId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const EcosystemMembershipSchema = new Schema<IEcosystemMembership>(
  {
    _id: { type: String },
    dealerId: { type: Schema.Types.ObjectId, required: true },
    ecosystemId: { type: Schema.Types.ObjectId, required: true },
    status: { type: String, enum: ['ACTIVE', 'SUSPENDED', 'REMOVED'], default: 'ACTIVE' },
    joinedAt: { type: Date, default: Date.now },
    suspendedAt: { type: Date },
    removedAt: { type: Date },
    addedByUserId: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
    collection: 'ecosystem_memberships',
  },
);

// Compound indexes
EcosystemMembershipSchema.index({ dealerId: 1, ecosystemId: 1 }, { unique: true });
EcosystemMembershipSchema.index({ ecosystemId: 1, status: 1 });
EcosystemMembershipSchema.index({ dealerId: 1, status: 1 });

export const EcosystemMembership =
  createModelProxy<IEcosystemMembership>('EcosystemMembership', EcosystemMembershipSchema);