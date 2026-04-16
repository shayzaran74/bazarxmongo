// apps/backend/src/modules/communication/application/dtos/notification-complaint.dtos.ts

import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsString()
  type!: string;

  @IsString()
  title!: string;

  @IsString()
  message!: string;

  @IsString()
  @IsOptional()
  link?: string;
}

export class CreateComplaintDto {
  @IsString()
  @IsNotEmpty()
  subjectId!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class ResolveComplaintDto {
  @IsString()
  @IsNotEmpty()
  adminNote!: string;
}

export class NotificationResponseDto {
  id!: string;
  type!: string;
  title!: string;
  message!: string;
  link?: string;
  isRead!: boolean;
  createdAt!: Date;
}

export class ComplaintResponseDto {
  id!: string;
  reporterId!: string;
  subjectId!: string;
  reason!: string;
  description?: string;
  status!: string;
  adminNote?: string;
  createdAt!: Date;
}
