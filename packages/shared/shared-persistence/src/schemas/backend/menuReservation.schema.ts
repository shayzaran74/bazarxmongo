// packages/shared/shared-persistence/src/schemas/backend/menuReservation.schema.ts
// BazarX-GO §9 — Uygulama içi rezervasyon sistemi

import { Schema, model } from 'mongoose';

export const ReservationStatus = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'] as const;
export type ReservationStatusType = typeof ReservationStatus[number];

export interface IMenuReservation {
  _id?: string;
  id: string;
  purchaseId: string;   // MenuPurchase._id — hangi QR için rezervasyon
  userId: string;
  vendorId: string;
  date: Date;           // rezervasyon günü
  timeSlot: string;     // "19:00-20:00"
  partySize: number;    // kişi sayısı
  status: ReservationStatusType;
  note?: string;        // kullanıcı notu
  vendorNote?: string;  // restoran notu (red/onay sebebi)
  confirmedAt?: Date;
  cancelledAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const MenuReservationSchema = new Schema<IMenuReservation>({
  _id:         { type: String },
  id:          { type: String, required: true },
  purchaseId:  { type: String, required: true },
  userId:      { type: String, required: true },
  vendorId:    { type: String, required: true },
  date:        { type: Date,   required: true },
  timeSlot:    { type: String, required: true },
  partySize:   { type: Number, required: true, min: 1, max: 20 },
  status:      { type: String, enum: ReservationStatus, default: 'PENDING' },
  note:        { type: String },
  vendorNote:  { type: String },
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  completedAt: { type: Date },
  createdAt:   { type: Date },
  updatedAt:   { type: Date },
}, {
  timestamps: true,
  collection: 'menu_reservations',
});

MenuReservationSchema.index({ userId: 1, status: 1 });
MenuReservationSchema.index({ vendorId: 1, date: 1, status: 1 });
MenuReservationSchema.index({ purchaseId: 1 }, { unique: true }); // 1 QR = 1 rezervasyon
MenuReservationSchema.index({ status: 1, date: 1 }); // cleanup cron için

export const MenuReservation = model<IMenuReservation>('MenuReservation', MenuReservationSchema);
