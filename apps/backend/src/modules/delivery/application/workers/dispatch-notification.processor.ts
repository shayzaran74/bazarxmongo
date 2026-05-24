// apps/backend/src/modules/delivery/application/workers/dispatch-notification.processor.ts
// RESTAURANT siparişi kuryeye atandığında async bildirim gönderir (BullMQ).

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Logger } from '@nestjs/common';
import { DELIVERY_DISPATCH_QUEUE } from '@barterborsa/shared-queue';

export interface DispatchNotificationJob {
  dispatchId: string;
  orderId: string;
  restaurantName: string;
  pickupAddress: string;
  customerName: string;
  customerPhone: string;
  estimatedDeliveryMinutes: number;
}

@Processor('delivery-dispatch')
export class DispatchNotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(DispatchNotificationProcessor.name);

  constructor(
    @InjectQueue('delivery-dispatch') private readonly dispatchQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<DispatchNotificationJob>): Promise<void> {
    const { dispatchId, orderId, restaurantName, customerName, customerPhone, pickupAddress } = job.data;

    this.logger.warn('Kurye bildirim servisi henüz entegre edilmedi — SMS/Push gönderilmedi', {
      dispatchId,
      orderId,
      restaurantName,
      customerName,
      pickupAddress,
    });
  }

  // Job başarısız olursa
  async failed(job: Job<DispatchNotificationJob> | undefined, error: Error): Promise<void> {
    if (!job) return;
    this.logger.error('Kurye bildirim job\'u başarısız oldu', {
      jobId: job.id,
      dispatchId: job.data?.dispatchId,
      orderId: job.data?.orderId,
      error: error.message,
    });
  }
}