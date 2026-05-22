import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

// Mission — generated from Prisma schema
// TODO: strict typing — codegen

export interface IMission {
  _id?: string;
  id: string;
  key: string;
  title: string;
  description?: string;
  xpReward: number;
  rewardType?: string;
  isActive: boolean;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
  updatedAt: Date;
}

export const MissionSchema = new Schema<IMission>({
  _id: { type: String },
  id: { type: String, required: true },
  key: { type: String },
  title: { type: String },
  description: { type: String },
  xpReward: { type: Number, default: 0, alias: 'xp_reward' },
  rewardType: { type: String, default: 'XP', alias: 'reward_type' },
  isActive: { type: Boolean, default: true, alias: 'is_active' },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, alias: 'created_at' },
  updatedAt: { type: Date, alias: 'updated_at' },
}, {
  timestamps: true,
  collection: 'missions',
});

export const Mission = createModelProxy<IMission>('Mission', MissionSchema);
