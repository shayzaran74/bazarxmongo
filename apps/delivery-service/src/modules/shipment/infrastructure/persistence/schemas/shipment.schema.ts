import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ShipmentStatus } from '../../../domain/enums/shipment-status.enum';
import { ShipmentType } from '../../../domain/enums/shipment-type.enum';
import { CarrierCode } from '../../../domain/enums/carrier-code.enum';

@Schema({ collection: 'shipments', timestamps: true, _id: false })
export class ShipmentDocument {
  @Prop({ type: String, required: true })
  _id!: string;

  @Prop({ required: true, unique: true })
  shipmentNumber!: string;

  @Prop({ required: true, enum: ShipmentType })
  type!: string;

  @Prop({ required: true, enum: ShipmentStatus, default: 'PENDING' })
  status!: string;

  @Prop({ required: true })
  orderId!: string;

  @Prop()
  barterSessionId?: string;

  @Prop()
  barterPartNumber?: number;

  @Prop({ required: true })
  senderId!: string;

  @Prop({ required: true })
  receiverId!: string;

  @Prop({ required: true })
  vendorId!: string;

  @Prop({ type: Object, required: true })
  senderAddress: any;

  @Prop({ type: Object, required: true })
  receiverAddress: any;

  @Prop({ enum: CarrierCode })
  carrierCode?: string;

  @Prop()
  carrierName?: string;

  @Prop()
  carrierTrackingNumber?: string;

  @Prop()
  carrierTrackingUrl?: string;

  @Prop({ type: Object })
  packageInfo?: any;

  @Prop()
  estimatedDeliveryDate?: Date;

  @Prop()
  actualDeliveryDate?: Date;

  @Prop({ type: Number, default: 0 })
  shippingCost!: number;

  @Prop({ type: String, default: 'TRY' })
  currency!: string;

  @Prop()
  pickedUpAt?: Date;

  @Prop()
  deliveredAt?: Date;

  @Prop()
  cancelledAt?: Date;

  @Prop()
  notes?: string;

  @Prop({ type: Object })
  lastKnownLocation?: {
    type: 'Point';
    coordinates: [number, number];
    updatedAt: Date;
    description?: string;
  };
}

export const ShipmentSchema = SchemaFactory.createForClass(ShipmentDocument);

// Indexler
ShipmentSchema.index({ 'lastKnownLocation': '2dsphere' });
ShipmentSchema.index({ orderId: 1 });
ShipmentSchema.index({ senderId: 1 });
ShipmentSchema.index({ receiverId: 1 });
ShipmentSchema.index({ vendorId: 1 });
ShipmentSchema.index({ status: 1, createdAt: -1 });

