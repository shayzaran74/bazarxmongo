// apps/backend/src/modules/content/presentation/settings-admin.controller.ts

import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection, Types } from 'mongoose';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IsBoolean, IsNumber, IsOptional, Min, Max, IsString, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ISystemSetting } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../audit/application/audit-log.service';

class UpdateSettingsDto {
  @IsOptional() @IsBoolean() maintenanceMode?: boolean;
  @IsOptional() @IsBoolean() allowRegistration?: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100) defaultCommissionRate?: number;
}

class ShippingTierDto {
  @IsNumber() @Min(0) min!: number;
  @IsNumber() @Min(0) max!: number;
  @IsNumber() @Min(0) cost!: number;
}

class UpdateHomepageSettingsDto {
  @IsOptional() @IsString()  siteName?: string;
  @IsOptional() @IsString()  siteLogo?: string;
  @IsOptional() @IsBoolean() showFlashSales?: boolean;
  @IsOptional() @IsBoolean() showSpecialOffers?: boolean;
  @IsOptional() @IsBoolean() showAds?: boolean;
  @IsOptional() @IsBoolean() showHomeSlider?: boolean;
  @IsOptional() @IsBoolean() showQuadCards?: boolean;
  @IsOptional() @IsBoolean() showAuctions?: boolean;
  @IsOptional() @IsBoolean() showLotteries?: boolean;
  @IsOptional() @IsBoolean() showGroupBuy?: boolean;
  @IsOptional() @IsBoolean() showPersonalized?: boolean;
  @IsOptional() @IsBoolean() showBarterPool?: boolean;
  @IsOptional() @IsBoolean() showPersonalizedProducts?: boolean;
  @IsOptional() @IsBoolean() showPerformance?: boolean;
  @IsOptional() @IsBoolean() showVendors?: boolean;
  @IsOptional() @IsBoolean() showRestaurants?: boolean;
  @IsOptional() @IsBoolean() showBrands?: boolean;
  @IsOptional() @IsBoolean() showNewsletter?: boolean;
  @IsOptional() @IsIn(['none','verified_companies','all']) autoApproveListings?: string;
  @IsOptional() @IsIn(['none','verified_companies','all']) autoApproveOffers?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ShippingTierDto) shippingTiers?: ShippingTierDto[];
}

interface AuthenticatedUser { id: string; role: string }

const DEFAULTS: Record<string, unknown> = {
  maintenanceMode: false, allowRegistration: true, defaultCommissionRate: 10,
};

const HOMEPAGE_DEFAULTS: Record<string, unknown> = {
  siteName: '', siteLogo: '', showFlashSales: true, showSpecialOffers: true,
  showAds: true, showHomeSlider: true, showQuadCards: true, showAuctions: true,
  showLotteries: true, showGroupBuy: true, showPersonalized: true, showBarterPool: true,
  showPersonalizedProducts: true, showPerformance: true, showVendors: true,
  showRestaurants: true, showBrands: true, showNewsletter: true,
  autoApproveListings: 'none', autoApproveOffers: 'none', shippingTiers: [],
};

@ApiTags('Settings Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class SettingsAdminController {
  constructor(
    @InjectModel('SystemSetting') private readonly settingModel: Model<ISystemSetting>,
    @InjectConnection() private readonly connection: Connection,
    private readonly auditLog: AuditLogService,
  ) {}

  @ApiOperation({ summary: 'Get system settings' })
  @Get()
  async getSettings() {
    const rows = await this.settingModel.find().lean();
    const data: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) data[row.key] = row.value;
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Update system settings' })
  @ApiBody({ type: UpdateSettingsDto })
  @Put()
  async updateSettings(
    @Body() dto: UpdateSettingsDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    const updates = Object.entries(dto).filter(([, v]) => v !== undefined);
    if (!updates.length) return { success: true, message: 'Değiştirilecek ayar bulunamadı' };

    const existing = await this.settingModel.find({ key: { $in: updates.map(([k]) => k) } }).lean();
    const oldValues = Object.fromEntries(existing.map(r => [r.key, r.value]));

    await Promise.all(updates.map(([key, value]) => {
      const newId = new Types.ObjectId().toString();
      return this.settingModel.findOneAndUpdate(
        { key },
        { $set: { value, updatedBy: admin.id }, $setOnInsert: { _id: newId, id: newId, key } },
        { upsert: true, setDefaultsOnInsert: true },
      );
    }));

    const newValues = Object.fromEntries(updates);
    await this.auditLog.log({
      actorId: admin.id, action: 'SYSTEM_SETTINGS_UPDATED',
      resourceType: 'SystemSetting', oldValue: oldValues, newValue: newValues,
    });

    return { success: true, message: 'Ayarlar güncellendi', data: newValues };
  }

  @ApiOperation({ summary: 'Ana sayfa ayarlarını getir' })
  @ApiQuery({ name: 'ecosystem', required: false })
  @Get('homepage')
  async getHomepageSettings(@Query('ecosystem') ecosystem?: string) {
    const key  = ecosystem ? `homepageSettings_${ecosystem.toUpperCase()}` : 'homepageSettings';
    const row  = await this.settingModel.findOne({ key }).lean();
    const saved = (row?.value ?? {}) as Record<string, unknown>;
    return { success: true, data: { ...HOMEPAGE_DEFAULTS, ...saved } };
  }

  @ApiOperation({ summary: 'Ana sayfa ayarlarını güncelle' })
  @ApiQuery({ name: 'ecosystem', required: false })
  @ApiBody({ type: UpdateHomepageSettingsDto })
  @Put('homepage')
  async updateHomepageSettings(
    @Body() dto: UpdateHomepageSettingsDto,
    @CurrentUser() admin: AuthenticatedUser,
    @Query('ecosystem') ecosystem?: string,
  ) {
    const key      = ecosystem ? `homepageSettings_${ecosystem.toUpperCase()}` : 'homepageSettings';
    const existing = await this.settingModel.findOne({ key }).lean();
    const oldValue = (existing?.value ?? {}) as Record<string, unknown>;
    const merged   = { ...oldValue, ...(dto as Record<string, unknown>) };

    const newId = new Types.ObjectId().toString();
    await this.settingModel.findOneAndUpdate(
      { key },
      { $set: { value: merged, updatedBy: admin.id }, $setOnInsert: { _id: newId, id: newId, key } },
      { upsert: true, setDefaultsOnInsert: true },
    );

    await this.auditLog.log({
      actorId: admin.id, action: 'HOMEPAGE_SETTINGS_UPDATED',
      resourceType: 'SystemSetting', resourceId: key,
      oldValue, newValue: merged,
    });

    return { success: true, message: 'Ana sayfa ayarları güncellendi', data: merged };
  }
}
