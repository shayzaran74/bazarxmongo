import { IsString, IsOptional, IsEnum } from 'class-validator';
import { NotificationType } from '../../domain/enums/notification-type.enum';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsString()
  @IsOptional()
  link?: string;
}
