import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

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
