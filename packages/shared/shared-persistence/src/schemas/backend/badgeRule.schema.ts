import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema } from 'mongoose';

export interface IBadgeRule {
  _id?: string;
  id: string;
  code: string;
  displayText: any;
  position: string;
  priority: number;
  backgroundColor?: string;
  textColor?: string;
  targetEcosystem: string[];
  conditionJson: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const BadgeRuleSchema = new Schema<IBadgeRule>({
  _id: { type: String },
  id: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  displayText: { type: Schema.Types.Mixed, default: {} },
  position: { type: String, enum: ['TOP_LEFT', 'TOP_RIGHT', 'BOTTOM_LEFT', 'BOTTOM_RIGHT'], default: 'TOP_LEFT' },
  priority: { type: Number, default: 50 },
  backgroundColor: { type: String, default: '#6366f1' },
  textColor: { type: String, default: '#ffffff' },
  targetEcosystem: { type: [String], default: ['BAZARX'] },
  conditionJson: { type: Schema.Types.Mixed, default: {} },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  collection: 'badge_rules'
});

BadgeRuleSchema.index({ code: 1 }, { unique: true });
BadgeRuleSchema.index({ isActive: 1 });

export const BadgeRule = createModelProxy<IBadgeRule>('BadgeRule', BadgeRuleSchema);
