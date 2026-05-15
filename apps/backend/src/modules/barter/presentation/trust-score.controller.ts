// apps/backend/src/modules/barter/presentation/trust-score.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { GetVendorTrustScoreQuery } from '../application/queries/get-vendor-trust-score.query';
import { RecordTrustViolationCommand, ViolationType } from '../application/commands/record-trust-violation.command';
import { TrustScoreCalculatorService } from '../application/services/trust-score-calculator.service';
import { WatchtowerService } from '../application/services/watchtower.service';
import { B2BXpRulesService, B2BXpUsageType } from '../application/services/b2b-xp-rules.service';
import { OffboardVendorCommand } from '../application/commands/offboard-vendor.command';

interface AuthenticatedUser { id: string; role: string; }

@ApiTags('TrustScore')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trust-score')
export class TrustScoreController {
  constructor(
    private readonly commandBus:  CommandBus,
    private readonly queryBus:    QueryBus,
    private readonly prisma:      PrismaService,
    private readonly calculator:  TrustScoreCalculatorService,
    private readonly watchtower:  WatchtowerService,
    private readonly b2bXp:       B2BXpRulesService,
  ) {}

  // ─── Vendor kendi TrustScore'unu görür ──────────────────────────────────

  @ApiOperation({ summary: 'Kendi TrustScore ve tier bilgisi' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Get('me')
  async getMyTrustScore(@CurrentUser() user: AuthenticatedUser) {
    const vendor = await this.prisma.vendor.findFirst({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!vendor) return { success: false, message: 'Vendor bulunamadı' };

    const data = await this.queryBus.execute(new GetVendorTrustScoreQuery(vendor.id));
    return { success: true, data };
  }

  // ─── B2B XP kullanım hakkı sorgusu ──────────────────────────────────────

  @ApiOperation({ summary: 'B2B XP kullanım hakkı hesapla (50/25/25 kuralı)' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('xp-allowance')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        type:             { type: 'string', enum: ['COMMISSION', 'ADVERTISING', 'POOL_DEPOSIT'] },
        commissionAmount: { type: 'number' },
        quotaAmount:      { type: 'number' },
      },
      required: ['type'],
    },
  })
  async getXpAllowance(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { type: B2BXpUsageType; commissionAmount?: number; quotaAmount?: number },
  ) {
    const data = await this.b2bXp.calculateAllowance(
      user.id,
      body.type,
      body.commissionAmount,
      body.quotaAmount,
    );
    return { success: true, data };
  }

  // ─── Admin endpoint'leri ─────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Vendor TrustScore görüntüle' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/:vendorId')
  async getAdminTrustScore(@Param('vendorId') vendorId: string) {
    const data = await this.queryBus.execute(new GetVendorTrustScoreQuery(vendorId));
    return { success: true, data };
  }

  @ApiOperation({ summary: '[Admin] İhlal kaydet (uyarı/ceza/dondurma)' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/:vendorId/violation')
  async recordViolation(
    @Param('vendorId') vendorId: string,
    @Body() body: { violationType: ViolationType; description: string },
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new RecordTrustViolationCommand(vendorId, body.violationType, body.description, admin.id),
    );
  }

  @ApiOperation({ summary: '[Admin] TrustScore manuel yeniden hesapla' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Post('admin/:vendorId/recalculate')
  async recalculate(@Param('vendorId') vendorId: string) {
    const data = await this.calculator.recalculate(vendorId);
    return { success: true, data };
  }

  @ApiOperation({ summary: '[Admin] Watchtower bayraklarını listele' })
  @Roles('ADMIN', 'SUPER_ADMIN')
  @Get('admin/watchtower/flags')
  async getWatchtowerFlags(
    @Query('vendorId') vendorId?: string,
    @Query('limit') limit?: string,
  ) {
    const data = await this.watchtower.getFlags(vendorId, Number(limit) || 50);
    return { success: true, data };
  }

  // Master Plan v4.3 §3.4 — Çıkış mekanizması
  // Vendor sistemi terk ederken XP komisyon payı 90 gün korunur, kalan silinir.
  @ApiOperation({ summary: 'B2B sistemden çık — 90 gün XP koruma aktif edilir' })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Post('offboard')
  async offboardVendor(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { vendorId?: string; reason?: string },
  ) {
    // Vendor kendi çıkışını yapabilir veya admin başkası için yapabilir
    const targetVendorId = body.vendorId ?? (
      await this.prisma.vendor.findFirst({ where: { userId: user.id }, select: { id: true } })
    )?.id;

    if (!targetVendorId) {
      return { success: false, message: 'Vendor bulunamadı' };
    }

    // Sadece admin başkası için çıkış yapabilir
    if (body.vendorId && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return { success: false, message: 'Başka vendor için çıkış yapma yetkiniz yok.' };
    }

    const result = await this.commandBus.execute(
      new OffboardVendorCommand(user.id, targetVendorId, body.reason),
    );
    return { success: true, data: result };
  }
}
