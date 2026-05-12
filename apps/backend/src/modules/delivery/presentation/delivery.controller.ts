// apps/backend/src/modules/delivery/presentation/delivery.controller.ts

import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { DispatchCourierCommand } from '../application/commands/dispatch-courier.command';
import { MarkDeliveredCommand } from '../application/commands/mark-delivered.command';

interface AuthenticatedUser {
  id:   string;
  role: string;
}

@ApiTags('Delivery')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiOperation({ summary: 'Kurye ata — RESTAURANT siparişini kuryeye ver' })
  @Post('dispatch')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN')
  @UseGuards(RolesGuard)
  async dispatchCourier(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { orderId: string; courierId: string },
  ) {
    const data = await this.commandBus.execute(
      new DispatchCourierCommand(body.orderId, body.courierId, user.id),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Teslimat tamamlandı olarak işaretle' })
  @Post(':dispatchId/mark-delivered')
  @Roles('VENDOR', 'ADMIN', 'SUPER_ADMIN', 'COURIER')
  @UseGuards(RolesGuard)
  async markDelivered(
    @CurrentUser() user: AuthenticatedUser,
    @Param('dispatchId') dispatchId: string,
  ) {
    const data = await this.commandBus.execute(
      new MarkDeliveredCommand(dispatchId, user.id),
    );
    return { success: true, data };
  }

  @ApiOperation({ summary: 'Siparişin teslimat durumunu getir' })
  @Get('order/:orderId')
  async getDispatchByOrder(@Param('orderId') orderId: string) {
    // Placeholder — order controller'a yönlendirilebilir
    return { success: true, data: { orderId, status: 'PENDING_ASSIGN' } };
  }

  @ApiOperation({ summary: 'Kurye listesi (stub)' })
  @Get('couriers')
  async getCouriers() {
    // TODO: Gerçek kurye listesi — CourierUser tablosu veya harici servis
    return { success: true, data: [] };
  }
}