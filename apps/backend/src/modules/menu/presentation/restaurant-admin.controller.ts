// apps/backend/src/modules/menu/presentation/restaurant-admin.controller.ts

import { Controller, Post, Body, Get, Query, UseGuards, Param, Patch } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { PrismaService } from '@barterborsa/shared-persistence';
import { CreateRestaurantCommand, CreateRestaurantDto } from '../application/commands/create-restaurant.command';
import { CreateMenuCommand, CreateMenuDto } from '../application/commands/create-menu.command';
import { AdvanceLaunchPartnerPhaseCommand } from '../application/commands/advance-launch-partner-phase.command';
import { DistributeFreeMenuCommand } from '../application/commands/distribute-free-menu.command';
import { GetLaunchPartnersQuery } from '../application/queries/get-launch-partners.query';

interface AuthenticatedUser { id: string; role: string; }

@ApiTags('Menu Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('admin/menu')
export class RestaurantAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus:   QueryBus,
    private readonly prisma:     PrismaService,
  ) {}

  @ApiOperation({ summary: 'Restoran oluştur' })
  @Post('restaurants')
  async createRestaurant(
    @Body() dto: CreateRestaurantDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(new CreateRestaurantCommand(dto, admin.id));
  }

  @ApiOperation({ summary: 'Menü kartı oluştur' })
  @Post('menus')
  async createMenu(
    @Body() dto: CreateMenuDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(new CreateMenuCommand(dto, admin.id));
  }

  @ApiOperation({ summary: 'Restoran istatistikleri (toplam satış, kullanım)' })
  @Get('restaurants/:id/stats')
  async getRestaurantStats(@Param('id') id: string) {
    const [totalPurchases, totalRevenue, redemptions] = await Promise.all([
      this.prisma.menuPurchase.count({
        where: { menu: { restaurantId: id }, status: { not: 'CANCELLED' } },
      }),
      this.prisma.menuPurchase.aggregate({
        where: { menu: { restaurantId: id }, status: { not: 'CANCELLED' } },
        _sum:  { paidAmount: true },
      }),
      this.prisma.menuRedemption.count({
        where: { purchase: { menu: { restaurantId: id } } },
      }),
    ]);

    return {
      success: true,
      data: {
        totalPurchases,
        totalRevenue: Number(totalRevenue._sum.paidAmount ?? 0),
        totalRedemptions: redemptions,
      },
    };
  }

  @ApiOperation({ summary: 'Lansman ortağı oluştur (60 menü taahhüdü)' })
  @Post('launch-partners')
  async createLaunchPartner(
    @Body() body: { restaurantId: string; pledgedMenuCount?: number },
  ) {
    const lp = await this.prisma.launchPartner.create({
      data: {
        restaurantId:    body.restaurantId,
        pledgedMenuCount: body.pledgedMenuCount ?? 60,
        freeAdMonths:    1,
        phase:           'PHASE_1',
      },
    });
    return { success: true, data: lp };
  }

  @ApiOperation({ summary: 'Lansman ortağı listesi' })
  @Get('launch-partners')
  async getLaunchPartners(
    @Query('phase')  phase?: string,
    @Query('city')   city?:  string,
    @Query('page')   page?:  string,
    @Query('limit')  limit?: string,
  ) {
    const data = await this.queryBus.execute(
      new GetLaunchPartnersQuery({ phase, city, page: Number(page) || 1, limit: Number(limit) || 20 }),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Lansman ortağı fazını ilerlet (PHASE_1→2→3)' })
  @Patch('launch-partners/:restaurantId/advance-phase')
  async advancePhase(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { notes?: string },
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new AdvanceLaunchPartnerPhaseCommand(restaurantId, admin.id, body.notes),
    );
  }

  @ApiOperation({ summary: 'Ücretsiz menü dağıt (60 taahhütten)' })
  @Post('launch-partners/:restaurantId/distribute')
  async distributeMenus(
    @Param('restaurantId') restaurantId: string,
    @Body() body: { menuId: string; userIds: string[] },
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.commandBus.execute(
      new DistributeFreeMenuCommand(restaurantId, body.menuId, body.userIds, admin.id),
    );
  }
}
