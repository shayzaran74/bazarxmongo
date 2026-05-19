// apps/backend/src/modules/delivery/infrastructure/adapters/mng-cargo.adapter.ts
// MNG Kargo adapter — ICargoProvider implementasyonu
// API Dökümanı: MNG Kargo API entegratörleri (ePttArası, Trendargo, Kolaygelir)
// Webhook signature: HMAC-SHA256

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICargoProvider, CargoTrackingResult, CargoTrackingEvent } from '../../domain/interfaces/ICargoProvider.interface';
import { CargoStatus } from '../../domain/enums/cargo-status.enum';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class MngCargoAdapter implements ICargoProvider {
  private readonly logger = new Logger(MngCargoAdapter.name);
  readonly providerName = CargoProvider.MNG_KARGO;

  // MNG Kargo API base URL — entegratör (ePttArası / Trendargo) üzerinden
  private readonly API_BASE = process.env.MNG_KARGO_API_URL || 'https://api.mngkargo.com.tr';
  private readonly API_KEY = process.env.MNG_KARGO_API_KEY || '';
  private readonly WEBHOOK_SECRET = process.env.MNG_KARGO_WEBHOOK_SECRET || '';

  constructor(private readonly httpService: HttpService) {}

  async track(trackingNumber: string): Promise<CargoTrackingResult> {
    this.logger.log('MNG Kargo takip başlatıldı', { trackingNumber });

    try {
      // MNG Kargo entegratör API'si — ePttArası veya Trendargo formatı
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_BASE}/track`, {
          params: {
            trackingNumber,
            carrier: 'MNG',
          },
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      const data = response.data as MngTrackingResponse;
      return this.mapResponse(trackingNumber, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('MNG Kargo takip hatası', { trackingNumber, error: msg });

      // Fallback: Hata durumunda pending döner
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
    // HMAC-SHA256 signature doğrulaması
    // MNG Kargo webhook: signature = HMAC-SHA256(webhookSecret, requestBody)
    if (!this.WEBHOOK_SECRET) {
      this.logger.warn('MNG webhook secret tanımlanmamış, doğrulama atlanıyor');
      return true;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    const isValid = signature === expectedSignature;
    if (!isValid) {
      this.logger.warn('MNG webhook signature doğrulaması başarısız');
    }
    return isValid;
  }

  private mapResponse(trackingNumber: string, data: MngTrackingResponse): CargoTrackingResult {
    const events: CargoTrackingEvent[] = (data.events ?? []).map(event => ({
      status: this.mapStatus(event.status),
      description: event.description,
      location: event.location,
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
      estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
    };
  }

  private mapStatus(mngStatus: string): CargoStatus {
    // MNG Kargo API status mapping
    const statusMap: Record<string, CargoStatus> = {
      'PENDING': CargoStatus.PENDING,
      'PICKED_UP': CargoStatus.PICKED_UP,
      'IN_TRANSIT': CargoStatus.IN_TRANSIT,
      'OUT_FOR_DELIVERY': CargoStatus.OUT_FOR_DELIVERY,
      'DELIVERED': CargoStatus.DELIVERED,
      'RETURNED': CargoStatus.RETURNED,
      'EXCEPTION': CargoStatus.EXCEPTION,
      'CANCELLED': CargoStatus.RETURNED,
    };
    return statusMap[mngStatus.toUpperCase()] ?? CargoStatus.IN_TRANSIT;
  }
}

interface MngTrackingResponse {
  trackingNumber?: string;
  status?: string;
  events?: Array<{
    status: string;
    description?: string;
    location?: string;
    timestamp: string;
  }>;
  estimatedDelivery?: string;
}