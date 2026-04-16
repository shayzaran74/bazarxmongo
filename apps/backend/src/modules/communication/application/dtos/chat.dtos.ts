// apps/backend/src/modules/communication/application/dtos/chat.dtos.ts

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

export class CreateChatRoomDto {
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsString()
  @IsOptional()
  tradeOfferId?: string;
}

export class SendMessageDto {
  @IsString()
  content!: string;

  @IsEnum(ChatMessageType)
  @IsOptional()
  type?: ChatMessageType = ChatMessageType.TEXT;
}

export class ChatRoomResponseDto {
  id!: string;
  orderId?: string;
  tradeOfferId?: string;
  participantIds!: string[];
  lastMessage?: MessageResponseDto;
  unreadCount!: number;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class MessageResponseDto {
  id!: string;
  roomId!: string;
  senderId?: string;
  content!: string;
  type!: string;
  isRead!: boolean;
  createdAt!: Date;
}
