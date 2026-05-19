import { Schema, model, Types } from 'mongoose';

// UserMission — generated from Prisma schema
// TODO: strict typing — codegen

export interface IUserMission {
  _id?: string;
  id: string;
  userId: string;
  missionId: string;
  status: string;
  progress?: Schema.Types.Mixed;
  completedAt?: Date;
  claimedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const UserMissionSchema = new Schema<IUserMission>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String, alias: 'user_id' },
  missionId: { type: String, alias: 'mission_id' },
  status: { type: String, default: 'IN_PROGRESS' },
  progress: { type: Schema.Types.Mixed },
  completedAt: { type: Date, alias: 'completed_at' },
  claimedAt: { type: Date, alias: 'claimed_at' },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'user_missions',
});

// Composite index
UserMissionSchema.index({ userId: 1, status: 1 });

// Unique constraint
UserMissionSchema.index({ userId: 1, missionId: 1 }, { unique: true });

export const UserMission = model<IUserMission>('UserMission', UserMissionSchema);
