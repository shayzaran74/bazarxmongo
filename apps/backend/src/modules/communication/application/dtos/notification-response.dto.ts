import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class NotificationResponseDto {
  id!: string;
  type!: string;
  title!: string;
  message!: string;
  link?: string;
  isRead!: boolean;
  createdAt!: Date;
}
