// apps/backend/src/modules/menu/presentation/menu.controller.ts
// BazarX-GO QR sistemi, devir, rezervasyon ve sürpriz menü endpoint'leri

import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import {
  IsString, IsDateString, IsNumber, IsBoolean, IsArray,
  IsOptional, Min, Max, ValidateNested, IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetMyPurchasesQuery }   from '../application/queries/get-my-purchases.query';
import { PurchaseMenuCommand }   from '../application/commands/purchase-menu.command';
import { ActivateOneFreeCommand } from '../application/commands/activate-one-free.command';
import { TransferMenuCommand }   from '../application/commands/transfer-menu.command';
import { CreateReservationCommand } from '../application/commands/create-reservation.command';
import { UpdateSurpriseMenuCommand, SurpriseMenuTimeBlock } from '../application/commands/update-surprise-menu.command';
import { MenuUsageTrackerService } from '../application/services/menu-usage-tracker.service';

interface AuthenticatedUser { id: string; role: string }

class TransferDto {
  @IsString() toUserId!: string;
}

class ReservationDto {
  @IsString()     vendorId!:   string;
  @IsDateString() date!:       string;
  @IsString()     timeSlot!:   string;
  @IsInt() @Min(1) @Max(20) partySize!: number;
  @IsOptional() @IsString() note?: string;
}

class TimeBlockDto {
  @IsString() start!: string;
  @IsString() end!:   string;
}

class SurpriseMenuDto {
  @IsString()                               listingId!:    string;
  @IsBoolean()                              isActive!:     boolean;
  @IsArray() @ValidateNested({ each: true }) @Type(() => TimeBlockDto)
  activeHours!: TimeBlockDto[];
  @IsInt() @Min(1) @Max(100)                dailyQuota!:   number;
  @IsInt() @Min(100) @Max(5000)             radiusMeters!: number;
}

@ApiTags('Menu')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu')
export class MenuController {
  constructor(
    private readonly commandBus:   CommandBus,
    private readonly queryBus:     QueryBus,
    private readonly usageTracker: MenuUsageTrackerService,
  ) {}

  // ── QR Listesi & Kredi ────────────────────────────────────────────────────

  @ApiOperation({ summary: 'QR Cüzdanım — aktif QR\'lar + devir alanlar' })
  @Get('wallet')
  async getWallet(@CurrentUser() user: AuthenticatedUser, @Query('all') all?: string) {
    const data = await this.queryBus.execute(new GetMyPurchasesQuery(user.id, all !== 'true'));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Aktif QR\'larım (eski endpoint — geriye dönük uyumluluk)' })
  @Get('my-purchases')
  async getMyPurchases(@CurrentUser() user: AuthenticatedUser, @Query('all') all?: string) {
    const data = await this.queryBus.execute(new GetMyPurchasesQuery(user.id, all !== 'true'));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Aylık menü kredim' })
  @Get('my-credit')
  async getMyCredit(@CurrentUser() user: AuthenticatedUser) {
    return { success: true, data: await this.usageTracker.getRemainingCredit(user.id) };
  }

  // ── Satın Alma ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Menü satın al — tier kategori kontrolü + QR üretimi' })
  @Post('purchase/:listingId')
  async purchaseMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listingId') listingId: string,
  ) {
    return this.commandBus.execute(new PurchaseMenuCommand(user.id, listingId, true));
  }

  @ApiOperation({ summary: '1+1 bedava hakkını aktive et' })
  @Post('activate-one-free/:purchaseId')
  async activateOneFree(@CurrentUser() user: AuthenticatedUser, @Param('purchaseId') purchaseId: string) {
    return this.commandBus.execute(new ActivateOneFreeCommand(user.id, purchaseId));
  }

  // ── Menü Devir ────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'QR\'ı başka birine devret (§4 — geri alınamaz)' })
  @ApiBody({ type: TransferDto })
  @Post('transfer/:purchaseId')
  async transferMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('purchaseId') purchaseId: string,
    @Body() dto: TransferDto,
  ) {
    return this.commandBus.execute(new TransferMenuCommand(user.id, purchaseId, dto.toUserId));
  }

  // ── Rezervasyon ───────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'QR için rezervasyon oluştur (§9)' })
  @ApiBody({ type: ReservationDto })
  @Post('reservation/:purchaseId')
  async createReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('purchaseId') purchaseId: string,
    @Body() dto: ReservationDto,
  ) {
    return this.commandBus.execute(
      new CreateReservationCommand(
        user.id, purchaseId, dto.vendorId,
        new Date(dto.date), dto.timeSlot, dto.partySize, dto.note,
      ),
    );
  }

  // ── Sürpriz Menü — Vendor ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Sürpriz menü ayarlarını güncelle (vendor only)' })
  @ApiBody({ type: SurpriseMenuDto })
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @Put('surprise-menu')
  async updateSurpriseMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SurpriseMenuDto,
  ) {
    return this.commandBus.execute(
      new UpdateSurpriseMenuCommand(
        user.id, dto.listingId, dto.isActive,
        dto.activeHours as SurpriseMenuTimeBlock[],
        dto.dailyQuota, dto.radiusMeters,
      ),
    );
  }

  @ApiOperation({ summary: 'Aktif sürpriz menüler (public — konum bazlı)' })
  @Get('surprise-menus')
  async getActiveSurpriseMenus(@Query('vendorId') vendorId?: string) {
    // Basit liste — Sprint 4'te geofencing eklenecek
    const { SurpriseMenu } = require('@barterborsa/shared-persistence/schemas/backend/surpriseMenu.schema');
    const filter: Record<string, unknown> = { isActive: true };
    if (vendorId) filter.vendorId = vendorId;
    const items = await SurpriseMenu.find(filter).lean();
    return { success: true, data: items };
  }
}
