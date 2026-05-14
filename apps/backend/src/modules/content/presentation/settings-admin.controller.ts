// apps/backend/src/modules/content/presentation/settings-admin.controller.ts
import { Controller, Get, Put, Body, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IsBoolean, IsNumber, IsOptional, Min, Max, IsString, IsArray, ValidateNested, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '@barterborsa/shared-persistence';
import { AuditLogService } from '../../audit/application/audit-log.service';

class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;

  @IsOptional()
  @IsBoolean()
  allowRegistration?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  defaultCommissionRate?: number;
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
  @IsOptional() @IsIn(['none', 'verified_companies', 'all']) autoApproveListings?: string;
  @IsOptional() @IsIn(['none', 'verified_companies', 'all']) autoApproveOffers?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ShippingTierDto)
  shippingTiers?: ShippingTierDto[];
}

interface AuthenticatedUser {
  id: string;
  role: string;
}

// Varsayılan sistem ayarları — DB boşsa bu değerler kullanılır
const DEFAULTS: Record<string, unknown> = {
  maintenanceMode:      false,
  allowRegistration:    true,
  defaultCommissionRate: 10,
};

// Varsayılan ana sayfa ayarları
const HOMEPAGE_DEFAULTS: Record<string, unknown> = {
  siteName:             '',
  siteLogo:             '',
  showFlashSales:       true,
  showSpecialOffers:    true,
  showAds:              true,
  showHomeSlider:       true,
  showQuadCards:        true,
  showAuctions:         true,
  showLotteries:        true,
  showGroupBuy:         true,
  showPersonalized:     true,
  showBarterPool:       true,
  showPersonalizedProducts: true,
  showPerformance:      true,
  showVendors:          true,
  showRestaurants:      true,
  showBrands:           true,
  showNewsletter:       true,
  autoApproveListings:  'none',
  autoApproveOffers:    'none',
  shippingTiers:        [],
};

@ApiTags('Settings Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/settings')
export class SettingsAdminController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  @ApiOperation({ summary: 'Get system settings' })
  @Get()
  async getSettings() {
    const rows = await this.prisma.systemSetting.findMany();
    const data: Record<string, unknown> = { ...DEFAULTS };
    for (const row of rows) {
      data[row.key] = row.value;
    }
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
    if (updates.length === 0) {
      return { success: true, message: 'Değiştirilecek ayar bulunamadı' };
    }

    const existingRows = await this.prisma.systemSetting.findMany({
      where: { key: { in: updates.map(([k]) => k) } },
    });
    const oldValues = Object.fromEntries(existingRows.map((r) => [r.key, r.value]));

    await this.prisma.$transaction(
      updates.map(([key, value]) =>
        this.prisma.systemSetting.upsert({
          where: { key },
          create: { key, value: value as object, updatedBy: admin.id },
          update: { value: value as object, updatedBy: admin.id },
        }),
      ),
    );

    const newValues = Object.fromEntries(updates);

    await this.auditLog.log({
      actorId:      admin.id,
      action:       'SYSTEM_SETTINGS_UPDATED',
      resourceType: 'SystemSetting',
      oldValue:     oldValues,
      newValue:     newValues,
    });

    return { success: true, message: 'Ayarlar güncellendi', data: newValues };
  }

  // --- Ana Sayfa Ayarları ---

  @ApiOperation({ summary: 'Ana sayfa ayarlarını getir' })
  @ApiQuery({ name: 'ecosystem', required: false, description: 'Ekosistem kodu (BAZARX, TICARITAKAS, BARTERBORSA)' })
  @Get('homepage')
  async getHomepageSettings(@Query('ecosystem') ecosystem?: string) {
    // Ekosisteme özgü anahtar — yoksa genel
    const key = ecosystem ? `homepageSettings_${ecosystem.toUpperCase()}` : 'homepageSettings';

    const row = await this.prisma.systemSetting.findUnique({ where: { key } });
    const saved = (row?.value ?? {}) as Record<string, unknown>;

    const data = { ...HOMEPAGE_DEFAULTS, ...saved };
    return { success: true, data };
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
    const key = ecosystem ? `homepageSettings_${ecosystem.toUpperCase()}` : 'homepageSettings';

    // Mevcut değeri audit için oku
    const existing = await this.prisma.systemSetting.findUnique({ where: { key } });
    const oldValue = (existing?.value ?? {}) as Record<string, unknown>;

    // Gelen DTO'yu mevcut kayıtla birleştirerek upsert et
    const merged = { ...oldValue, ...(dto as Record<string, unknown>) };

    await this.prisma.systemSetting.upsert({
      where:  { key },
      create: { key, value: merged as object, updatedBy: admin.id },
      update: { value: merged as object, updatedBy: admin.id },
    });

    await this.auditLog.log({
      actorId:      admin.id,
      action:       'HOMEPAGE_SETTINGS_UPDATED',
      resourceType: 'SystemSetting',
      resourceId:   key,
      oldValue,
      newValue:     merged as Record<string, unknown>,
    });

    return { success: true, message: 'Ana sayfa ayarları güncellendi', data: merged };
  }
}
