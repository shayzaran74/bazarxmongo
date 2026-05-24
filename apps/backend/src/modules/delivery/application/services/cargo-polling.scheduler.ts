// apps/backend/src/modules/delivery/application/services/cargo-polling.scheduler.ts
// CargoPollingScheduler — 2 saatte bir kargo durumu polling (Master Plan §3.6)

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CargoTrackingService } from './cargo-tracking.service';
import { CargoShipment } from '@barterborsa/shared-persistence/schemas/backend/cargoShipment.schema';

const BATCH_SIZE = 50;

@Injectable()
export class CargoPollingScheduler {
  private readonly logger = new Logger(CargoPollingScheduler.name);

  constructor(private readonly cargoTrackingService: CargoTrackingService) {}

  @Cron('0 */2 * * *')
  async poll(): Promise<void> {
    this.logger.log('Kargo polling başladı');

    try {
      const shipments = await CargoShipment.find({
        status: { $in: ['CREATED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'] },
      })
        .sort({ lastPolledAt: 1 })
        .limit(BATCH_SIZE)
        .lean()
        .exec();

      if (shipments.length === 0) {
        this.logger.log('Polling: Takip edilecek aktif kargo yok');
        return;
      }

      this.logger.log(`Polling: ${shipments.length} kargo sorgulanacak`);

      let updatedCount = 0;
      for (const shipment of shipments) {
        try {
          const result = await this.cargoTrackingService.trackOrder(
            shipment.orderId,
            shipment.provider as Parameters<typeof this.cargoTrackingService.trackOrder>[1],
            shipment.trackingNumber,
          );

          const update: Record<string, unknown> = { lastPolledAt: new Date() };

          if (result.currentStatus && result.currentStatus !== shipment.status) {
            update.status = result.currentStatus;
            update.$push = {
              statusHistory: {
                status: result.currentStatus,
                timestamp: new Date(),
              },
            };
            if (result.currentStatus === 'DELIVERED') {
              update.deliveredAt = new Date();
            }
            updatedCount++;
          }

          await CargoShipment.updateOne({ id: shipment.id }, { $set: update }).exec();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
          this.logger.warn('Kargo polling tek shipment hatası', {
            shipmentId: shipment.id,
            trackingNumber: shipment.trackingNumber,
            error: msg,
          });
        }
      }

      this.logger.log(`Kargo polling tamamlandı: ${updatedCount}/${shipments.length} güncellendi`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Bilinmeyen hata';
      this.logger.error('CargoPollingScheduler poll hatası', { error: msg });
    }
  }
}
