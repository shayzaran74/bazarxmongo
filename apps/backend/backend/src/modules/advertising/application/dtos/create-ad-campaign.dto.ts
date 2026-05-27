// apps/backend/src/modules/advertising/application/dtos/create-ad-campaign.dto.ts

import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsArray, IsUrl } from 'class-validator';
import { AdType, BillingModel, PricingModel, TargetRole } from '../../domain/enums/advertising.enums';

export class CreateAdCampaignDto {
  @IsString()
  name!: string;

  @IsString()
  platform: string = 'BAZARX';

  @IsNumber()
  budget!: number;

  @IsEnum(AdType)
  adType!: AdType;

  @IsNumber()
  bidAmount!: number;

  @IsEnum(BillingModel)
  @IsOptional()
  billingModel: BillingModel = BillingModel.PREPAID;

  @IsEnum(PricingModel)
  pricingModel!: PricingModel;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCategories: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetKeywords: string[] = [];

  @IsEnum(TargetRole)
  @IsOptional()
  targetRole: TargetRole = TargetRole.ALL;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetCities: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetDistricts: string[] = [];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  targetSlots: string[] = [];

  @IsString()
  @IsOptional()
  targetUrl?: string;

  @IsUrl()
  @IsOptional()
  mediaUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  negativeKeywords: string[] = [];
}
