import { createModelProxy } from '../../mongodb/model-proxy';
// packages/shared/shared-persistence/src/schemas/backend/systemSetting.schema.ts
import { Schema } from 'mongoose';

export interface ISystemSetting {
  _id?: string;
  key: string;
  value: Schema.Types.Mixed;
  updatedBy?: string;
  updatedAt: Date;
}

export const SystemSettingSchema = new Schema<ISystemSetting>({
  _id: { type: String },
  key: { type: String, required: true },
  value: { type: Schema.Types.Mixed },
  updatedBy: { type: String },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'system_settings',
});

SystemSettingSchema.index({ key: 1 }, { unique: true });

export const SystemSetting = createModelProxy<ISystemSetting>('SystemSetting', SystemSettingSchema);
