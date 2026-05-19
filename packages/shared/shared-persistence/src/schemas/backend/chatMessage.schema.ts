// packages/shared/shared-persistence/src/schemas/backend/chatMessage.schema.ts
import { Schema, model } from 'mongoose';

export interface IChatMessage {
  _id?: string;
  id: string;
  roomId: string;
  senderId?: string;
  content: string;
  isRead: boolean;
  readAt?: Date;
  readById?: string;
  metadata?: Schema.Types.Mixed;
  createdAt: Date;
}

export const ChatMessageSchema = new Schema<IChatMessage>({
  _id: { type: String },
  id: { type: String, required: true },
  roomId: { type: String },
  senderId: { type: String },
  content: { type: String },
  isRead: { type: Boolean, default: false },
  readAt: { type: Date },
  readById: { type: String },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date },
}, {
  timestamps: true,
  collection: 'chat_messages',
});

ChatMessageSchema.index({ roomId: 1 });
ChatMessageSchema.index({ senderId: 1 });
ChatMessageSchema.index({ roomId: 1, createdAt: -1 });

export const ChatMessage = model<IChatMessage>('ChatMessage', ChatMessageSchema);