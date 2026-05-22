import { AggregateRoot, Result, Ok, Err } from '@barterborsa/shared-core';
import { ShipmentStatus } from '../enums/shipment-status.enum';
import { ShipmentType } from '../enums/shipment-type.enum';
import { ShippingAddress } from '../value-objects/shipping-address.vo';
import { CarrierInfo } from '../value-objects/carrier-info.vo';
import { Dimensions } from '../value-objects/dimensions.vo';
import { ShipmentCreatedEvent } from '../events/shipment-created.event';

export interface ShipmentProps {
  shipmentNumber: string;
  type: ShipmentType;
  status: ShipmentStatus;
  orderId: string;
  senderId: string;
  receiverId: string;
  vendorId: string;
  senderAddress: ShippingAddress;
  receiverAddress: ShippingAddress;
  packageInfo?: Dimensions;
  carrierInfo?: CarrierInfo;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  shippingCost?: number;
  currency?: string;
  notes?: string;
  barterSessionId?: string;
  barterPartNumber?: number;
  // Audit dates
  pickedUpAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
}

export class Shipment extends AggregateRoot<ShipmentProps> {
  private constructor(props: ShipmentProps, id?: string) {
    super(props, id);
  }

  public static create(props: Omit<ShipmentProps, 'status'>, id?: string): Result<Shipment> {
    const shipment = new Shipment({
      ...props,
      status: ShipmentStatus.PENDING,
    }, id);

    if (!id) {
      shipment.addDomainEvent(new ShipmentCreatedEvent(shipment.id, shipment.shipmentNumber, shipment.orderId));
    }

    return Ok(shipment);
  }

  public assignCarrier(carrierInfo: CarrierInfo): void {
    this.props.carrierInfo = carrierInfo;
    this.props.status = ShipmentStatus.PROCESSING;
  }

  public pickUp(): void {
    this.props.status = ShipmentStatus.PICKED_UP;
    this.props.pickedUpAt = new Date();
  }

  public setInTransit(): void {
    this.props.status = ShipmentStatus.IN_TRANSIT;
  }

  public deliver(): void {
    this.props.status = ShipmentStatus.DELIVERED;
    this.props.deliveredAt = new Date();
    this.props.actualDeliveryDate = new Date();
  }

  public fail(reason: string): void {
    this.props.status = ShipmentStatus.FAILED;
    this.props.notes = (this.props.notes || '') + `\nFailure Reason: ${reason}`;
  }

  public cancel(reason: string): void {
    this.props.status = ShipmentStatus.CANCELLED;
    this.props.cancelledAt = new Date();
    this.props.notes = (this.props.notes || '') + `\nCancellation Reason: ${reason}`;
  }

  public updateStatusDirect(status: ShipmentStatus, notes?: string): void {
    this.props.status = status;
    if (notes) {
      this.props.notes = (this.props.notes || '') + `\nUpdate Note: ${notes}`;
    }
  }


  get shipmentNumber(): string { return this.props.shipmentNumber; }
  get status(): ShipmentStatus { return this.props.status; }
  get orderId(): string { return this.props.orderId; }
  get type(): ShipmentType { return this.props.type; }
  get carrierInfo(): CarrierInfo | undefined { return this.props.carrierInfo; }
}
