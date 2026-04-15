import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TrackingEventType } from '../../../domain/enums/tracking-event-type.enum';

@Schema({ collection: 'tracking_events', timestamps: true, _id: false })
export class TrackingEventDocument {
  @Prop({ type: String, required: true })
  _id!: string;
  @Prop({ required: true, index: true })
  shipmentId!: string;

  @Prop({ required: true, enum: TrackingEventType })
  eventType!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: Object })
  location?: {
    type: 'Point';
    coordinates: [number, number];
    city?: string;
    district?: string;
    facility?: string;
  };

  @Prop()
  performedBy?: string;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export const TrackingEventSchema = SchemaFactory.createForClass(TrackingEventDocument);

TrackingEventSchema.index({ shipmentId: 1, createdAt: -1 });
TrackingEventSchema.index({ 'location': '2dsphere' });
