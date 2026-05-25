// apps/backend/src/modules/advertising/application/dtos/create-ad-campaign.dto.ts

import { IsString, IsOptional, IsNumber, IsEnum, IsDateString, IsArray, IsBoolean } from 'class-validator';
import { AdType, AdSlotType, BillingModel, PricingModel, TargetRole } from '../../domain/enums/advertising.enums';

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
  @IsOptional()
  endDate?: string;

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

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  negativeKeywords: string[] = [];

  // GO Reklam Slot Sistemi — adSource ve listing hedefleme
  @IsEnum(['PAID', 'MENU_TAAHHUT'])
  @IsOptional()
  adSource: 'PAID' | 'MENU_TAAHHUT' = 'PAID';

  @IsString()
  @IsOptional()
  targetListingId?: string;

  @IsEnum(AdSlotType)
  @IsOptional()
  targetSlotType?: AdSlotType;

  @IsBoolean()
  @IsOptional()
  isDiscretionary?: boolean;
}
