// apps/backend/src/modules/delivery/presentation/delivery.controller.ts

import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard, RolesGuard, Roles } from '@barterborsa/shared-security';
import { Public } from '@barterborsa/shared-security';
import { CurrentUser } from '@barterborsa/shared-nest';
import { DispatchCourierCommand } from '../application/commands/dispatch-courier.command';
import { MarkDeliveredCommand } from '../application/commands/mark-delivered.command';

// Şehir bazlı kargo tahmini — gerçek kargo API'sine kadar statik lookup
const DELIVERY_DAYS: Record<string, number> = {
  'İstanbul': 1, 'Ankara': 1, 'İzmir': 1, 'Bursa': 1, 'Antalya': 2,
  'Adana': 2, 'Konya': 2, 'Gaziantep': 2, 'Mersin': 2, 'Kocaeli': 1,
  'Diyarbakır': 3, 'Samsun': 2, 'Kayseri': 2, 'Eskişehir': 2, 'Trabzon': 3,
  'Erzurum': 3, 'Van': 4, 'Hakkari': 4, 'Şırnak': 4, 'Artvin': 3,
};

function estimateDays(city: string): number {
  const normalized = (city || '').trim();
  return DELIVERY_DAYS[normalized] ?? 3;
}

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

  @Public()
  @ApiOperation({ summary: 'Şehire göre kargo tahmini' })
  @ApiQuery({ name: 'city', required: true })
  @ApiQuery({ name: 'district', required: false })
  @Get('estimate')
  getShippingEstimate(
    @Query('city') city: string,
    @Query('district') district?: string,
  ) {
    const days = estimateDays(city);
    const today = new Date();
    const estimatedDate = new Date(today);
    estimatedDate.setDate(today.getDate() + days);
    return {
      success: true,
      data: {
        city: city || '',
        district: district || '',
        estimatedDays: days,
        estimatedDate: estimatedDate.toISOString().split('T')[0],
        carrier: days <= 1 ? 'Aynı Gün / Ertesi Gün' : `${days} İş Günü`,
        freeShipping: true,
        freeShippingThreshold: 500,
      },
    };
  }

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