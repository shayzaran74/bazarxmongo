// apps/backend/src/modules/delivery/domain/repositories/delivery-dispatch.repository.interface.ts

import { DeliveryDispatch } from '../entities/delivery-dispatch.entity';

export interface IDeliveryDispatchRepository {
  findById(id: string): Promise<DeliveryDispatch | null>;
  findByOrderId(orderId: string): Promise<DeliveryDispatch | null>;
  save(dispatch: DeliveryDispatch): Promise<void>;
}