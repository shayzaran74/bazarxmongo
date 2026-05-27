// apps/backend/src/modules/loyalty/presentation/mission-admin.controllers.ts

import {
  Controller, Get, Post, Put, Body, Param,
  UseGuards, NotFoundException,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser, Roles } from '@barterborsa/shared-nest';
import { JwtAuthGuard, RolesGuard } from '@barterborsa/shared-security';
import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import {
  IXpSpendingLimitRule, IXpDistributionRule, B2BTierValues, B2BTierType,
} from '@barterborsa/shared-persistence';
import { XpSourceType }             from '../domain/enums/loyalty.enums';
import { GetMissionsQuery }          from '../application/queries/get-missions.query';
import { GetUserMissionsQuery }      from '../application/queries/get-user-missions.query';
import { EarnXpCommand }             from '../application/commands/earn-xp.command';
import { ExpireXpBatchesCommand }    from '../application/commands/expire-xp-batches.command';

interface AuthenticatedUser { id: string; role: string }

// ── DTOs ─────────────────────────────────────────────────────────────────────

class UpsertDistributionRuleDto {
  @IsOptional() @IsString() id?: string;
  @IsString() name!: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsEnum(B2BTierValues) tier?: B2BTierType;
  @IsNumber() @Min(0) @Max(100) commissionPct!: number;
  @IsNumber() @Min(0) @Max(100) adPct!: number;
  @IsNumber() @Min(0) @Max(100) servicePct!: number;
  @IsNumber() @Min(0) priority!: number;
  @IsBoolean() isActive!: boolean;
}

class UpsertSpendingRuleDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsEnum(B2BTierValues) tier?: B2BTierType;
  @IsNumber() @Min(0) @Max(100) maxXpPerTransactionPct!: number;
  @IsNumber() @Min(0) monthlyVolumeThreshold!: number;
  @IsNumber() @Min(0) boostedDailyXpLimit!: number;
  @IsBoolean() isActive!: boolean;
}

const D = (v: number): Types.Decimal128 => Types.Decimal128.fromString(String(v));
const F = (v: Types.Decimal128 | undefined, fallback = 0): number =>
  parseFloat((v ?? Types.Decimal128.fromString(String(fallback))).toString());

// ── Mission Controller ────────────────────────────────────────────────────────

@ApiTags('Missions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('missions')
export class MissionController {
  constructor(private readonly queryBus: QueryBus) {}

  @ApiOperation({ summary: 'Tüm görevleri listele' })
  @Get()
  getAll() { return this.queryBus.execute(new GetMissionsQuery()); }

  @ApiOperation({ summary: 'Kendi görevlerimi listele' })
  @Get('my')
  getMy(@CurrentUser() user: AuthenticatedUser) {
    return this.queryBus.execute(new GetUserMissionsQuery(user.id));
  }
}

// ── Loyalty Admin Controller ──────────────────────────────────────────────────

@ApiTags('Loyalty Admin')
@ApiBearerAuth()
@Roles('ADMIN', 'SUPER_ADMIN')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin/loyalty')
export class LoyaltyAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    @InjectModel('XpSpendingLimitRule') private readonly spendingModel: Model<IXpSpendingLimitRule>,
    @InjectModel('XpDistributionRule')  private readonly distModel:     Model<IXpDistributionRule>,
  ) {}

  // ── XP Dağıtım Kuralları ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'XP dağıtım kurallarını listele' })
  @Get('distribution-rules')
  async listDistRules(): Promise<{ success: boolean; data: object[] }> {
    const items = await this.distModel.find().sort({ priority: -1 }).lean<IXpDistributionRule[]>();
    return {
      success: true,
      data: items.map(r => ({
        id:            r.id,
        name:          r.name ?? '',
        city:          r.city ?? '',
        tier:          (r as unknown as { tier?: string }).tier ?? '',
        commissionPct: Math.round(F(r.commissionRate) * 100),
        adPct:         Math.round(F(r.adSpendRate) * 100),
        servicePct:    Math.round(F(r.serviceRate) * 100),
        priority:      r.priority,
        isActive:      r.isActive,
      })),
    };
  }

  @ApiOperation({ summary: 'XP dağıtım kuralı oluştur veya güncelle' })
  @Post('distribution-rules')
  async upsertDistRule(@Body() dto: UpsertDistributionRuleDto): Promise<{ success: boolean }> {
    const fields = {
      name:             dto.name,
      city:             dto.city ?? '',
      tier:             dto.tier ?? '',
      commissionRate:   D(dto.commissionPct / 100),
      adSpendRate:      D(dto.adPct / 100),
      serviceRate:      D(dto.servicePct / 100),
      priority:         dto.priority,
      isActive:         dto.isActive,
    };

    if (dto.id) {
      const exists = await this.distModel.findOne({ id: dto.id });
      if (!exists) throw new NotFoundException('Kural bulunamadı');
      await this.distModel.updateOne({ id: dto.id }, { $set: fields });
    } else {
      const newId = new Types.ObjectId().toString();
      await this.distModel.create({ _id: newId, id: newId, ...fields });
    }
    return { success: true };
  }

  @ApiOperation({ summary: 'XP dağıtım kuralını güncelle' })
  @Put('distribution-rules/:id')
  async updateDistRule(
    @Param('id') id: string,
    @Body() dto: UpsertDistributionRuleDto,
  ): Promise<{ success: boolean }> {
    return this.upsertDistRule({ ...dto, id });
  }

  // ── XP Harcama Limitleri ──────────────────────────────────────────────────

  @ApiOperation({ summary: 'XP harcama limitlerini listele' })
  @Get('spending-rules')
  async listSpendingRules(): Promise<{ success: boolean; data: object[] }> {
    const items = await this.spendingModel.find().sort({ priority: -1 }).lean<IXpSpendingLimitRule[]>();
    return {
      success: true,
      data: items.map(r => ({
        id:                   r.id,
        tier:                 r.tier ?? '',
        maxXpPerTransactionPct: Math.round(F(r.maxSpendPercentage)),
        monthlyVolumeThreshold: F(r.monthlyVolumeLimit),
        boostedDailyXpLimit:    F(r.dailyLimit),
        isActive:              r.isActive,
      })),
    };
  }

  @ApiOperation({ summary: 'XP harcama limiti oluştur veya güncelle' })
  @Post('spending-rules')
  async upsertSpendingRule(@Body() dto: UpsertSpendingRuleDto): Promise<{ success: boolean }> {
    const fields = {
      tier:                dto.tier ?? '',
      maxSpendPercentage:  D(dto.maxXpPerTransactionPct),
      monthlyVolumeLimit:  D(dto.monthlyVolumeThreshold),
      dailyLimit:          D(dto.boostedDailyXpLimit),
      isActive:            dto.isActive,
    };

    if (dto.id) {
      const exists = await this.spendingModel.findOne({ id: dto.id });
      if (!exists) throw new NotFoundException('Limit kuralı bulunamadı');
      await this.spendingModel.updateOne({ id: dto.id }, { $set: fields });
    } else {
      const newId = new Types.ObjectId().toString();
      await this.spendingModel.create({ _id: newId, id: newId, priority: 0, ...fields });
    }
    return { success: true };
  }

  @ApiOperation({ summary: 'XP harcama limitini güncelle' })
  @Put('spending-rules/:id')
  async updateSpendingRule(
    @Param('id') id: string,
    @Body() dto: UpsertSpendingRuleDto,
  ): Promise<{ success: boolean }> {
    return this.upsertSpendingRule({ ...dto, id });
  }

  // ── Diğer Admin İşlemleri ─────────────────────────────────────────────────

  @ApiOperation({ summary: 'Kullanıcıya manuel XP tanımla' })
  @Post('grant-xp')
  grantXp(@Body() dto: { userId: string; amount: number; type: string }) {
    return this.commandBus.execute(new EarnXpCommand(dto.userId, dto.amount, dto.type as XpSourceType));
  }

  @ApiOperation({ summary: 'Süresi dolmuş XP batch\'lerini temizle' })
  @Post('expire-batches')
  expireBatches() {
    return this.commandBus.execute(new ExpireXpBatchesCommand());
  }
}
