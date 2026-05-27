import { MessageResponseDto } from "./message-response.dto";

import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

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
