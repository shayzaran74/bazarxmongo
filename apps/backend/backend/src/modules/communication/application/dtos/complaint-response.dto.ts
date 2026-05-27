import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

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
