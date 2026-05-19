// apps/backend/src/modules/delivery/infrastructure/persistence/mappers/delivery-dispatch.mapper.ts

import { DeliveryDispatch, DeliveryDispatchProps } from '../../../domain/entities/delivery-dispatch.entity';
import { DispatchStatus } from '../../../domain/enums/dispatch-status.enum';

export class DeliveryDispatchMapper {
  static toDomain(doc: any): DeliveryDispatch {
    return DeliveryDispatch.fromPersistence({
      orderId: doc.orderId,
      courierId: doc.courierId,
      status: doc.status as DispatchStatus,
      pickedUpAt: doc.pickedUpAt,
      deliveredAt: doc.deliveredAt,
      recipientName: doc.recipientName,
      recipientPhone: doc.recipientPhone,
      notes: doc.notes,
    }, doc.id);
  }

  static toPersistence(entity: DeliveryDispatch): any {
    const snap = entity.toSnapshot();
    return {
      id: snap.id || entity.id.toString(),
      orderId: snap.orderId,
      courierId: snap.courierId,
      status: snap.status,
      pickedUpAt: snap.pickedUpAt,
      deliveredAt: snap.deliveredAt,
      recipientName: snap.recipientName,
      recipientPhone: snap.recipientPhone,
      notes: snap.notes,
    };
  }
}