// apps/backend/src/modules/menu/application/commands/create-reservation.handler.ts
// BazarX-GO §9 — Uygulama içi rezervasyon sistemi

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException, ForbiddenException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IMenuPurchase, IMenuReservation } from '@barterborsa/shared-persistence';
import { CreateReservationCommand } from './create-reservation.command';

@CommandHandler(CreateReservationCommand)
export class CreateReservationHandler implements ICommandHandler<CreateReservationCommand> {
  private readonly logger = new Logger(CreateReservationHandler.name);

  constructor(
    @InjectModel('MenuPurchase')    private readonly purchaseModel:    Model<IMenuPurchase>,
    @InjectModel('MenuReservation') private readonly reservationModel: Model<IMenuReservation>,
  ) {}

  async execute(cmd: CreateReservationCommand) {
    const { userId, purchaseId, vendorId, date, timeSlot, partySize, note } = cmd;

    // QR sahiplik + durum kontrolü
    const purchase = await this.purchaseModel.findOne({ id: purchaseId }).lean();
    if (!purchase)               throw new NotFoundException('QR bulunamadı');
    if (purchase.userId !== userId) throw new ForbiddenException('Bu QR size ait değil');
    if (purchase.status !== 'ACTIVE' && purchase.status !== 'PARTIALLY_REDEEMED') {
      throw new BadRequestException('Bu QR ile rezervasyon yapılamaz');
    }
    if (purchase.qrExpiresAt && new Date() > purchase.qrExpiresAt) {
      throw new BadRequestException('QR süresi dolmuş');
    }

    // 1 QR = 1 rezervasyon
    const existing = await this.reservationModel.findOne({
      purchaseId,
      status: { $in: ['PENDING', 'CONFIRMED'] },
    });
    if (existing) throw new BadRequestException('Bu QR için zaten aktif bir rezervasyon var');

    // Geçmiş tarih kontrolü
    if (date <= new Date()) throw new BadRequestException('Rezervasyon tarihi geçmişte olamaz');

    const newId = new Types.ObjectId().toString();
    await this.reservationModel.create([{
      _id:       newId,
      id:        newId,
      purchaseId,
      userId,
      vendorId,
      date,
      timeSlot,
      partySize,
      note:      note ?? '',
      status:    'PENDING',
    }]);

    this.logger.log('Rezervasyon oluşturuldu', { userId, vendorId, date, timeSlot });

    return {
      success: true,
      data: {
        reservationId: newId,
        status:        'PENDING',
        message:       'Rezervasyon isteği restorана iletildi',
      },
    };
  }
}
