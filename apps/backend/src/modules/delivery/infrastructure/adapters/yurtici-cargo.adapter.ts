// apps/backend/src/modules/delivery/infrastructure/adapters/yurtici-cargo.adapter.ts
// Yurtiçi Kargo adapter — ICargoProvider implementasyonu
// API Dökümanı: Yurtiçi Kargo API entegratörleri
// Webhook signature: HMAC-SHA256

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICargoProvider, CargoTrackingResult, CargoTrackingEvent } from '../../domain/interfaces/ICargoProvider.interface';
import { CargoStatus } from '../../domain/enums/cargo-status.enum';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class YurticiCargoAdapter implements ICargoProvider {
  private readonly logger = new Logger(YurticiCargoAdapter.name);
  readonly providerName = CargoProvider.YURTICI_KARGO;

  private readonly API_BASE = process.env.YURTICI_KARGO_API_URL || 'https://api.yurticikargo.com';
  private readonly API_KEY = process.env.YURTICI_KARGO_API_KEY || '';
  private readonly WEBHOOK_SECRET = process.env.YURTICI_KARGO_WEBHOOK_SECRET || '';

  constructor(private readonly httpService: HttpService) {}

  async track(trackingNumber: string): Promise<CargoTrackingResult> {
    this.logger.log('Yurtiçi Kargo takip başlatıldı', { trackingNumber });

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_BASE}/cargo/track`, {
          params: { trackingNumber },
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      const data = response.data as YurticiTrackingResponse;
      return this.mapResponse(trackingNumber, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Yurtiçi Kargo takip hatası', { trackingNumber, error: msg });

      return {
        trackingNumber,
        provider: this.providerName,
        currentStatus: CargoStatus.PENDING,
        events: [{
          status: CargoStatus.PENDING,
          description: 'Kargo bilgisi alınamadı',
          timestamp: new Date(),
        }],
      };
    }
  }

  verifyWebhook(payload: string, signature: string): boolean {
    if (!this.WEBHOOK_SECRET) {
      this.logger.warn('Yurtiçi webhook secret tanımlanmamış, doğrulama atlanıyor');
      return true;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    const isValid = signature === expectedSignature;
    if (!isValid) {
      this.logger.warn('Yurtiçi webhook signature doğrulaması başarısız');
    }
    return isValid;
  }

  private mapResponse(trackingNumber: string, data: YurticiTrackingResponse): CargoTrackingResult {
    const events: CargoTrackingEvent[] = (data.shipments ?? []).map(event => ({
      status: this.mapStatus(event.status),
      description: event.description,
      location: event.city || event.area,
      timestamp: new Date(event.date),
    }));

    const currentStatus = events.length > 0
      ? events[events.length - 1].status
      : CargoStatus.PENDING;

    return {
      trackingNumber,
      provider: this.providerName,
      currentStatus,
      events,
      estimatedDelivery: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
    };
  }

  private mapStatus(yurticiStatus: string): CargoStatus {
    const statusMap: Record<string, CargoStatus> = {
      'TESLIM_ALINDI': CargoStatus.PICKED_UP,
      'YOLDA': CargoStatus.IN_TRANSIT,
      'DAĞITIMDA': CargoStatus.OUT_FOR_DELIVERY,
      'TESLIM_EDILDI': CargoStatus.DELIVERED,
      'İADE': CargoStatus.RETURNED,
      'HASAR': CargoStatus.EXCEPTION,
      'BEKLIYOR': CargoStatus.PENDING,
    };
    return statusMap[yurticiStatus.toUpperCase()] ?? CargoStatus.IN_TRANSIT;
  }
}

interface YurticiTrackingResponse {
  status?: string;
  deliveryDate?: string;
  shipments?: Array<{
    status: string;
    description?: string;
    city?: string;
    area?: string;
    date: string;
  }>;
}