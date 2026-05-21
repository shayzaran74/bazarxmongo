// apps/backend/src/modules/delivery/presentation/cargo-tracking.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '@barterborsa/shared-security';
import { CargoTrackingService } from '../application/services/cargo-tracking.service';
import { CargoProvider } from '../domain/enums/cargo-provider.enum';

@Controller('orders/:id/tracking')
@UseGuards(JwtAuthGuard)
export class CargoTrackingController {
  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  /**
   * GET /orders/:id/tracking
   * Siparişin kargo takip bilgilerini getir
   */
  @Get()
  async getTracking(@Param('id') orderId: string) {
    // TODO: Veritabanından siparişin cargo shipment'ını çek
    return { success: true, data: null };
  }

  /**
   * POST /orders/:id/tracking/ship
   * Satıcı kargo gönderisini kayıt eder
   */
  @Post('ship')
  @HttpCode(HttpStatus.CREATED)
  async createShipment(
    @Param('id') orderId: string,
    @Body() body: { provider: CargoProvider; trackingNumber: string },
    @Request() req: any,
  ) {
    try {
      const result = await this.cargoTrackingService.createShipment({
        orderId,
        provider: body.provider,
        trackingNumber: body.trackingNumber,
        vendorId: req.user.vendorId,
      });
      return { success: true, data: result };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      return { success: false, error: msg };
    }
  }
}

/**
 * Kargo firmalarından gelen webhook'ları karşılar
 */
@Controller('cargo/webhook/:provider')
export class CargoWebhookController {
  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Param('provider') provider: string,
    @Headers('x-signature') signature: string,
    @Body() body: Record<string, any>,
  ) {
    const cargoProvider = provider as CargoProvider;
    const payload = JSON.stringify(body);

    if (!this.cargoTrackingService.verifyWebhook(cargoProvider, payload, signature)) {
      return { success: false, error: 'Invalid signature' };
    }

    // TODO: Webhook payload'ını işle, shipment durumunu güncelle
    return { success: true };
  }
}

/**
 * Admin kargo yönetimi
 */
@Controller('admin/cargo')
@UseGuards(JwtAuthGuard)
export class AdminCargoController {
  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  @Get()
  async listAll(@Request() req: any) {
    // TODO: Tüm cargo shipments'ı listele (admin)
    return { success: true, data: { items: [], total: 0 } };
  }
}