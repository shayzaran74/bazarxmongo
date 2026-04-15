export class ShipmentResponseDto {
  id!: string;
  shipmentNumber!: string;
  type!: string;
  status!: string;
  orderId!: string;
  carrierCode?: string;
  carrierTrackingNumber?: string;
  carrierTrackingUrl?: string;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
}
