// apps/backend/src/modules/menu/presentation/menu.controller.ts
// BazarX Go: Restoran + menü browsing artık vendor/listing modüllerinin sorumluluğunda.
// Bu controller yalnızca QR sistem akışı + abonelik kredisi içindir.

import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetMyPurchasesQuery } from '../application/queries/get-my-purchases.query';
import { PurchaseMenuCommand } from '../application/commands/purchase-menu.command';
import { ActivateOneFreeCommand } from '../application/commands/activate-one-free.command';
import { MenuUsageTrackerService } from '../application/services/menu-usage-tracker.service';

interface AuthenticatedUser {
  id:   string;
  role: string;
}

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(
    private readonly commandBus:   CommandBus,
    private readonly queryBus:     QueryBus,
    private readonly usageTracker: MenuUsageTrackerService,
  ) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aktif QR\'larım' })
  @Get('my-purchases')
  async getMyPurchases(
    @CurrentUser() user: AuthenticatedUser,
    @Query('all') all?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetMyPurchasesQuery(user.id, all !== 'true'),
    );
    return { success: true, data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Aylık menü kredim' })
  @Get('my-credit')
  async getMyCredit(@CurrentUser() user: AuthenticatedUser) {
    const data = await this.usageTracker.getRemainingCredit(user.id);
    return { success: true, data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Menü satın al (QR + 1+1 hak)' })
  @Post('purchase/:listingId')
  async purchaseMenu(
    @CurrentUser() user: AuthenticatedUser,
    @Param('listingId') listingId: string,
  ) {
    return this.commandBus.execute(new PurchaseMenuCommand(user.id, listingId, true));
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '1+1 bedava hakkını aktive et' })
  @Post('activate-one-free/:purchaseId')
  async activateOneFree(
    @CurrentUser() user: AuthenticatedUser,
    @Param('purchaseId') purchaseId: string,
  ) {
    return this.commandBus.execute(new ActivateOneFreeCommand(user.id, purchaseId));
  }
}
