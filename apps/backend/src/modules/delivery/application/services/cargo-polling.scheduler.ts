// apps/backend/src/modules/delivery/application/services/cargo-polling.scheduler.ts
// CargoPollingScheduler — 2 saatte bir kargo durumu polling (Master Plan §3.6)
// BullMQ repeatable job olarak çalışır

import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { CargoTrackingService } from './cargo-tracking.service';
import { CargoProvider } from '../../domain/enums/cargo-provider.enum';

const POLL_INTERVAL_MS = 2 * 60 * 60 * 1000; // 2 saat
const BATCH_SIZE = 50;

@Injectable()
export class CargoPollingScheduler implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(CargoPollingScheduler.name);
  private intervalHandle: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  onApplicationBootstrap(): void {
    setTimeout(() => {
      void this.poll();
      this.intervalHandle = setInterval(() => void this.poll(), POLL_INTERVAL_MS);
    }, 30_000); // Sistem yüklenene kadar 30 saniye bekle
    this.logger.log('CargoPollingScheduler başlatıldı (2 saat periyot)');
  }

  onModuleDestroy(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  async poll(): Promise<void> {
    try {
      this.logger.log('Kargo polling başladı');
      // TODO: Veritabanından PENDING/IN_TRANSIT durumundaki shipment'ları çek
      // Her biri için adapter.track() çağır ve durumu güncelle
      this.logger.log('Kargo polling tamamlandı');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('CargoPollingScheduler poll hatası', { error: msg });
    }
  }
}