// apps/backend/src/modules/menu/presentation/menu-admin.controller.ts
// BazarX-GO Sprint 3 — Admin: LaunchPartner, Revenue, Rezervasyon yönetimi

import { Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IsString, IsNumber, IsOptional, Min, Max, IsEnum } from 'class-validator';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import {
  ILaunchPartner, IMenuPurchase, IMenuReservation,
  LaunchPartnerPhase, LaunchPartnerPhaseType,
} from '@barterborsa/shared-persistence';
import { GetLaunchPartnersQuery }        from '../application/queries/get-launch-partners.query';
import { AdvanceLaunchPartnerPhaseCommand } from '../application/commands/advance-launch-partner-phase.command';

// ── DTOs ─────────────────────────────────────────────────────────────────────

class CreateLaunchPartnerDto {
  @IsString() vendorId!: string;
  @IsNumber() @Min(1) pledgedMenuCount!: number;
  @IsNumber() @Min(1) @Max(12) freeAdMonths!: number;
  @IsOptional() @IsString() notes?: string;
}

class ReservationActionDto {
  @IsEnum(['CONFIRMED', 'CANCELLED']) status!: 'CONFIRMED' | 'CANCELLED';
  @IsOptional() @IsString() vendorNote?: string;
}

// ── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Admin BazarX-GO')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/go')
export class MenuAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    @InjectModel('LaunchPartner')   private readonly partnerModel:     Model<ILaunchPartner>,
    @InjectModel('MenuPurchase')    private readonly purchaseModel:    Model<IMenuPurchase>,
    @InjectModel('MenuReservation') private readonly reservationModel: Model<IMenuReservation>,
  ) {}

  // ── LaunchPartner (Restoran Anlaşmaları) ─────────────────────────────────

  @ApiOperation({ summary: 'Lansman ortaklarını listele' })
  @Get('launch-partners')
  async listLaunchPartners(
    @Query('phase') phase?: string,
    @Query('city')  city?:  string,
    @Query('page')  page  = '1',
    @Query('limit') limit = '20',
  ) {
    const data = await this.queryBus.execute(
      new GetLaunchPartnersQuery({ phase: phase as LaunchPartnerPhaseType, city, page: +page, limit: +limit }),
    );
    return { success: true, ...data };
  }

  @ApiOperation({ summary: 'Yeni lansman ortağı ekle' })
  @Post('launch-partners')
  async createLaunchPartner(@Body() dto: CreateLaunchPartnerDto) {
    const existing = await this.partnerModel.findOne({ vendorId: dto.vendorId });
    if (existing) return { success: false, error: 'Bu satıcı zaten lansman ortağı olarak kayıtlı' };

    const newId = new Types.ObjectId().toString();
    const partner = await this.partnerModel.create([{
      _id:             newId,
      id:              newId,
      vendorId:        dto.vendorId,
      phase:           'PHASE_1',
      pledgedMenuCount:dto.pledgedMenuCount,
      distributedCount:0,
      freeAdMonths:    dto.freeAdMonths,
      adMonthsUsed:    0,
      startDate:       new Date(),
      notes:           dto.notes ?? '',
    }]);

    return { success: true, data: partner[0] };
  }

  @ApiOperation({ summary: 'Lansman ortağı fazını ilerlet (id = vendorId)' })
  @Put('launch-partners/:id/advance')
  async advanceLaunchPartnerPhase(
    @Param('id') id: string,
    @CurrentUser() admin: { id: string; role: string },
  ) {
    // AdvanceLaunchPartnerPhaseCommand(vendorId, adminId)
    const data = await this.commandBus.execute(new AdvanceLaunchPartnerPhaseCommand(id, admin.id));
    return { success: true, data };
  }

  // ── Revenue Dashboard ─────────────────────────────────────────────────────

  @ApiOperation({ summary: 'BazarX-GO kârlılık özeti' })
  @Get('revenue')
  async getRevenueDashboard(@Query('period') period = '30') {
    const days     = Math.min(365, Math.max(1, parseInt(period, 10)));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [purchaseAgg, reservationStats, activeCount, expiredCount] = await Promise.all([
      // Menü satış aggregation
      this.purchaseModel.aggregate([
        { $match: { createdAt: { $gte: fromDate }, status: { $nin: ['CANCELLED', 'REFUNDED'] } } },
        {
          $group: {
            _id:        null,
            totalCount: { $sum: 1 },
            totalPaid:  { $sum: { $toDouble: '$paidAmount' } },
            serviceFee: { $sum: { $toDouble: '$serviceFee' } },
            vatAmount:  { $sum: { $toDouble: '$vatAmount' } },
            byCategory: { $push: { cat: '$menuCategory', paid: { $toDouble: '$paidAmount' } } },
          },
        },
      ]),
      // Rezervasyon istatistikleri
      this.reservationModel.aggregate([
        { $match: { createdAt: { $gte: fromDate } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Aktif QR sayısı
      this.purchaseModel.countDocuments({ status: 'ACTIVE', qrExpiresAt: { $gt: new Date() } }),
      // Süresi dolmuş QR sayısı
      this.purchaseModel.countDocuments({ status: 'EXPIRED' }),
    ]);

    const agg = purchaseAgg[0] ?? { totalCount: 0, totalPaid: 0, serviceFee: 0, vatAmount: 0, byCategory: [] };

    // Kategori bazlı gelir dağılımı
    const catMap: Record<number, number> = {}
    for (const item of (agg.byCategory ?? [])) {
      const cat = item.cat ?? 6
      catMap[cat] = (catMap[cat] ?? 0) + (item.paid ?? 0)
    }

    // Rezervasyon özeti
    const resvMap: Record<string, number> = {}
    for (const r of reservationStats) { resvMap[r._id] = r.count }

    return {
      success: true,
      data: {
        period: days,
        sales: {
          totalCount:    agg.totalCount,
          totalRevenue:  Math.round(agg.totalPaid * 100) / 100,
          serviceFeeRev: Math.round(agg.serviceFee * 100) / 100,
          vatCollected:  Math.round(agg.vatAmount * 100) / 100,
          netRevenue:    Math.round((agg.serviceFee - agg.vatAmount) * 100) / 100,
        },
        qrStats: {
          active:  activeCount,
          expired: expiredCount,
        },
        reservations: {
          pending:   resvMap['PENDING']   ?? 0,
          confirmed: resvMap['CONFIRMED'] ?? 0,
          cancelled: resvMap['CANCELLED'] ?? 0,
          completed: resvMap['COMPLETED'] ?? 0,
        },
        byCategory: catMap,
      },
    };
  }

  // ── Rezervasyon Yönetimi ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'Tüm rezervasyonları listele' })
  @Get('reservations')
  async listReservations(
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
    @Query('page')   page  = '1',
    @Query('limit')  limit = '20',
  ) {
    const skip   = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const filter: Record<string, unknown> = {};
    if (status)   filter.status   = status;
    if (vendorId) filter.vendorId = vendorId;

    const [items, total] = await Promise.all([
      this.reservationModel.find(filter).skip(skip).limit(parseInt(limit, 10)).sort({ createdAt: -1 }).lean(),
      this.reservationModel.countDocuments(filter),
    ]);

    return { success: true, data: items, total, page: +page, limit: +limit };
  }

  @ApiOperation({ summary: 'Rezervasyon onayla veya iptal et' })
  @Patch('reservations/:id')
  async updateReservation(@Param('id') id: string, @Body() dto: ReservationActionDto) {
    const update: Record<string, unknown> = {
      status:     dto.status,
      vendorNote: dto.vendorNote ?? '',
    };
    if (dto.status === 'CONFIRMED') update.confirmedAt = new Date();
    if (dto.status === 'CANCELLED') update.cancelledAt = new Date();

    const result = await this.reservationModel.findOneAndUpdate(
      { id },
      { $set: update },
      { new: true },
    );
    return { success: true, data: result };
  }
}
