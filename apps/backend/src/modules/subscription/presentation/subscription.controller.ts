// apps/backend/src/modules/subscription/presentation/subscription.controller.ts

import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { IsBoolean, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { SubscriptionTier } from '../../loyalty/domain/enums/loyalty.enums';
import { SubscribeUserCommand } from '../application/commands/subscribe-user.command';
import { UpgradeTierCommand } from '../application/commands/upgrade-tier.command';
import { DowngradeTierCommand } from '../application/commands/downgrade-tier.command';
import { CancelSubscriptionCommand } from '../application/commands/cancel-subscription.command';
import { GetMyMembershipQuery } from '../application/queries/get-my-membership.query';
import { GetAllPlansQuery } from '../application/queries/get-all-plans.query';
import { SubscriptionPricingService } from '../application/services/subscription-pricing.service';

interface AuthenticatedUser { id: string; role: string; }

class SubscribeDto {
  @IsEnum(SubscriptionTier) tier!: SubscriptionTier;
  @IsOptional() @IsBoolean() annual?: boolean;
}

class UpgradeTierDto {
  @IsEnum(SubscriptionTier) newTier!: SubscriptionTier;
  @IsOptional() @IsNumber() @Min(0) xpAmount?: number;
}

class DowngradeTierDto {
  @IsEnum(SubscriptionTier) newTier!: SubscriptionTier;
  @IsOptional() reason?: 'USER_REQUESTED' | 'PAYMENT_FAILED' | 'ADMIN_FORCED';
}

class MenuPriceCalcDto {
  @IsNumber() @Min(1) originalPrice!: number;
}

@ApiTags('Subscription')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    private readonly pricing:    SubscriptionPricingService,
  ) {}

  @ApiOperation({ summary: 'Tüm abonelik planlarını listele (public)' })
  @Get('plans')
  async getPlans() {
    const data = await this.queryBus.execute(new GetAllPlansQuery());
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Mevcut aboneliğimi ve menü haklarımı göster' })
  @Get('me')
  async getMyMembership(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.queryBus.execute(new GetMyMembershipQuery(user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Abonelik başlat' })
  @ApiBody({ type: SubscribeDto })
  @Post('subscribe')
  async subscribe(@CurrentUser() user: AuthenticatedUser, @Body() dto: SubscribeDto) {
    return this.commandBus.execute(new SubscribeUserCommand(user.id, dto.tier, dto.annual ?? false));
  }

  @ApiOperation({ summary: 'Tier yükselt (5× ciro koşulu + %50 nakit / %50 XP)' })
  @ApiBody({ type: UpgradeTierDto })
  @Post('upgrade')
  async upgrade(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpgradeTierDto) {
    return this.commandBus.execute(new UpgradeTierCommand(user.id, dto.newTier, dto.xpAmount ?? 0));
  }

  // Master Plan §2.7 — Tier düşürme: eski menü hakları 30 gün korunur (DOWNGRADE_GRACE)
  @ApiOperation({ summary: 'Tier düşür (eski menü hakları 30 gün geçerli kalır)' })
  @ApiBody({ type: DowngradeTierDto })
  @Post('downgrade')
  async downgrade(@CurrentUser() user: AuthenticatedUser, @Body() dto: DowngradeTierDto) {
    return this.commandBus.execute(new DowngradeTierCommand(user.id, dto.newTier, dto.reason ?? 'USER_REQUESTED'));
  }

  @ApiOperation({ summary: 'Aboneliği iptal et (30 gün downgrade koruması)' })
  @Post('cancel')
  async cancel(@CurrentUser() user: AuthenticatedUser) {
    return this.commandBus.execute(new CancelSubscriptionCommand(user.id));
  }

  @ApiOperation({ summary: 'Menü fiyatı hesapla (%8 hizmet + %20 KDV)' })
  @ApiBody({ type: MenuPriceCalcDto })
  @Post('menu-price-calc')
  async calcMenuPrice(@Body() dto: MenuPriceCalcDto) {
    const data = this.pricing.calculateMenuPrice(dto.originalPrice);
    return { success: true, data };
  }
}
