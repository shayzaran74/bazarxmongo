// apps/backend/src/modules/delivery/infrastructure/adapters/surat-cargo.adapter.ts
// Sürat Kargo adapter — ICargoProvider implementasyonu
// API Dökümanı: https://www.suratkargo.com.tr/entegrasyon
// Webhook signature: HMAC-SHA256

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICargoProvider, CargoTrackingResult, CargoTrackingEvent } from '../../domain/interfaces/ICargoProvider.interface';
import { CargoStatus } from '../../domain/enums/cargo-status.enum';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SuratCargoAdapter implements ICargoProvider {
  private readonly logger = new Logger(SuratCargoAdapter.name);
  readonly providerName = CargoProvider.SURAT_KARGO;

  private readonly API_BASE = process.env.SURAT_KARGO_API_URL || 'https://api.suratkargo.com';
  private readonly API_KEY = process.env.SURAT_KARGO_API_KEY || '';
  private readonly WEBHOOK_SECRET = process.env.SURAT_KARGO_WEBHOOK_SECRET || '';

  constructor(private readonly httpService: HttpService) {}

  async track(trackingNumber: string): Promise<CargoTrackingResult> {
    this.logger.log('Sürat Kargo takip başlatıldı', { trackingNumber });

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.API_BASE}/v1/track`, {
          params: { 'kargoTakipNo': trackingNumber },
          headers: {
            'X-Api-Key': this.API_KEY,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }),
      );

      const data = response.data as SuratTrackingResponse;
      return this.mapResponse(trackingNumber, data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('Sürat Kargo takip hatası', { trackingNumber, error: msg });

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
      this.logger.warn('Sürat webhook secret tanımlanmamış, doğrulama atlanıyor');
      return true;
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.WEBHOOK_SECRET)
      .update(payload, 'utf8')
      .digest('hex');

    return signature === expectedSignature;
  }

  private mapResponse(trackingNumber: string, data: SuratTrackingResponse): CargoTrackingResult {
    const events: CargoTrackingEvent[] = (data.movements ?? []).map(event => ({
      status: this.mapStatus(event.statusCode),
      description: event.description,
      location: event.city,
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
      estimatedDelivery: data.estimatedDeliveryDate ? new Date(data.estimatedDeliveryDate) : undefined,
    };
  }

  private mapStatus(suratStatus: string): CargoStatus {
    const statusMap: Record<string, CargoStatus> = {
      'KARGO_ALINDI': CargoStatus.PICKED_UP,
      'TRANSIT': CargoStatus.IN_TRANSIT,
      'DAĞITIMDA': CargoStatus.OUT_FOR_DELIVERY,
      'TESLIM_EDILDI': CargoStatus.DELIVERED,
      'İADE_KARGO': CargoStatus.RETURNED,
      'ANOMALI': CargoStatus.EXCEPTION,
      'BEKLEMEDE': CargoStatus.PENDING,
    };
    return statusMap[suratStatus.toUpperCase()] ?? CargoStatus.IN_TRANSIT;
  }
}

interface SuratTrackingResponse {
  trackingNumber?: string;
  statusCode?: string;
  estimatedDeliveryDate?: string;
  movements?: Array<{
    statusCode: string;
    description?: string;
    city?: string;
    date: string;
  }>;
}