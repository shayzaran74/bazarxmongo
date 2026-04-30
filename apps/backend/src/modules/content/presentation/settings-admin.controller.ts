import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IsBoolean, IsNumber, IsOptional, Min, Max } from 'class-validator';
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

interface AuthenticatedUser {
  id: string;
  role: string;
}

// Varsayılan ayarlar — DB boşsa bu değerler kullanılır
const DEFAULTS: Record<string, unknown> = {
  maintenanceMode:      false,
  allowRegistration:    true,
  defaultCommissionRate: 10,
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

    // Mevcut değerleri al (audit log için)
    const existingRows = await this.prisma.systemSetting.findMany({
      where: { key: { in: updates.map(([k]) => k) } },
    });
    const oldValues = Object.fromEntries(existingRows.map((r) => [r.key, r.value]));

    // Her ayarı upsert et
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
}
