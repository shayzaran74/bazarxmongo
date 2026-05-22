import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/demandMatch.schema.ts
import { Schema } from 'mongoose';

export const DemandMatchStatus = ['PENDING','CONTACTED','REJECTED','MATCHED'] as const;
export type DemandMatchStatusType = typeof DemandMatchStatus[number];

export interface IDemandMatch {
  _id?: string;
  id: string;
  buyerItemId: string;
  sellerItemId?: string;
  surplusItemId?: string;
  score: number;
  status: DemandMatchStatusType;
  notes?: string;
  actionAt?: Date;
  actionBy?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const DemandMatchSchema = new Schema<IDemandMatch>({
  _id: { type: String },
  id: { type: String, required: true },
  buyerItemId: { type: String },
  sellerItemId: { type: String },
  surplusItemId: { type: String },
  score: { type: Number },
  status: { type: String, enum: DemandMatchStatus, default: 'PENDING' },
  notes: { type: String },
  actionAt: { type: Date },
  actionBy: { type: String },
  rejectionReason: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'demand_matches',
});

DemandMatchSchema.index({ buyerItemId: 1 });
DemandMatchSchema.index({ sellerItemId: 1 });
DemandMatchSchema.index({ status: 1 });

export const DemandMatch = createModelProxy<IDemandMatch>('DemandMatch', DemandMatchSchema);