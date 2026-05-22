import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// UserComplaint — generated from Prisma schema
// TODO: strict typing — codegen

export interface IUserComplaint {
  _id?: string;
  id: string;
  reporterId: string;
  subjectId: string;
  reason: string;
  description?: string;
  status?: string;
  adminNote?: string;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserComplaintSchema = new Schema<IUserComplaint>({
  _id: { type: String },
  id: { type: String, required: true },
  reporterId: { type: String, alias: 'reporter_id' },
  subjectId: { type: String, alias: 'subject_id' },
  reason: { type: String },
  description: { type: String },
  status: { type: String, default: 'PENDING' },
  adminNote: { type: String, alias: 'admin_note' },
  resolvedAt: { type: Date, alias: 'resolved_at' },
  resolvedBy: { type: String, alias: 'resolved_by' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'user_complaints',
});

// Composite index
UserComplaintSchema.index({ reporterId: 1 });

// Composite index
UserComplaintSchema.index({ subjectId: 1 });

// Composite index
UserComplaintSchema.index({ status: 1 });

export const UserComplaint = createModelProxy<IUserComplaint>('UserComplaint', UserComplaintSchema);
