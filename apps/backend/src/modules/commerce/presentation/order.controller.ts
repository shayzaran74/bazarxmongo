// apps/backend/src/modules/commerce/presentation/order.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, NotFoundException } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { GetMyOrdersQuery } from '../application/queries/get-my-orders.query';
import { GetOrderDetailsQuery } from '../application/queries/get-order-details.query';
import { OpenOrderDisputeCommand } from '../application/commands/open-order-dispute.command';
import { OpenDisputeDto } from './dto/open-dispute.dto';

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
  async getMyOrders(@CurrentUser() user: any) {
    const orders = await this.queryBus.execute(new GetMyOrdersQuery(user.id));
    return { success: true, data: orders };
  }

  @ApiOperation({ summary: 'Get order details' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'Sipariş bulunamadı' })
  @Get(':id')
  async getOrder(@CurrentUser() user: any, @Param('id') id: string) {
    const order = await this.queryBus.execute(new GetOrderDetailsQuery(id, user.id));
    return { success: true, data: order };
  }

  @ApiOperation({ summary: 'İtiraz (Dispute) aç' })
  @Post(':id/dispute')
  async openDispute(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: OpenDisputeDto,
  ) {
    return this.commandBus.execute(
      new OpenOrderDisputeCommand(id, user.id, dto.reason, dto.description, dto.evidenceUrls),
    );
  }
}
