// apps/backend/src/modules/delivery/infrastructure/adapters/tex-cargo.adapter.ts
// TEX Kargo adapter — ICargoProvider implementasyonu
// API Dökümanı: https://www.texkargo.com.tr/entegrasyon
// Webhook signature: HMAC-SHA256

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICargoProvider, CargoTrackingResult, CargoTrackingEvent } from '../../domain/interfaces/ICargoProvider.interface';
import { CargoStatus } from '../../domain/enums/cargo-status.enum';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TexCargoAdapter implements ICargoProvider {
  private readonly logger = new Logger(TexCargoAdapter.name);
  readonly providerName = CargoProvider.TEX_KARGO;

  private readonly API_BASE = process.env.TEX_KARGO_API_URL || 'https://api.texkargo.com';
  private readonly API_KEY = process.env.TEX_KARGO_API_KEY || '';
  private readonly WEBHOOK_SECRET = process.env.TEX_KARGO_WEBHOOK_SECRET || '';

  constructor(private readonly httpService: HttpService) {}

  async track(trackingNumber: string): Promise<CargoTrackingResult> {
    this.logger.log('TEX Kargo takip başlatıldı', { trackingNumber });

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_BASE}/cargo/track/${trackingNumber}`, {
          headers: {
            'Authorization': `Token ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      const data = response.data as TexTrackingResponse;
      return this.mapResponse(trackingNumber, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('TEX Kargo takip hatası', { trackingNumber, error: msg });

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
      this.logger.warn('TEX webhook secret tanımlanmamış, doğrulama atlanıyor');
      return true;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    return signature === expectedSignature;
  }

  private mapResponse(trackingNumber: string, data: TexTrackingResponse): CargoTrackingResult {
    const events: CargoTrackingEvent[] = (data.history ?? []).map(event => ({
      status: this.mapStatus(event.status),
      description: event.message,
      location: event.branch,
      timestamp: new Date(event.timestamp),
    }));

    const currentStatus = events.length > 0
      ? events[events.length - 1].status
      : CargoStatus.PENDING;

    return {
      trackingNumber,
      provider: this.providerName,
      currentStatus,
      events,
      estimatedDelivery: data.eta ? new Date(data.eta) : undefined,
    };
  }

  private mapStatus(texStatus: string): CargoStatus {
    const statusMap: Record<string, CargoStatus> = {
      'RECEIVED': CargoStatus.PICKED_UP,
      'IN_TRANSIT': CargoStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': CargoStatus.OUT_FOR_DELIVERY,
      'DELIVERED': CargoStatus.DELIVERED,
      'RETURNED': CargoStatus.RETURNED,
      'EXCEPTION': CargoStatus.EXCEPTION,
      'PENDING': CargoStatus.PENDING,
    };
    return statusMap[texStatus.toUpperCase()] ?? CargoStatus.IN_TRANSIT;
  }
}

interface TexTrackingResponse {
  trackingNumber?: string;
  status?: string;
  eta?: string;
  history?: Array<{
    status: string;
    message?: string;
    branch?: string;
    timestamp: string;
  }>;
}