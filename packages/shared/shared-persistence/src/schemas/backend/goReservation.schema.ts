// packages/shared/shared-persistence/src/schemas/backend/goReservation.schema.ts
// Faz 7: GO Rezervasyon schema

import { createModelProxy } from '../../mongodb/model-proxy';
import { Schema, Types } from 'mongoose';

export const GoReservationStatus = [
  'PENDING', 'CONFIRMED', 'CANCELLED_BY_USER', 'CANCELLED_BY_RESTAURANT',
  'COMPLETED', 'NO_SHOW',
] as const;
export type GoReservationStatusType = typeof GoReservationStatus[number];

export interface IGoReservation {
  _id?: string;
  id: string;
  userId: string;
  restaurantId: string;
  menuPurchaseId?: string;
  partySize: number;
  reservationDate: Date;
  status: GoReservationStatusType;
  restaurantNote?: string;
  userNote?: string;
  confirmedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const GoReservationSchema = new Schema<IGoReservation>({
  _id: { type: String },
  id: { type: String, required: true },
  userId: { type: String },
  restaurantId: { type: String },
  menuPurchaseId: { type: String },
  partySize: { type: Number },
  reservationDate: { type: Date },
  status: { type: String, enum: GoReservationStatus, default: 'PENDING' },
  restaurantNote: { type: String },
  userNote: { type: String },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String },
}, {
  timestamps: true,
  collection: 'go_reservations',
});

GoReservationSchema.index({ restaurantId: 1, reservationDate: 1, status: 1 });
GoReservationSchema.index({ userId: 1, reservationDate: -1 });
GoReservationSchema.index({ reservationDate: 1 });

export const GoReservation = createModelProxy<IGoReservation>('GoReservation', GoReservationSchema);