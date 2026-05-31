// apps/backend/src/modules/bazarxgo/presentation/bazarxgo-order.controller.ts

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { Inject } from '@nestjs/common';
import { PlaceGoOrderCommand } from '../application/commands/place-order.command';
import { CancelGoOrderCommand } from '../application/commands/cancel-order.command';
import { PlaceGoOrderDto } from '../application/dtos/place-order.dto';
import { IGoOrderRepository } from '../domain/repositories/go-order.repository.interface';
import { IGoOrder } from '@barterborsa/shared-persistence';

interface AuthenticatedUser {
  id: string;
  role: string;
  vendorId?: string;
}

interface DecimalLike { toString(): string }

function decimalToNum(v: DecimalLike): number {
  return Number(v.toString());
}

function serializeOrder(o: IGoOrder): unknown {
  return {
    id: o.id,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurantName,
    items: o.items.map(i => ({
      menuItemId: i.menuItemId,
      name: i.name,
      price: decimalToNum(i.price),
      qty: i.qty,
    })),
    mode: o.mode,
    subtotal: decimalToNum(o.subtotal),
    deliveryFee: decimalToNum(o.deliveryFee),
    discount: decimalToNum(o.discount),
    total: decimalToNum(o.total),
    couponCode: o.couponCode,
    status: o.status,
    estimatedMinutes: o.estimatedMinutes,
    addressLine: o.addressLine,
    createdAt: o.createdAt,
  };
}

@ApiTags('BazarXGO — Siparişler')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('go/orders')
export class BazarxgoOrderController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject('IGoOrderRepository') private readonly orderRepo: IGoOrderRepository,
  ) {}

  @ApiOperation({ summary: 'Sipariş oluştur' })
  @Post()
  async placeOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: PlaceGoOrderDto,
  ): Promise<unknown> {
    return this.commandBus.execute(
      new PlaceGoOrderCommand(
        user.id,
        dto.restaurantId,
        dto.mode,
        dto.items,
        dto.couponCode,
        dto.addressLine,
      ),
    );
  }

  @ApiOperation({ summary: 'Siparişlerim' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @Get()
  async myOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ success: boolean; data: unknown[]; meta: unknown }> {
    const p = parseInt(page ?? '1', 10) || 1;
    const l = parseInt(limit ?? '10', 10) || 10;
    const result = await this.orderRepo.findByUserId(user.id, p, l);
    return {
      success: true,
      data: result.items.map(serializeOrder),
      meta: { page: p, limit: l, total: result.total, totalPages: Math.ceil(result.total / l) },
    };
  }

  @ApiOperation({ summary: 'Siparişi iptal et (yalnızca hazırlanmadan önce)' })
  @ApiParam({ name: 'id' })
  @Post(':id/cancel')
  async cancelOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; status: string }> {
    return this.commandBus.execute(new CancelGoOrderCommand(id, user.id));
  }

  @ApiOperation({ summary: 'Sipariş detayı + takip durumu' })
  @ApiParam({ name: 'id' })
  @Get(':id')
  async getOrder(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ success: boolean; data: unknown | null }> {
    const order = await this.orderRepo.findById(id);
    // Başka kullanıcının siparişini gösterme
    if (!order || order.userId !== user.id) {
      return { success: false, data: null };
    }
    return { success: true, data: serializeOrder(order) };
  }
}
