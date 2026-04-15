import { IRepository } from '@barterborsa/shared-core';
import { Shipment } from '../entities/shipment.entity';

export interface IShipmentRepository extends IRepository<Shipment> {
  findByShipmentNumber(shipmentNumber: string): Promise<Shipment | null>;
  findByOrderId(orderId: string): Promise<Shipment[]>;
  findByBarterSessionId(sessionId: string): Promise<Shipment[]>;
}
