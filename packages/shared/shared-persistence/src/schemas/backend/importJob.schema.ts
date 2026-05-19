import { Schema, model, Types } from 'mongoose';

// ImportJob — generated from Prisma schema
// TODO: strict typing — codegen

export interface IImportJob {
  _id?: string;
  id: string;
  adminId: string;
  status: string;
  totalRows: number;
  processedRows: number;
  createdRows: number;
  failedRows: number;
  errors?: Schema.Types.Mixed;
  startedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const ImportJobSchema = new Schema<IImportJob>({
  _id: { type: String },
  id: { type: String, required: true },
  adminId: { type: String },
  totalRows: { type: Number },
  processedRows: { type: Number, default: 0 },
  createdRows: { type: Number, default: 0 },
  failedRows: { type: Number, default: 0 },
  errors: { type: Schema.Types.Mixed },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
});

// Composite index
ImportJobSchema.index({ adminId: 1 });

// Composite index
ImportJobSchema.index({ status: 1 });

export const ImportJob = model<IImportJob>('ImportJob', ImportJobSchema);
