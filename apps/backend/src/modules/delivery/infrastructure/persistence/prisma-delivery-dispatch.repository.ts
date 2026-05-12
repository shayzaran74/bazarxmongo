// apps/backend/src/modules/delivery/infrastructure/persistence/prisma-delivery-dispatch.repository.ts

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@barterborsa/shared-persistence';
import { IDeliveryDispatchRepository } from '../../domain/repositories/delivery-dispatch.repository.interface';
import { DeliveryDispatch, DeliveryDispatchProps } from '../../domain/entities/delivery-dispatch.entity';
import { DispatchStatus } from '../../domain/enums/dispatch-status.enum';

@Injectable()
export class PrismaDeliveryDispatchRepository implements IDeliveryDispatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DeliveryDispatch | null> {
    const record = await this.prisma.deliveryDispatch.findUnique({ where: { id } });
    if (!record) return null;
    return DeliveryDispatch.fromPersistence(this.toProps(record), record.id);
  }

  async findByOrderId(orderId: string): Promise<DeliveryDispatch | null> {
    const record = await this.prisma.deliveryDispatch.findUnique({ where: { orderId } });
    if (!record) return null;
    return DeliveryDispatch.fromPersistence(this.toProps(record), record.id);
  }

  async save(dispatch: DeliveryDispatch): Promise<void> {
    const snap = dispatch.toSnapshot();
    const data: any = {
      id:        snap.id || undefined,
      orderId:   snap.orderId,
      courierId:  snap.courierId,
      status:    snap.status,
      pickedUpAt:  snap.pickedUpAt,
      deliveredAt:  snap.deliveredAt,
    };

    await this.prisma.deliveryDispatch.upsert({
      where: { id: snap.id || '' },
      create: data,
      update: data,
    });
  }

  private toProps(record: any): DeliveryDispatchProps {
    return {
      orderId:    record.orderId,
      courierId:  record.courierId,
      status:    record.status as DispatchStatus,
      pickedUpAt: record.pickedUpAt ?? undefined,
      deliveredAt: record.deliveredAt ?? undefined,
    };
  }
}