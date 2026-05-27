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
