import { DomainEvent } from '@barterborsa/shared-core';

export class ShipmentCreatedEvent extends DomainEvent {
  constructor(
    public readonly shipmentId: string,
    public readonly shipmentNumber: string,
    public readonly orderId: string,
  ) {
    super(shipmentId);
  }

  get eventName(): string {
    return 'shipment.created';
  }
}
