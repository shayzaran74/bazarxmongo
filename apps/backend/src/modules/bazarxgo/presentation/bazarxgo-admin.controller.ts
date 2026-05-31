// apps/backend/src/modules/bazarxgo/presentation/bazarxgo-admin.controller.ts

import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Query } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Inject } from '@nestjs/common';
import { AdvanceGoOrderStatusCommand } from '../application/commands/advance-order-status.command';
import { IGoRestaurantRepository } from '../domain/repositories/go-restaurant.repository.interface';
import { IGoCampaignRepository } from '../domain/repositories/go-campaign.repository.interface';
import { IGoCouponRepository } from '../domain/repositories/go-coupon.repository.interface';
import { IGoOrderRepository } from '../domain/repositories/go-order.repository.interface';
import { IGoRestaurant, IGoCampaign, IGoCoupon } from '@barterborsa/shared-persistence';

interface AdminUser {
  id: string;
  role: string;
}

@ApiTags('BazarXGO — Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@Controller('go/admin')
export class BazarxgoAdminController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IGoRestaurantRepository') private readonly restaurantRepo: IGoRestaurantRepository,
    @Inject('IGoCampaignRepository') private readonly campaignRepo: IGoCampaignRepository,
    @Inject('IGoCouponRepository') private readonly couponRepo: IGoCouponRepository,
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
  ) {}

  // ── Restoran CRUD ─────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Tüm restoranlar (aktif + pasif)' })
  @Get('restaurants')
  async listAll(@CurrentUser() user: AdminUser): Promise<{ success: boolean; data: IGoRestaurant[] }> {
    const list = await this.restaurantRepo.findAll({});
    return { success: true, data: list };
  }

  @ApiOperation({ summary: '[Admin] Restoran oluştur' })
  @Post('restaurants')
  async createRestaurant(
    @CurrentUser() user: AdminUser,
    @Body() body: Omit<IGoRestaurant, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; data: IGoRestaurant }> {
    const created = await this.restaurantRepo.create(body);
    return { success: true, data: created };
  }

  @ApiOperation({ summary: '[Admin] Restoran güncelle' })
  @ApiParam({ name: 'id' })
  @Put('restaurants/:id')
  async updateRestaurant(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
    @Body() body: Partial<IGoRestaurant>,
  ): Promise<{ success: boolean; data: IGoRestaurant | null }> {
    const updated = await this.restaurantRepo.update(id, body);
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: '[Admin] Restoran sil' })
  @ApiParam({ name: 'id' })
  @Delete('restaurants/:id')
  async deleteRestaurant(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
  ): Promise<{ success: boolean }> {
    await this.restaurantRepo.delete(id);
    return { success: true };
  }

  // ── Kampanya CRUD ──────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Kampanya oluştur' })
  @Post('campaigns')
  async createCampaign(
    @CurrentUser() user: AdminUser,
    @Body() body: Omit<IGoCampaign, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; data: IGoCampaign }> {
    const created = await this.campaignRepo.create(body);
    return { success: true, data: created };
  }

  @ApiOperation({ summary: '[Admin] Kampanya güncelle' })
  @ApiParam({ name: 'id' })
  @Put('campaigns/:id')
  async updateCampaign(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
    @Body() body: Partial<IGoCampaign>,
  ): Promise<{ success: boolean; data: IGoCampaign | null }> {
    const updated = await this.campaignRepo.update(id, body);
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: '[Admin] Kampanya sil' })
  @ApiParam({ name: 'id' })
  @Delete('campaigns/:id')
  async deleteCampaign(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
  ): Promise<{ success: boolean }> {
    await this.campaignRepo.delete(id);
    return { success: true };
  }

  // ── Kupon CRUD ────────────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Kupon oluştur' })
  @Post('coupons')
  async createCoupon(
    @CurrentUser() user: AdminUser,
    @Body() body: Omit<IGoCoupon, '_id' | 'createdAt' | 'updatedAt'>,
  ): Promise<{ success: boolean; data: IGoCoupon }> {
    const created = await this.couponRepo.create(body);
    return { success: true, data: created };
  }

  @ApiOperation({ summary: '[Admin] Kupon güncelle' })
  @ApiParam({ name: 'id' })
  @Put('coupons/:id')
  async updateCoupon(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
    @Body() body: Partial<IGoCoupon>,
  ): Promise<{ success: boolean; data: IGoCoupon | null }> {
    const updated = await this.couponRepo.update(id, body);
    return { success: true, data: updated };
  }

  @ApiOperation({ summary: '[Admin] Kupon sil' })
  @ApiParam({ name: 'id' })
  @Delete('coupons/:id')
  async deleteCoupon(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
  ): Promise<{ success: boolean }> {
    await this.couponRepo.delete(id);
    return { success: true };
  }

  // ── Sipariş Yönetimi ──────────────────────────────────────────

  @ApiOperation({ summary: '[Admin] Sipariş durumunu ilerlet (simüle)' })
  @ApiParam({ name: 'id' })
  @Post('orders/:id/advance')
  async advanceOrder(
    @Param('id') id: string,
    @CurrentUser() user: AdminUser,
  ): Promise<{ success: boolean; status: string }> {
    return this.commandBus.execute(new AdvanceGoOrderStatusCommand(id, user.id));
  }

  @ApiOperation({ summary: '[Admin] Sipariş listesi' })
  @Get('orders')
  async listOrders(
    @CurrentUser() user: AdminUser,
    @Query('userId') userId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: unknown[]; meta: unknown }> {
    const p = parseInt(page ?? '1', 10) || 1;
    const l = parseInt(limit ?? '20', 10) || 20;

    if (userId) {
      const result = await this.orderRepo.findByUserId(userId, p, l);
      return {
        success: true,
        data: result.items,
        meta: { page: p, limit: l, total: result.total },
      };
    }

    // Tüm siparişler: repository üzerinden doğrudan — ileride findAll eklenebilir
    return { success: true, data: [], meta: { page: p, limit: l, total: 0 } };
  }
}
