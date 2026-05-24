// apps/backend/src/modules/delivery/application/services/cargo-tracking.service.ts
// CargoTrackingService — Kargo takip servisi (Master Plan §3.6)
// ICargoProvider adapter pattern ile 4 kargo firması desteklenir

import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICargoProvider } from '../../domain/interfaces/ICargoProvider.interface';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';
import { CargoShipment } from '@barterborsa/shared-persistence/schemas/backend/cargoShipment.schema';

export interface ShipmentDto {
  orderId: string;
  provider: CargoProvider;
  trackingNumber: string;
  vendorId: string;
}

@Injectable()
export class CargoTrackingService {
  private readonly logger = new Logger(CargoTrackingService.name);
  private readonly adapters: Map<string, ICargoProvider> = new Map();

  constructor(
    @Inject('ICargoProvider_MNG') private readonly mngAdapter: ICargoProvider,
    @Inject('ICargoProvider_YURTICI') private readonly yurticiAdapter: ICargoProvider,
    @Inject('ICargoProvider_SURAT') private readonly suratAdapter: ICargoProvider,
    @Inject('ICargoProvider_TEX') private readonly texAdapter: ICargoProvider,
  ) {
    this.adapters.set(CargoProvider.MNG_KARGO, this.mngAdapter);
    this.adapters.set(CargoProvider.YURTICI_KARGO, this.yurticiAdapter);
    this.adapters.set(CargoProvider.SURAT_KARGO, this.suratAdapter);
    this.adapters.set(CargoProvider.TEX_KARGO, this.texAdapter);
  }

  /**
   * Kargo takip numarası ile durum sorgula
   */
  async trackOrder(orderId: string, provider: CargoProvider, trackingNumber: string) {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new Error(`Bilinmeyen kargo firması: ${provider}`);
    }

    const result = await adapter.track(trackingNumber);

    this.logger.log('Kargo takip sonucu', {
      orderId,
      provider,
      trackingNumber,
      currentStatus: result.currentStatus,
    });

    return result;
  }

  /**
   * Vendor kargo gönderisi oluşturur (gönderim anında)
   */
  async createShipment(dto: ShipmentDto): Promise<{ shipmentId: string }> {
    const shipmentId = `ship-${Date.now()}-${dto.orderId}`;

    await CargoShipment.create({
      _id: shipmentId,
      id: shipmentId,
      orderId: dto.orderId,
      vendorId: dto.vendorId,
      provider: dto.provider,
      trackingNumber: dto.trackingNumber,
      status: 'CREATED',
      statusHistory: [{ status: 'CREATED', timestamp: new Date() }],
    });

    this.logger.log('Kargo gönderisi oluşturuldu', {
      shipmentId,
      orderId: dto.orderId,
      provider: dto.provider,
      trackingNumber: dto.trackingNumber,
    });

    return { shipmentId };
  }

  /**
   * Webhook callback doğrulaması
   */
  verifyWebhook(provider: CargoProvider, payload: string, signature: string): boolean {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      return false;
    }
    return adapter.verifyWebhook(payload, signature);
  }

  getAdapter(provider: CargoProvider): ICargoProvider | undefined {
    return this.adapters.get(provider);
  }
}