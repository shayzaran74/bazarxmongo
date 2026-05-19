// packages/shared/shared-persistence/src/schemas/backend/chatRoom.schema.ts
import { Schema, model } from 'mongoose';

export const StorageTier = ['STANDARD','COLD','ARCHIVED'] as const;
export type StorageTierType = typeof StorageTier[number];

export interface IChatRoom {
  _id?: string;
  id: string;
  orderId?: string;
  tradeOfferId?: string;
  participantIds?: string[];
  archivePreview?: Schema.Types.Mixed;
  archiveUrl?: string;
  archivedAt?: Date;
  isArchived: boolean;
  storageTier: StorageTierType;
  createdAt: Date;
  updatedAt: Date;
}

export const ChatRoomSchema = new Schema<IChatRoom>({
  _id: { type: String },
  id: { type: String, required: true },
  orderId: { type: String },
  tradeOfferId: { type: String },
  participantIds: { type: [String], default: [] },
  archivePreview: { type: Schema.Types.Mixed },
  archiveUrl: { type: String },
  archivedAt: { type: Date },
  isArchived: { type: Boolean, default: false },
  storageTier: { type: String, enum: StorageTier, default: 'STANDARD' },
  createdAt: { type: Date },
  updatedAt: { type: Date },
}, {
  timestamps: true,
  collection: 'chat_rooms',
});

ChatRoomSchema.index({ isArchived: 1 });
ChatRoomSchema.index({ updatedAt: -1 });

export const ChatRoom = model<IChatRoom>('ChatRoom', ChatRoomSchema);