import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

export class MessageResponseDto {
  id!: string;
  roomId!: string;
  senderId?: string;
  content!: string;
  type!: string;
  isRead!: boolean;
  createdAt!: Date;
}
