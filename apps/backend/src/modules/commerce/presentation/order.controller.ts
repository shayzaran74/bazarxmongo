// apps/backend/src/modules/commerce/presentation/order.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetMyOrdersQuery } from '../application/queries/get-my-orders.query';
import { GetOrderDetailsQuery } from '../application/queries/get-order-details.query';
import { OpenOrderDisputeCommand } from '../application/commands/open-order-dispute.command';
import { MarkOrderPreparingCommand } from '../application/commands/mark-order-preparing.command';
import { MarkOrderReadyCommand } from '../application/commands/mark-order-ready.command';
import { DispatchCourierCommand } from '../../delivery/application/commands/dispatch-courier.command';
import { OpenDisputeDto } from './dto/open-dispute.dto';

interface AuthenticatedUser {
  id:   string;
  role: string;
}

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Get my orders' })
  @ApiResponse({ status: 200 })
  @Get()
  async getMyOrders(@CurrentUser() user: AuthenticatedUser) {
    const orders = await this.queryBus.execute(new GetMyOrdersQuery(user.id));
    return { success: true, data: orders };
  }

  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  async getOrder(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const order = await this.queryBus.execute(new GetOrderDetailsQuery(id, user.id));
    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'İtiraz (Dispute) aç' })
  @Post(':id/dispute')
  async openDispute(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.commandBus.execute(
      new OpenOrderDisputeCommand(id, user.id, dto.reason, dto.description, dto.evidenceUrls),
    );
  }

  // ─── BazarX Go — Restoran mutfak akışı ───────────────────────────────────

  @ApiOperation({ summary: 'Sipariş hazırlanmaya alındı (mutfağa) — RESTAURANT' })
  @Post(':id/mark-preparing')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async markPreparing(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const data = await this.commandBus.execute(new MarkOrderPreparingCommand(id, user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Sipariş hazır — kurye/teslim alma bekleniyor — RESTAURANT' })
  @Post(':id/mark-ready')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async markReady(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    const data = await this.commandBus.execute(new MarkOrderReadyCommand(id, user.id));
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Sipariş kuryeye verildi — RESTAURANT' })
  @Post(':id/dispatch')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async dispatchCourier(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string, @Body() body: { courierId: string }) {
    const data = await this.commandBus.execute(new DispatchCourierCommand(id, body.courierId, user.id));
    return { success: true, data };
  }
}
