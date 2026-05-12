// apps/backend/src/modules/delivery/application/workers/dispatch-notification.processor.ts
// RESTAURANT siparişi kuryeye atandığında async bildirim gönderir (BullMQ).

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
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
  constructor(
    @InjectQueue('delivery-dispatch') private readonly dispatchQueue: Queue,
  ) {
    super();
  }

  async process(job: Job<DispatchNotificationJob>): Promise<void> {
    const { dispatchId, orderId, restaurantName, customerName, customerPhone, pickupAddress } = job.data;

    // TODO: Gerçek bildirim mekanizması — SMS (Netgsm/Twilio), Push Notification (FCM), veya harici API
    // Şimdilik stub log:
    console.log(`[DeliveryDispatch] Kurye atandı. dispatchId=${dispatchId}, orderId=${orderId}`);
    console.log(`  → Restoran: ${restaurantName}`);
    console.log(`  → Alıcı: ${customerName} (${customerPhone})`);
    console.log(`  → Adres: ${pickupAddress}`);

    // RabbitMQ veya harici bildirim servisi burada çağrılır:
    // await this.notificationService.sendCourierNotification(courierId, { orderId, pickupAddress });
  }

  // Job başarısız olursa
  async failed(job: Job<DispatchNotificationJob> | undefined, error: Error): Promise<void> {
    if (!job) return;
    console.error(`[DeliveryDispatch] Bildirim başarısız. jobId=${job.id}, error=${error.message}`);
  }
}