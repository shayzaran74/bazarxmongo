import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class ResolveComplaintDto {
  @IsString()
  @IsNotEmpty()
  adminNote!: string;
}
