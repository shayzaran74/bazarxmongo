import { IsDateString, IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateProfileDto {
  @IsDateString()
  @IsOptional()
  birthday?: string;
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  /**
   * Frontend `phoneNumber` olarak gönderir – backend DTO'da aynı isimde tutuyoruz.
   */
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsNumber()
  @IsOptional()
  cityId?: number;

  @IsString()
  @IsOptional()
  district?: string;

  @IsNumber()
  @IsOptional()
  districtId?: number;

  @IsString()
  @IsOptional()
  neighborhood?: string;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  taxNumber?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;
}
