import { Schema, model } from 'mongoose';

export const DisputeResolutionStatus = ['OPEN','AUTO_REVIEW','MANUAL_REVIEW','ARBITRATION','RESOLVED','CANCELLED'] as const;
export type DisputeResolutionStatusType = typeof DisputeResolutionStatus[number];

export interface IBarterDisputeLog {
  _id?: string;
  id: string;
  swapSessionId: string;
  tradeOfferId: string;
  openedById: string;
  respondentId: string;
  status: DisputeResolutionStatusType;
  tradeValueInKurus: number;
  reason: string;
  evidence?: Schema.Types.Mixed;
  arbitratorId?: string;
  resolution?: string;
  resolutionNote?: string;
  costChargedToId?: string;
  resolutionDeadlineAt?: Date;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const BarterDisputeLogSchema = new Schema<IBarterDisputeLog>({
  _id: { type: String },
  id: { type: String, required: true },
  swapSessionId: { type: String },
  tradeOfferId: { type: String },
  openedById: { type: String },
  respondentId: { type: String },
  status: { type: String, enum: DisputeResolutionStatus, default: 'OPEN' },
  tradeValueInKurus: { type: Number },
  reason: { type: String },
  evidence: { type: Schema.Types.Mixed },
  arbitratorId: { type: String },
  resolution: { type: String },
  resolutionNote: { type: String },
  costChargedToId: { type: String },
  resolutionDeadlineAt: { type: Date },
  resolvedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'barter_dispute_logs',
});

BarterDisputeLogSchema.index({ tradeOfferId: 1 });
BarterDisputeLogSchema.index({ swapSessionId: 1 });
BarterDisputeLogSchema.index({ status: 1 });

export const BarterDisputeLog = model<IBarterDisputeLog>('BarterDisputeLog', BarterDisputeLogSchema);