// apps/backend/src/modules/vendor/application/dtos/create-company.dto.ts

import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, Min, Max } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  taxNumber!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string;

  @IsString()
  @IsOptional()
  taxOffice?: string;

  @IsString()
  @IsOptional()
  representativeName?: string;

  @IsString()
  @IsOptional()
  representativePhone?: string;

  @IsString()
  @IsOptional()
  companyType?: string;

  @IsString()
  @IsOptional()
  tradeRegistryNumber?: string;

  @IsString()
  @IsOptional()
  mersisNumber?: string;

  @IsString()
  @IsOptional()
  kepAddress?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  vatRate?: number;
}
