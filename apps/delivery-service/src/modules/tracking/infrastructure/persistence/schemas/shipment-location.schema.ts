import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'shipment_locations', timestamps: true, _id: false })
export class ShipmentLocationDocument {
  @Prop({ type: String, required: true })
  _id!: string;
  @Prop({ required: true, index: true })
  shipmentId!: string;

  @Prop({
    type: { type: String, default: 'Point' },
    coordinates: [Number],
  })
  location!: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };

  @Prop()
  speed?: number;

  @Prop()
  heading?: number;

  @Prop()
  accuracy?: number;
}

export const ShipmentLocationSchema = SchemaFactory.createForClass(ShipmentLocationDocument);

ShipmentLocationSchema.index({ 'location': '2dsphere' });
ShipmentLocationSchema.index({ shipmentId: 1, createdAt: -1 });
// 30 gün sonra otomatik silme (TTL)
ShipmentLocationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
