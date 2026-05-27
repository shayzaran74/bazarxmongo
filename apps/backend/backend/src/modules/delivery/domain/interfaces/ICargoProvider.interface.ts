// apps/backend/src/modules/delivery/domain/interfaces/ICargoProvider.interface.ts

import { CargoStatus } from '../enums/cargo-status.enum';

export interface CargoTrackingEvent {
  status: CargoStatus;
  description?: string;
  location?: string;
  timestamp: Date;
}

export interface CargoTrackingResult {
  trackingNumber: string;
  provider: string;
  events: CargoTrackingEvent[];
  estimatedDelivery?: Date;
  currentStatus: CargoStatus;
}

export interface ICargoProvider {
  readonly providerName: string;

  /**
   * Kargo takip numarası ile durum sorgula
   */
  track(trackingNumber: string): Promise<CargoTrackingResult>;

  /**
   * Webhook signature doğrulaması
   */
  verifyWebhook(payload: string, signature: string): boolean;
}