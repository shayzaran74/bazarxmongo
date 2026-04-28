import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ChatMessageType } from '../../domain/enums/chat-message-type.enum';

export class SendMessageDto {
  @IsString()
  content!: string;

  @IsEnum(ChatMessageType)
  @IsOptional()
  type?: ChatMessageType = ChatMessageType.TEXT;
}
