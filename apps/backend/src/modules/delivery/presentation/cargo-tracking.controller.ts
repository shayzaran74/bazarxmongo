// apps/backend/src/modules/delivery/presentation/cargo-tracking.controller.ts

import { CurrentUser } from '@barterborsa/shared-nest';
import {
  Controller, Get, Post, Body, Param, UseGuards,
  Headers, HttpCode, HttpStatus, Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CargoTrackingService } from '../application/services/cargo-tracking.service';
import { CargoProvider } from '../domain/enums/cargo-provider.enum';
import { DeliveryGrpcService } from '../grpc/delivery-grpc.service';
import { CargoShipment } from '@barterborsa/shared-persistence/schemas/backend/cargoShipment.schema';

interface AuthenticatedUser { id: string; role: string; vendorId?: string; }

@Controller('orders/:id/tracking')
@UseGuards(JwtAuthGuard)
export class CargoTrackingController {
  private readonly logger = new Logger(CargoTrackingController.name);

  constructor(
    private readonly cargoTrackingService: CargoTrackingService,
    private readonly deliveryGrpcService: DeliveryGrpcService,
  ) {}

  @Get()
  async getTracking(@Param('id') orderId: string) {
    try {
      const response = await this.deliveryGrpcService.getShipmentByOrder(orderId);
      return { success: true, data: response.shipments };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      return { success: false, error: msg };
    }
  }

  @Post('ship')
  @HttpCode(HttpStatus.CREATED)
  async createShipment(
    @Param('id') orderId: string,
    @Body() body: { provider: CargoProvider; trackingNumber: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    try {
      const result = await this.cargoTrackingService.createShipment({
        orderId,
        provider: body.provider,
        trackingNumber: body.trackingNumber,
        vendorId: user.vendorId ?? user.id,
      });
      return { success: true, data: result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      return { success: false, error: msg };
    }
  }
}

@Controller('cargo/webhook/:provider')
export class CargoWebhookController {
  private readonly logger = new Logger(CargoWebhookController.name);

  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('x-signature') signature: string,
    @Body() body: Record<string, unknown>,
  ) {
    const cargoProvider = provider as CargoProvider;
    const payload = JSON.stringify(body);

    if (!this.cargoTrackingService.verifyWebhook(cargoProvider, payload, signature)) {
      return { success: false, error: 'Invalid signature' };
    }

    const trackingNumber = (body.trackingNumber ?? body.tracking_number ?? body.barcode) as string | undefined;
    const rawStatus = (body.status ?? body.event) as string | undefined;

    if (!trackingNumber || !rawStatus) {
      this.logger.warn('Webhook payload eksik alan', { provider, body });
      return { success: false, error: 'trackingNumber ve status zorunlu' };
    }

    const adapter = this.cargoTrackingService.getAdapter(cargoProvider);
    const mappedStatus = adapter ? rawStatus : rawStatus;

    await CargoShipment.updateOne(
      { trackingNumber, provider: cargoProvider },
      {
        $set: { status: mappedStatus, updatedAt: new Date() },
        $push: { statusHistory: { status: mappedStatus, timestamp: new Date(), rawData: payload } },
        ...(mappedStatus === 'DELIVERED' ? { $set: { deliveredAt: new Date() } } : {}),
      },
    ).exec();

    this.logger.log('Webhook ile kargo durumu güncellendi', { trackingNumber, provider, status: mappedStatus });

    return { success: true };
  }
}

@Controller('admin/cargo')
@UseGuards(JwtAuthGuard)
export class AdminCargoController {
  async listAll(): Promise<{ success: boolean; data: { items: Record<string, unknown>[]; total: number } }> {
    const [items, total] = await Promise.all([
      CargoShipment.find().sort({ createdAt: -1 }).limit(100).lean().exec(),
      CargoShipment.countDocuments().exec(),
    ]);
    return { success: true, data: { items: items as unknown as Record<string, unknown>[], total } };
  }
}
