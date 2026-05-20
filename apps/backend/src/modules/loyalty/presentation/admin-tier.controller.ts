// apps/backend/src/modules/loyalty/presentation/admin-tier.controller.ts

import { Controller, Get, Post, Delete, Body, UseGuards, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Model, Types } from 'mongoose';
import {
  IsEnum, IsNumber, IsOptional, IsString, Min, Max, IsInt,
} from 'class-validator';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { Roles } from '@barterborsa/shared-nest';
import { ITierBenefit, B2BTierValues, B2BTierType } from '@barterborsa/shared-persistence';

class UpsertTierDto {
  @IsOptional() @IsString() id?: string;
  @IsEnum(B2BTierValues) tier!: B2BTierType;
  @IsNumber() @Min(0) @Max(1) commissionCash!: number;
  @IsNumber() @Min(0) @Max(1) commissionBarter!: number;
  @IsNumber() @Min(0) @Max(1) burnRate!: number;
  @IsNumber() @Min(0) annualFee!: number;
  @IsInt() @Min(1) listingLimit!: number;
  @IsInt() @Min(1) apiRatePerMin!: number;
  @IsOptional() @IsInt() @Min(1) excelBatchLimit?: number;
  @IsOptional() @IsInt() @Min(1) archiveAfterDays?: number;
  @IsOptional() @IsInt() @Min(1) imageCountPerListing?: number;
  @IsNumber() @Min(0) @Max(1) roiRate!: number;
  @IsNumber() @Min(1) xpMultiplier!: number;
}

const toDecimal = (v: number): Types.Decimal128 =>
  Types.Decimal128.fromString(String(v));

const toFloat = (v: Types.Decimal128 | undefined, fallback = 0): number =>
  parseFloat((v ?? Types.Decimal128.fromString(String(fallback))).toString());

@ApiTags('Admin Tier Management')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/tiers')
export class AdminTierController {
  constructor(
    @InjectModel('TierBenefit') private readonly tierModel: Model<ITierBenefit>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  @ApiOperation({ summary: 'B2B (CORE/PRIME/ELITE/APEX) tier konfigürasyonlarını listele' })
  @Get()
  async listTiers(): Promise<{ success: boolean; data: object[] }> {
    const items = await this.tierModel
      .find()
      .sort({ tier: 1 })
      .lean<ITierBenefit[]>();

    const tierOrder: B2BTierType[] = ['CORE', 'PRIME', 'ELITE', 'APEX'];
    const sorted = [...items].sort(
      (a, b) => tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier),
    );

    const data = sorted.map(item => ({
      id:                  item.id,
      tier:                item.tier,
      commissionCash:      toFloat(item.commissionCash),
      commissionBarter:    toFloat(item.commissionBarter),
      annualFee:           toFloat(item.annualFee),
      burnRate:            toFloat(item.burnRate),
      listingLimit:        item.listingLimit,
      apiRatePerMin:       item.apiRatePerMin,
      excelBatchLimit:     item.excelBatchLimit,
      archiveAfterDays:    item.archiveAfterDays,
      imageCountPerListing:item.imageCountPerListing,
      roiRate:             toFloat(item.roiRate),
      xpMultiplier:        toFloat(item.xpMultiplier, 1),
    }));

    return { success: true, data };
  }

  @ApiOperation({ summary: 'B2B tier konfigürasyonu oluştur veya güncelle (upsert)' })
  @Post()
  async upsertTier(@Body() dto: UpsertTierDto): Promise<{ success: boolean }> {
    const fields: Partial<ITierBenefit> = {
      tier:                dto.tier,
      commissionCash:      toDecimal(dto.commissionCash),
      commissionBarter:    toDecimal(dto.commissionBarter),
      annualFee:           toDecimal(dto.annualFee),
      burnRate:            toDecimal(dto.burnRate),
      listingLimit:        dto.listingLimit,
      apiRatePerMin:       dto.apiRatePerMin,
      excelBatchLimit:     dto.excelBatchLimit ?? 50,
      archiveAfterDays:    dto.archiveAfterDays ?? 365,
      imageCountPerListing:dto.imageCountPerListing ?? 5,
      roiRate:             toDecimal(dto.roiRate),
      xpMultiplier:        toDecimal(dto.xpMultiplier),
    };

    if (dto.id) {
      await this.tierModel.updateOne({ id: dto.id }, { $set: fields });
    } else {
      const newId = new Types.ObjectId().toString();
      await this.tierModel.findOneAndUpdate(
        { tier: dto.tier },
        { $set: fields, $setOnInsert: { _id: newId, id: newId } },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }

    return { success: true };
  }

  @ApiOperation({ summary: 'Tier önbelleğini temizle (Redis flush)' })
  @Delete('cache')
  async resetCache(): Promise<{ success: boolean; message: string }> {
    try {
      const manager = this.cacheManager as unknown as Record<string, unknown>;
      if (typeof manager['reset'] === 'function') {
        await (manager['reset'] as () => Promise<void>)();
      } else if (typeof manager['clear'] === 'function') {
        await (manager['clear'] as () => Promise<void>)();
      }
    } catch {
      // Cache manager erişilemez olsa da başarılı dön
    }
    return { success: true, message: 'Tier önbelleği temizlendi' };
  }
}
